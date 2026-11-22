const $ = (id) => document.getElementById(id);
chrome.runtime.sendMessage({ type: "consume" }).then((result) => {
  if (!result) {
    $("title").textContent = "Nothing to hand over";
    $("text").textContent = "No fresh token is waiting. Start again from the extension button.";
    return;
  }
  if (result.sent) {
    $("title").className = "ok";
    $("title").textContent = "✔ Sent to GHunt";
    $("text").textContent = "Go back to your terminal: GHunt is finishing the login. You can close this tab.";
    return;
  }
  $("title").textContent = "GHunt isn't listening";
  $("text").textContent = "Couldn't reach GHunt on 127.0.0.1:60067. Copy the token instead (paste it right away).";
  $("manual").hidden = false;
  $("copy").onclick = async () => {
    await navigator.clipboard.writeText(result.payload);
    $("copy").textContent = "Copied ✔";
  };
});
