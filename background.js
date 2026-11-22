// ghunt-fixed Companion: gets a FRESH oauth_token and hands it to GHunt.
// The token is single-use: it is never cached beyond the current hand-off,
// and the cookie is deleted from the browser once captured.

const LOGIN_URL = "https://accounts.google.com/EmbeddedSetup";
const GHUNT = "http://127.0.0.1:60067";
const PREFIX = "oauth2_4/";

let pending = null; // { tabId, storeId, startedAt }

async function removeOauthCookies(storeId) {
  const cookies = await chrome.cookies.getAll({ name: "oauth_token", storeId });
  for (const c of cookies) {
    const host = c.domain.replace(/^\./, "");
    await chrome.cookies.remove({
      url: `https://${host}${c.path}`, name: c.name, storeId: c.storeId
    }).catch(() => {});
  }
}

async function startLogin(incognito) {
  await chrome.storage.session.remove("result").catch(() => {});
  let tab;
  if (incognito) {
    const win = await chrome.windows.create({ url: LOGIN_URL, incognito: true }).catch(() => null);
    if (!win) throw new Error("Allow the extension in private windows first (extension settings).");
    tab = win.tabs[0];
  } else {
    tab = await chrome.tabs.create({ url: "about:blank" });
  }
  // Wipe any old token in that cookie store BEFORE signing in, so we only ever see a new one.
  await removeOauthCookies(tab.cookieStoreId || undefined).catch(() => {});
  if (!incognito) await chrome.tabs.update(tab.id, { url: LOGIN_URL });
  pending = { tabId: tab.id, storeId: tab.cookieStoreId, startedAt: Date.now() };
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

chrome.cookies.onChanged.addListener(async ({ removed, cookie }) => {
  if (removed || cookie.name !== "oauth_token" || !cookie.value.startsWith(PREFIX)) return;
  if (!pending) return; // only react to a sign-in WE started
  const { tabId } = pending;
  pending = null;

  const token = cookie.value;
  await removeOauthCookies(cookie.storeId).catch(() => {});
  const { sent, payload } = await sendToGhunt(token);
  // Kept only in memory-backed session storage until the result page reads it.
  await chrome.storage.session.set({ result: { sent, payload: sent ? null : payload } });
  await chrome.tabs.update(tabId, { url: chrome.runtime.getURL("pages/done.html") }).catch(() =>
    chrome.tabs.create({ url: chrome.runtime.getURL("pages/done.html") }));
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
