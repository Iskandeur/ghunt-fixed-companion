# ghunt-fixed Companion

A maintained **Manifest V3** browser extension that logs [GHunt](https://github.com/mxrch/GHunt) and
[ghunt-fixed](https://github.com/Iskandeur/ghunt-fixed) in to Google in one click.

It replaces the original [GHunt Companion](https://github.com/mxrch/ghunt_companion), which is no
longer maintained, is still Manifest V2 (being phased out by Chrome), and **caches the single-use
`oauth_token`**. Once that token has been used, the original extension keeps resending it and GHunt
fails with `Expected "Token" in the response of the Android Master Authentication` /
`Error=BadAuthentication`, even in a private window.

## What's different

| | Original Companion | ghunt-fixed Companion |
|---|---|---|
| Manifest | V2 | **V3** (Chrome, Edge, Brave, Opera, Firefox 115+) |
| Token | Cached in extension storage, resent when stale | **Always fresh**: old cookie wiped before sign-in, new one deleted right after capture |
| What it sends to GHunt | 8 Google session cookies + token | **Only the `oauth_token`** (all GHunt needs) |
| Failure | Silent / stale token | Clear page, with a copy fallback |

It talks only to `accounts.google.com` and to GHunt on `127.0.0.1:60067`. Nothing is sent anywhere else.

## Usage

1. Run `ghunt login` and choose **3** (listening mode).
2. Click the extension icon → **Sign in & send to GHunt**, and sign in to Google.
3. Done: GHunt receives a fresh token and finishes the login.

If GHunt isn't listening, the extension shows a **Copy** button instead: run `ghunt login`, choose
**4**, and paste. Works with the original GHunt too (same options 1/2 there).

> ghunt-fixed can also log in **without any extension**: `ghunt login --browser`.

Use a secondary Google account if you can: GHunt makes automated requests with this session.

## Install

- Firefox: submitted to addons.mozilla.org, pending review (link here once it is live). Meanwhile, install from source below.
- Chrome / Edge / Brave / Opera: not on the stores yet; install from source below.
- From source: download this repo, then
  - Chrome/Edge/Brave: `chrome://extensions` → enable **Developer mode** → **Load unpacked** → pick the folder.
  - Firefox: `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on** → pick `manifest.json`.

## Build

```bash
python build.py   # -> dist/ghunt-fixed-companion-<version>.zip, ready for the stores
```

## Credits & license

Inspired by the original [GHunt Companion](https://github.com/mxrch/ghunt_companion) by
[mxrch](https://github.com/mxrch), creator of GHunt. Rewritten from scratch for Manifest V3.
Licensed under AGPL-3.0, like GHunt and ghunt-fixed.
