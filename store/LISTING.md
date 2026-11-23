# Store listing texts

## Name
ghunt-fixed Companion

## Summary (≤ 132 chars, Chrome/Edge "short description", AMO "summary")
One-click Google login for GHunt and ghunt-fixed. Always fetches a fresh token, never caches it. Manifest V3 successor to GHunt Companion.

## Description
ghunt-fixed Companion logs the open-source OSINT tool GHunt (and its maintained fork ghunt-fixed) in to your Google account in one click.

How it works:
1. Run `ghunt login` and choose the listening mode.
2. Click the extension button and sign in to Google.
3. The extension hands a fresh, single-use token to GHunt on your own computer (127.0.0.1). Done.

Why this extension:
• Manifest V3, maintained. The original GHunt Companion is Manifest V2 and no longer updated.
• Always a fresh token. The original extension caches the single-use token and resends it once it has been used, which makes GHunt fail with "BadAuthentication". This one deletes the old token before every sign-in and the new one right after use.
• Minimal data: it only hands the token to GHunt, not your session cookies.
• Local only: no server, no analytics. Open source (AGPL-3.0): https://github.com/Iskandeur/ghunt-fixed-companion

Tip: use a secondary Google account with GHunt.

Not affiliated with Google. Inspired by the original GHunt Companion by mxrch, creator of GHunt.

## Category
AMO: Privacy & Security (or Developer Tools) · Edge/Chrome: Developer Tools

## Permission justifications (Chrome "Privacy practices" tab / Edge notes for certification)
- **cookies**: reads the `oauth_token` cookie that Google sets on accounts.google.com at the end of the sign-in the user starts, then deletes it. No other cookie is read.
- **storage**: keeps the "sign-in in progress" flag and the token in session (in-memory) storage for a few seconds, because the Manifest V3 service worker can be stopped while the user signs in. Cleared after hand-off.
- **tabs**: opens the Google sign-in tab, then shows the result page in that same tab.
- **Host https://accounts.google.com/***: required to read and delete that one cookie.
- **Host http://127.0.0.1/***: sends the token to GHunt running locally on the user's own computer (port 60067). No remote server.
- **Single purpose**: let the GHunt command-line tool authenticate to the user's own Google account.
- **Remote code**: none. **Data collection**: none (token only goes to localhost).

## Privacy policy URL
https://github.com/Iskandeur/ghunt-fixed-companion/blob/main/PRIVACY.md

## Support / homepage
https://github.com/Iskandeur/ghunt-fixed-companion

## Notes to reviewer (AMO "Notes for reviewers" / Edge "Notes for certification")
To test: install GHunt or ghunt-fixed (`pipx install git+https://github.com/Iskandeur/ghunt-fixed.git`), run `ghunt login`, choose 3 (listening mode), click the extension button and sign in with any Google account. Without GHunt running, the extension shows a "Copy" fallback page instead. The source is plain JavaScript, not minified or bundled; the uploaded zip is built with `python build.py` from the public repo.

## Assets needed
- Icon 128×128: icons/128.png
- Screenshots 1280×800 (Chrome/Edge, at least 1): popup + "Sent to GHunt" page. To capture after a real login.
- Edge: optional 440×280 promo tile.
