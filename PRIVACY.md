# Privacy policy — ghunt-fixed Companion

_Last updated: 2026-11-23_

ghunt-fixed Companion collects **no data**. It has no server, no analytics and no tracking.

**What it touches, and why**
- **The `oauth_token` cookie of `accounts.google.com`**, only after you click the extension button and
  sign in to Google yourself. This single-use token is what GHunt needs to log in.
- **`http://127.0.0.1:60067`**, i.e. GHunt running on your own computer. The token is sent there and
  nowhere else. It never leaves your machine through this extension.

**Storage**
- The token is kept only in the browser's in-memory session storage, for the few seconds between
  capture and hand-off (or until you copy it), then deleted. It is cleared when the browser closes.
- The `oauth_token` cookie is deleted from the browser right after capture, and any old one is
  deleted before each sign-in.
- No other cookie, browsing history or personal data is read, stored or transmitted.

**Third parties:** none. **Sale or sharing of data:** none.

Source code: https://github.com/Iskandeur/ghunt-fixed-companion. Questions:
https://github.com/Iskandeur/ghunt-fixed-companion/issues
