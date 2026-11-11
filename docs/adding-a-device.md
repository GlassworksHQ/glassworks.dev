# Adding a device to the catalog

Each panel on [glassworks.dev/frames](https://www.glassworks.dev/frames) is one entry in
[`src/lib/devices.ts`](../src/lib/devices.ts). The landing page, the catalog, both comparison tables
and the device's own page (`/frames/<slug>`) are built from it.

> Later, frames will publish this data themselves in `frame.json` and the catalog will read it from
> their repos, so you won't need a pull request here. Until the core is split into frames, it's
> this file.

## 1. Write the entry

Copy an existing device and change every field. Fields, in order:

| Field | What to put |
|---|---|
| `slug` | URL name, lowercase with hyphens, e.g. `nspanel-pro` |
| `name` | The product's name, e.g. `Sonoff NSPanel Pro` |
| `aka` | Optional. Rebadges or other names it's sold under |
| `status` | `works` only when it installs and runs today; otherwise `planned` |
| `shape` | The 3D model's form factor: `s1`, `square` or `tablet`. See step 2 for a new one |
| `summary` | One sentence on why this device is interesting |
| `project` | Optional. The frame's own project and its link |
| `specs` | Hardware rows. Labels with icons: `Size`, `SoC`, `Android`, `Screen`, `Radio`, `Presence`, `Audio`, `Extras`, `Root` |
| `panes` | For each pane: `works`, `planned`, `depends`, `unknown` or `no`, with a short `note` when it isn't `works` |
| `install` | One sentence on how it installs, plus `href` to Kiln once it's installable |
| `ratings` | The nine install ratings, see below |
| `ratingsNote` | Optional. One sentence of extra context |
| `unverified` | `true` if any of this comes from writeups rather than a real device |

### Install ratings

Every device has all nine. Use `unknown` (shown as "Not checked") rather than guessing, and add a
short `detail` where it helps.

| Rating | Values |
|---|---|
| Difficulty | `preinstalled` · `easy` · `medium` · `hard` |
| Reversible | `yes` · `partly` · `no` |
| Modifies Android | `yes` · `no` |
| Root | `required` · `already` · `none` |
| Opens the device | `yes` · `no` |
| Vendor apps | `kept` · `disabled` · `partly` · `removed` |
| Wipes the device | `yes` · `no` |
| Backup | `automatic` · `manual` · `none` · `planned` |
| Updates | `ha` · `manual` · `planned` |

Difficulty means:

- **Pre-installed:** the device ships with Glassworks.
- **Easy:** install from the browser or as an app. The device stays closed.
- **Medium:** you open the device, for a screw or a hidden button. No soldering.
- **Hard:** soldering, test pads or a UART adapter.

## 2. A new form factor

If none of `s1`, `square` or `tablet` fits, add one entry to `SPECS` in
[`src/components/deviceGeometry.ts`](../src/components/deviceGeometry.ts) and its name to
`ModelShape`. That's the only place: the 3D sides and the front glass both read it.

Sizes are in stage units (the stage is 100 wide, 50 tall). Scale from the real dimensions: pick a
width `w` that fits (most are 40 to 75), then derive the rest in proportion. For the S1 Plus, 172 ×
86 × 12 mm at `w: 74` gives `ar: 2` and `d: 5.2`. No vendor logos or branding on the model.

A new shape with a different screen layout (like the square panel's) also needs a
`.model[data-shape="…"]` block for the example dashboard in `DeviceModel.module.css`.

## 3. Check it

```sh
pnpm dev     # then open /frames and /frames/<slug>
pnpm lint
pnpm build   # the new device page must be listed as static
```

Look at the device page in light and dark mode and at phone width (about 375 px). Nothing should
scroll sideways.

## 4. Open a pull request

Say where each fact comes from: your own device, the vendor's spec sheet, or a writeup (link it).
A listing requires the **Built on Glassworks** badge in your frame's README and on its About screen;
see [glassworks.dev/brand#badge](https://www.glassworks.dev/brand#badge).
