# GO_LIVE checklist

- Remove `<meta name="robots" content="noindex,nofollow">` from every v8.0 page at launch.
- When CSS or JS changes, bump `ASSET_VERSION` in `v8.0/check/go-live.py` and set that same `?v=` on every local stylesheet and script in the public HTML (root index, coming-soon, about, splash-v7, and v8.0).
