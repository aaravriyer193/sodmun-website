# SODMUN website

The website for Summit of Diplomacy Model United Nations. It's a static site with no build step.

- Live: https://sodmun.vercel.app
- Content (committees, secretariat, partners, schedule, application links): `js/data.js`
- Styles: `css/site.css`

## Run locally

```bash
python3 -m http.server 4340
```

## Deploy

```bash
vercel deploy --prod
```
