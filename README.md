# FACE4663 Website

Responsive static landing page for **face4663.xyz**.

## Included

- Full-screen mascot backgrounds across every section
- Falling Robin Hood feathers
- Falling round mascot coins with randomized sizes
- Responsive desktop and mobile layouts
- FACE4663 story and identity sections
- Contract-address artifact using lowercase `face4663`
- Copy-contract interactions
- Live DEX chart embed area
- Community section
- Reduced-motion accessibility support

## Update the live data

Open `script.js` and edit the `CONFIG` object:

```js
const CONFIG = {
  contractAddress: "0x...face4663",
  explorerUrl: "https://...",
  chartEmbedUrl: "https://...",
  fullChartUrl: "https://...",
  tradeUrl: "https://...",
  xUrl: "https://x.com/..."
};
```

The live chart section remains in a clear placeholder state until `chartEmbedUrl` is filled.

## Run locally

You can open `index.html` directly, but a local server is recommended:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Deploy

This is a plain static site and can be deployed to:

- Cloudflare Pages
- GitHub Pages
- Netlify
- Vercel

For Cloudflare Pages:

- Framework preset: None
- Build command: leave empty
- Build output directory: `/`
