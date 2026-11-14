# glassworks.dev

The Glassworks project site: the landing page and `/brand`. Docs will join this app later; Kiln
(the installer) is a separate app at `kiln.glassworks.dev`. See `planning/site.md` for what goes
where.

## Develop

```sh
git submodule update --init   # vendor/s1-unleashed: the frames' data and the frame card
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # every route is static
pnpm lint
pnpm brand        # regenerate the mark files, badges and banners in public/brand/
pnpm brand:raster # re-render the PNGs (app icon, GitHub avatar, social images) with headless Chrome
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
  Mark.tsx             the mark (three plates, the top one lit): variant lit | ember | mono, cut full | small
  Glyphs.tsx           Frame, Pane, Kiln and pane icons on a 24 grid
  GlassTile.tsx        the 2:1 night tile with the light sweep
  FrameCard.tsx        the catalog card and a frame page's 3D model, from @glassworks/frame-card
src/lib/site.ts        links and panes
src/lib/frames.ts      the frame catalog: every frames/<id>/design/frame.json in vendor/s1-unleashed
src/lib/frameText.ts   the site's words for that data: install ratings, pane support
src/lib/clarity.ts     each frame's Clarity grade, worked out from its clarity.json at build time
src/components/clarity/  the Clarity seal, the frame page's panel, the catalog line
scripts/brand/banner.mjs  the part banner every banner shares, the mark, each part's light
scripts/brand/frame.mjs   a frame's README banner, banner-frame-<id>, drawn from its frame.json
src/lib/frameBanners.ts   checks at build time that public/brand/ has each frame's current banner
scripts/brand/clarity.mjs the Clarity README badge, served per frame at /frames/<id>/clarity-on-*.svg
tests/clarity/         made-up Clarity summaries for working on the site (CLARITY_FIXTURES)
vendor/s1-unleashed/   the main repo, a submodule pinned to a commit (don't install inside it)
src/lib/libraries.json the standalone libraries, one banner each
scripts/brand/         `pnpm brand` and `pnpm brand:raster`: every brand file, from src/lib/markGeometry.ts
public/brand/          downloadable SVGs
```

## Adding a device

Frames live in the main repo, [GlassworksHQ/glassworks](https://github.com/GlassworksHQ/glassworks):
add its `frames/<id>/design/frame.json` there, then move this repo's submodule pin. See
[docs/adding-a-device.md](docs/adding-a-device.md).

## Clarity

Clarity is the Glassworks wall-panel performance grade, A+ to E (docs/perf.md in the main repo). A
frame stores its measurements only, in `frames/<id>/design/clarity.json`; the site works the letter
out at build time with the main repo's `tools/perf/grade.ts` and `rubric.json`, from the same pinned
submodule. No summary reads "Not measured yet"; a summary from another measuring protocol reads
"Re-measure". Each frame also gets a README badge at `/frames/<id>/clarity-on-dark.svg` and
`-on-light.svg`, worked out the same way, so a README never stores the letter either. The frame page
has the snippet to copy.

To see the graded states before a frame has a summary: `CLARITY_FIXTURES=tests/clarity/sample pnpm dev`
(see [tests/clarity/README.md](tests/clarity/README.md)). The samples are ignored on Vercel.

## Design system

The tokens, `<Mark>` and the glyphs are written so they can move unchanged into a shared
`@glassworks/brand` package when Kiln is rebuilt in Next.js. Until then this repo is their home.
Use unstyled primitives (Radix or Base UI) for anything that needs real accessibility work, styled
with the tokens, rather than a styled kit.

## Deploy

Static output on Vercel, with `glassworks.dev` pointed at it from Cloudflare DNS.

Vercel does not build on pushes (`git.deploymentEnabled: false` in `vercel.json`), so branches and
PRs get no preview. [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) calls a Vercel
deploy hook (the `VERCEL_DEPLOY_HOOK` secret) on a push to `main` that changes the site, not just
Markdown. To redeploy by hand, run that workflow from the Actions tab.
