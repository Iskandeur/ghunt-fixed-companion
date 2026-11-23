// ghunt-fixed Companion: gets a FRESH oauth_token and hands it to GHunt.
// The token is single-use: it is never cached beyond the current hand-off,
// and the cookie is deleted from the browser once captured.
//
// MV3 note: the service worker is killed after ~30s idle, i.e. while the user is
// signing in. So nothing may live in globals: the "sign-in in progress" state is
// kept in chrome.storage.session (memory-backed, cleared when the browser closes).

const LOGIN_URL = "https://accounts.google.com/EmbeddedSetup";
const GHUNT = "http://127.0.0.1:60067";
const PREFIX = "oauth2_4/";
const PENDING_TTL_MS = 30 * 60 * 1000;

const getPending = async () => {
  const { pending } = await chrome.storage.session.get("pending");
  if (pending && Date.now() - pending.startedAt > PENDING_TTL_MS) {
    await chrome.storage.session.remove("pending");
    return null;
  }
  return pending || null;
};

async function removeOauthCookies(storeId) {
  const query = { name: "oauth_token" };
  if (storeId) query.storeId = storeId;
  const cookies = await chrome.cookies.getAll(query);
  for (const c of cookies) {
    const host = c.domain.replace(/^\./, "");
    await chrome.cookies.remove({
      url: `https://${host}${c.path}`, name: c.name, storeId: c.storeId
    }).catch(() => {});
  }
}

async function startLogin(incognito) {
  await chrome.storage.session.remove(["result", "pending"]);
  let tab;
  if (incognito) {
    const win = await chrome.windows.create({ url: "about:blank", incognito: true }).catch(() => null);
    if (!win) throw new Error("Allow the extension in private windows first (extension settings).");
    tab = win.tabs[0];
  } else {
    tab = await chrome.tabs.create({ url: "about:blank" });
  }
  const storeId = tab.cookieStoreId || (incognito ? "1" : "0");
  // Wipe any old token in that cookie store BEFORE signing in, so we only ever see a new one.
  await removeOauthCookies(storeId).catch(() => {});
  await chrome.storage.session.set({ pending: { tabId: tab.id, storeId, startedAt: Date.now() } });
  await chrome.tabs.update(tab.id, { url: LOGIN_URL });
}

async function sendToGhunt(token) {
  const payload = btoa(JSON.stringify({ oauth_token: token }));
  try {
    const ping = await fetch(`${GHUNT}/ghunt_ping`);
    if ((await ping.text()) !== "ghunt_pong") return { sent: false, payload };
    const res = await fetch(`${GHUNT}/ghunt_feed`, { method: "POST", body: payload });
    return { sent: (await res.text()) === "ghunt_received_ok", payload };
  } catch (e) {
    return { sent: false, payload };
  }
}

let handling = false;
async function handleToken(token, storeId) {
  if (handling) return;
  const pending = await getPending();
  if (!pending) return; // only react to a sign-in WE started
  handling = true;
  try {
    await chrome.storage.session.remove("pending");
    await removeOauthCookies(storeId || pending.storeId).catch(() => {});
    const { sent, payload } = await sendToGhunt(token);
    await chrome.storage.session.set({ result: { sent, payload: sent ? null : payload } });
    const page = chrome.runtime.getURL("pages/done.html");
    await chrome.tabs.update(pending.tabId, { url: page }).catch(() => chrome.tabs.create({ url: page }));
  } finally {
    handling = false;
  }
}

// Main path: Google sets the cookie at the end of the sign-in.
chrome.cookies.onChanged.addListener(({ removed, cookie }) => {
  if (removed || cookie.name !== "oauth_token" || !cookie.value.startsWith(PREFIX)) return;
  handleToken(cookie.value, cookie.storeId);
});

// Fallback: whenever the sign-in tab finishes loading a Google page, look for the cookie.
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (info.status !== "complete" || !tab.url || !tab.url.startsWith("https://accounts.google.com/")) return;
  const pending = await getPending();
  if (!pending || pending.tabId !== tabId) return;
  const cookies = await chrome.cookies.getAll({ name: "oauth_token", storeId: pending.storeId });
  const fresh = cookies.find((c) => c.value.startsWith(PREFIX));
  if (fresh) handleToken(fresh.value, fresh.storeId);
});

chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  if (msg.type === "start") {
    startLogin(!!msg.incognito).then(() => reply({ ok: true }), (e) => reply({ ok: false, error: e.message }));
    return true;
  }
  if (msg.type === "consume") {
    chrome.storage.session.get("result").then(async ({ result }) => {
      await chrome.storage.session.remove("result");
      reply(result || null);
    });
    return true;
  }
});
