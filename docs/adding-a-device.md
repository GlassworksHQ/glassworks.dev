# Adding a device to the catalog

Each panel on [glassworks.dev/frames](https://www.glassworks.dev/frames) is a **frame** in the main
repo, [GlassworksHQ/glassworks](https://github.com/GlassworksHQ/glassworks). This
site has no device list of its own: the landing page, the catalog, both comparison tables, the pane
pages and each frame's page (`/frames/<id>`) are built from the frames' `design/frame.json` files,
and the cards and 3D models are drawn by the main repo's `@glassworks/frame-card`, the same card as
Kiln's picker.

Both come in through one git submodule, `vendor/s1-unleashed`, pinned to a commit of the main repo.

## 1. Add the frame in the main repo

Add `frames/<id>/design/frame.json` there. Its fields (name, status, specs, panes, the nine install
ratings, the 3D model in millimetres) are in that repo's
[`frames/README.md`](https://github.com/GlassworksHQ/glassworks/blob/main/frames/README.md).
Use `unknown` for anything nobody has checked on real hardware: the site shows it as "Not checked".
Set `unverified` when any of it comes from writeups rather than a real device.

Say where each fact comes from: your own device, the vendor's spec sheet, or a writeup (link it).
A listing requires the **Built on Glassworks** badge in your frame's README and on its About screen;
see [glassworks.dev/brand#badge](https://www.glassworks.dev/brand#badge).

Give it a `tagline` (one line, at most 50 characters) and, if its name starts with the maker's,
a `brand` (`Aqara` in `Aqara S1 Plus`). They draw the frame's README banner, `banner-frame-<id>`
(step 2). A frame without a tagline gets no banner.

Its `render`, a `.webp` of a dashboard next to `frame.json` (made in the main repo by
`tools/showcase/render.mjs`), is what its card and page show on the device's screen; without one,
they show an example dashboard. The site serves it at `/frames/<id>/render.webp`.

Its Clarity grade comes from `frames/<id>/design/clarity.json` once the frame has been measured
(the main repo's docs/perf.md, "The summary"). Until then the site says "Not measured yet".

## 2. Move the site's pin

Once that merges, point the submodule at the main repo's new commit, in a pull request here:

```sh
git submodule update --init
git -C vendor/s1-unleashed fetch origin main
git -C vendor/s1-unleashed checkout <commit>
git add vendor/s1-unleashed
```

Then redraw the brand files: every frame with a tagline gets `public/brand/banner-frame-<id>-on-*.svg`,
its device drawn from `model` (`scripts/brand/frame.mjs`). Commit them in the same pull request; the
build fails if a frame's banner isn't the one its `frame.json` draws, or if its name or tagline
doesn't fit.

```sh
pnpm brand
git add public/brand
```

Don't run `npm install` or `pnpm install` inside `vendor/s1-unleashed`: the card's imports and React
resolve from this repo's `node_modules`, and a second React would break it.

## 3. Check it

```sh
pnpm dev     # then open /frames and /frames/<id>
pnpm lint
pnpm build   # the new frame's page must be listed as static, and its banner must match
```

Look at the frame's page in light and dark mode and at phone width (about 375 px). Nothing should
scroll sideways.

The site's own words for the data (the rating names and values, pane support, the difficulty
legend) are in [`src/lib/frameText.ts`](../src/lib/frameText.ts). A new rating value needs its words
there.
