# glassworks.dev

The Glassworks project site: the landing page and `/brand`. Docs will join this app later; Kiln
(the installer) is a separate app at `kiln.glassworks.dev`. See `planning/site.md` for what goes
where.

## Develop

```sh
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # every route is static
pnpm lint
pnpm brand      # regenerate the part badges and banners in public/brand/
```

Opening `pnpm dev` from another machine (a tailnet name, a LAN IP)? Next.js blocks its dev scripts
for unknown hosts, so the page renders but nothing interactive works. List the host in a git-ignored
`.env.local` and restart the dev server:

```sh
DEV_ORIGINS=my-mac.tailnet.example,192.168.1.20
```

Next.js 16 (App Router) with plain CSS: design tokens in `src/app/globals.css`, CSS modules per
page and component. There's no UI library on purpose; see "Design system" below.

## Layout

```
src/app/
  globals.css          design tokens + the .glass surface (lift into @glassworks/brand later)
  layout.tsx           Inter + JetBrains Mono, header, footer, shared SVG gradients
  page.tsx             landing page
  brand/page.tsx       design language and downloads
  icon.svg             favicon (small cut, follows OS theme)
  apple-icon.png       180px, full-bleed
src/components/
  Mark.tsx             the mark: variant lit | ember | mono, cut full | small
  Glyphs.tsx           Frame, Pane, Kiln and pane icons on a 24 grid
  GlassTile.tsx        the 2:1 night tile with the light sweep
  DeviceModel.tsx      3D device mockup: CSS front glass + computed SVG sides
  deviceGeometry.ts    form factors (SPECS), projection, side faces, centring
src/lib/site.ts        links and panes
src/lib/devices.ts     the device catalog: specs, pane support, install ratings
src/lib/libraries.json the standalone libraries, one banner each
scripts/brand/         `pnpm brand`: draws the core/pane/Kiln badges and the banners
public/brand/          downloadable SVGs
```

## Adding a device

See [docs/adding-a-device.md](docs/adding-a-device.md): one entry in `src/lib/devices.ts`, and one in
`SPECS` (`src/components/deviceGeometry.ts`) for a new form factor.

## Design system

The tokens, `<Mark>` and the glyphs are written so they can move unchanged into a shared
`@glassworks/brand` package when Kiln is rebuilt in Next.js. Until then this repo is their home.
Use unstyled primitives (Radix or Base UI) for anything that needs real accessibility work, styled
with the tokens, rather than a styled kit.

## Deploy

Static output on Vercel, with `glassworks.dev` pointed at it from Cloudflare DNS.
