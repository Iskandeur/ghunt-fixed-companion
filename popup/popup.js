const msg = document.getElementById("msg");
const HOSTS = { origins: ["https://accounts.google.com/*", "http://127.0.0.1/*"] };

async function start(incognito) {
  msg.textContent = "";
  // Firefox (MV3) treats host permissions as optional: ask for them on the user's click.
  const granted = await chrome.permissions.contains(HOSTS) || await chrome.permissions.request(HOSTS);
  if (!granted) { msg.className = "err"; msg.textContent = "Permission refused: the extension can't read the token."; return; }
  const res = await chrome.runtime.sendMessage({ type: "start", incognito });
  if (!res || !res.ok) { msg.className = "err"; msg.textContent = (res && res.error) || "Couldn't start."; return; }
  window.close();
}
document.getElementById("start").onclick = () => start(false);
document.getElementById("private").onclick = () => start(true);
