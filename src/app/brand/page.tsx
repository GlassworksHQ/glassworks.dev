import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { GlassTile } from "@/components/GlassTile";
import { Mark } from "@/components/Mark";
import { Switch } from "@/components/Switch";
import { BaseGlyph, FrameGlyph, KilnGlyph, MicGlyph, MusicGlyph, PaneGlyph, RadioGlyph } from "@/components/Glyphs";
import s from "./brand.module.css";

export const metadata: Metadata = {
  title: "Brand",
  description: "The Glassworks mark, colour, type and motion, with SVGs.",
};

const swatches: { group: string; items: { name: string; value: string; fill: string }[] }[] = [
  {
    group: "Ground",
    items: [
      { name: "Night", value: "#0a0b0f", fill: "#0a0b0f" },
      { name: "Daylight", value: "#eceef2", fill: "#eceef2" },
      { name: "Glass", value: "white 4.5% · edge 8%", fill: "linear-gradient(rgba(255,255,255,.045), rgba(255,255,255,.045)), #0a0b0f" },
    ],
  },
  {
    group: "Ink",
    items: [
      { name: "Text", value: "#f4f4f5", fill: "#f4f4f5" },
      { name: "Muted", value: "#a1a1aa", fill: "#a1a1aa" },
      { name: "Faint, labels", value: "#63636b", fill: "#63636b" },
    ],
  },
  {
    group: "Light",
    items: [
      { name: "Sky", value: "#38bdf8", fill: "#38bdf8" },
      { name: "Violet", value: "#a78bfa", fill: "#a78bfa" },
      { name: "Lit, 135°", value: "sky → violet", fill: "linear-gradient(135deg, #38bdf8, #a78bfa)" },
    ],
  },
  {
    group: "Heat · Kiln only",
    items: [
      { name: "Glow", value: "#fdba74", fill: "#fdba74" },
      { name: "Ember", value: "#f43f5e", fill: "#f43f5e" },
      { name: "Fired", value: "glow → ember", fill: "linear-gradient(135deg, #fdba74, #f43f5e)" },
    ],
  },
  {
    group: "Status",
    items: [
      { name: "Ready", value: "#34d399", fill: "#34d399" },
      { name: "Working", value: "#fbbf24", fill: "#fbbf24" },
      { name: "Problem", value: "#fb7185", fill: "#fb7185" },
    ],
  },
];

const downloads = [
  { file: "lockup-on-dark.svg", what: "Mark and wordmark, dark backgrounds" },
  { file: "lockup-on-light.svg", what: "Mark and wordmark, light backgrounds" },
  { file: "wordmark.svg", what: "Wordmark alone, follows currentColor" },
  { file: "lockup-kiln-on-dark.svg", what: "Glassworks Kiln lockup" },
  { file: "mark-on-dark.svg", what: "Mark for dark backgrounds" },
  { file: "mark-on-light.svg", what: "Mark for light backgrounds" },
  { file: "mark-mono.svg", what: "One colour, follows currentColor" },
  { file: "kiln-on-dark.svg", what: "Kiln mark, ember pane" },
  { file: "app-icon.svg", what: "App icon, 512 × 512" },
];

function Section({ id, label, title, lede, children }: { id: string; label: string; title: string; lede?: ReactNode; children: ReactNode }) {
  return (
    <section className={s.section} aria-labelledby={id}>
      <div className={s.rail}>
        <span className="label">{label}</span>
      </div>
      <div className={s.body}>
        <div className={s.lede}>
          <h2 id={id} className={s.h2}>
            {title}
          </h2>
          {lede && <p>{lede}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

export default function BrandPage() {
  return (
    <div className={`wrap ${s.page}`}>
      <header className={s.hero}>
        <div className={s.heroCopy}>
          <span className="label">Brand</span>
          <h1 className={s.h1}>A frame of panes, one of them lit.</h1>
          <p className={s.heroLede}>
            Taken from S1 Unleashed&rsquo;s boot screen: dark glass, thin Inter, sky-to-violet light.
          </p>
        </div>
        <GlassTile label="Open core for wall panels" status="Apache-2.0" footLeft="Frames · Panes · Kiln" footRight="glassworks.dev" replay />
      </header>

      <Section
        id="mark"
        label="The mark"
        title="2:1, like the panel."
        lede="Three panes in a frame. Only the big one is lit. Every gap is 6 units."
      >
        <div className={`glass ${s.construct}`}>
          <svg viewBox="0 0 170 90" role="img" aria-label="Construction: a 2:1 frame with radius 14 and stroke 4, three panes separated by 6-unit gaps">
            <g transform="translate(25 15)" style={{ color: "var(--fg)" }}>
              <rect x="2" y="2" width="116" height="56" rx="14" fill="none" stroke="currentColor" strokeWidth="4" />
              <rect x="10" y="10" width="54" height="40" rx="6" fill="url(#gw-lit)" />
              <rect x="70" y="10" width="40" height="17" rx="6" fill="currentColor" fillOpacity={0.26} />
              <rect x="70" y="33" width="40" height="17" rx="6" fill="currentColor" fillOpacity={0.26} />
            </g>
            <path className={s.dim} d="M25 9 H145 M25 7 V11 M145 7 V11" />
            <text className={s.dimt} x="85" y="6.5" textAnchor="middle">
              120 · 2 : 1, the panel
            </text>
            <path className={s.dim} d="M151 15 V75 M149 15 H153 M149 75 H153" />
            <text className={s.dimt} x="154" y="46.5">
              60
            </text>
            <circle className={s.guide} cx="41" cy="31" r="14" />
            <path className={s.dim} d="M14 21 H29 L31 23" />
            <text className={s.dimt} x="6" y="19.5">
              r 14
            </text>
            <path className={s.guide} d="M89 75 V65 M95 75 V65" />
            <path className={s.dim} d="M89 80 H95 M89 78 V82 M95 78 V82" />
            <text className={s.dimt} x="92" y="87" textAnchor="middle">
              6
            </text>
            <path className={s.dim} d="M20 78 H25 L26.5 74" />
            <text className={s.dimt} x="2" y="79">
              stroke 4
            </text>
            <path className={s.guide} d="M62 82 V65" />
            <text className={s.dimt} x="62" y="87" textAnchor="middle">
              lit pane 54 × 40
            </text>
          </svg>
        </div>
        <div className={s.meaning}>
          <div>
            <h3 className={s.chip}>
              <span className={s.sw} style={{ border: "2px solid var(--fg)" }} />
              Frame
            </h3>
            <p>The device.</p>
          </div>
          <div>
            <h3 className={s.chip}>
              <span className={s.sw} style={{ background: "var(--lit-gradient)" }} />
              Lit pane
            </h3>
            <p>The dashboard. The only colour in the mark.</p>
          </div>
          <div>
            <h3 className={s.chip}>
              <span className={s.sw} style={{ background: "color-mix(in srgb, var(--fg) 26%, transparent)" }} />
              Clear panes
            </h3>
            <p>Plugins.</p>
          </div>
        </div>
        <div className={`glass ${s.sizes}`}>
          {[192, 96, 48].map((w) => (
            <figure key={w}>
              <Mark width={w} className={s.ink} />
              <figcaption>{w} px</figcaption>
            </figure>
          ))}
          <figure>
            <Mark cut="small" width={32} className={s.ink} />
            <figcaption>32 · small cut</figcaption>
          </figure>
          <figure>
            <Mark cut="small" width={20} className={s.ink} />
            <figcaption>20 · favicon</figcaption>
          </figure>
        </div>
        <p className={s.note}>
          Under 40 px wide, use the small cut: heavier frame, clear panes merged.
        </p>
        <div className={s.grounds}>
          <div className={`${s.ground} ${s.gNight}`}>
            <Mark />
            <span className="label">On night</span>
          </div>
          <div className={`${s.ground} ${s.gDay}`}>
            <Mark />
            <span className="label">On daylight</span>
          </div>
          <div className={`${s.ground} ${s.gMono}`}>
            <Mark variant="mono" />
            <span className="label">One colour</span>
          </div>
        </div>
      </Section>

      <Section
        id="lockups"
        label="Lockups"
        title="One spelling: Glassworks."
        lede={
          <>
            Inter Light, −2.5% tracking, sentence case. Mark at 1.6 × cap height.
          </>
        }
      >
        <div className={s.lockups}>
          <div className={`glass ${s.lockup}`}>
            <span className="label">Primary</span>
            <div className={s.row}>
              <Mark width={76} className={s.ink} />
              <span className={s.word} style={{ fontSize: 42 }}>
                Glassworks
              </span>
            </div>
          </div>
          <div className={`glass ${s.lockup}`}>
            <span className="label">App icon, launcher, avatar</span>
            <div className={s.row} style={{ alignItems: "end", gap: 20 }}>
              <div className={s.appicon}>
                <Mark />
              </div>
              <div className={`${s.appicon} ${s.appiconSm}`}>
                <Mark />
              </div>
              <p className={s.note} style={{ maxWidth: "22ch" }}>
                Always on dark, in either theme.
              </p>
            </div>
          </div>
          <div className={`glass ${s.lockup}`}>
            <span className="label">Kiln, the installer</span>
            <div className={s.row}>
              <Mark variant="ember" width={64} className={s.ink} />
              <span className={s.word} style={{ fontSize: 32 }}>
                Glassworks <span className={s.sub}>Kiln</span>
              </span>
            </div>
            <p className={s.note}>
              The lit pane turns ember. Only Kiln uses it.
            </p>
          </div>
          <div className={`glass ${s.lockup}`}>
            <span className="label">For frame projects</span>
            <div className={s.row}>
              <span className={s.badge}>
                <Mark width={30} className={s.ink} />
                Built on <b>Glassworks</b>
              </span>
            </div>
            <p className={s.note}>
              For frame projects&rsquo; READMEs and sites.
            </p>
          </div>
        </div>
      </Section>

      <Section
        id="colour"
        label="Colour"
        title="Colour means something."
        lede="Greys from the S1 onboarding screen. Sky and violet mean on. Ember means Kiln. Status colours mean status."
      >
        <div className={s.palette}>
          {swatches.map((g) => (
            <div key={g.group} className={s.pgroup}>
              <span className="label">{g.group}</span>
              <div className={s.swatches}>
                {g.items.map((c) => (
                  <div key={c.name} className={s.swatch}>
                    <div className={s.swatchFill} style={{ background: c.fill } as CSSProperties} />
                    <div className={s.swatchText}>
                      {c.name}
                      <span>{c.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="type"
        label="Type"
        title="Inter, thinner as it grows."
        lede="JetBrains Mono for anything people copy: entity IDs, capabilities, commands."
      >
        <div className={`glass ${s.specimen}`}>
          <div className={s.spec}>
            <div className={s.meta}>
              Display<span>Inter 200 · −3%</span>
            </div>
            <div className={s.sDisplay}>21:42</div>
          </div>
          <div className={s.spec}>
            <div className={s.meta}>
              Title<span>Inter 300 · −2%</span>
            </div>
            <div className={s.sTitle}>Install S1 Unleashed on your panel</div>
          </div>
          <div className={s.spec}>
            <div className={s.meta}>
              Label<span>Inter 500 · caps +14%</span>
            </div>
            <div className="label" style={{ color: "var(--muted)" }}>
              Open wall panel · Starting
            </div>
          </div>
          <div className={s.spec}>
            <div className={s.meta}>
              Body<span>Inter 400 · 15/24</span>
            </div>
            <p className={s.sBody}>
              A pane says what it needs. The frame says what it has.
            </p>
          </div>
          <div className={s.spec}>
            <div className={s.meta}>
              Code<span>JetBrains Mono 400</span>
            </div>
            <div className={s.sMono}>
              requires = setOf(SILABS_RADIO) · <span>switch.s1_radio_permit_join</span>
            </div>
          </div>
        </div>
      </Section>

      <Section
        id="glass"
        label="Glass"
        title="One surface."
        lede="Faint fill, hairline edge, blur. Light from top-left (sky) and bottom-right (violet). No drop shadows."
      >
        <pre className={s.recipe}>
          <code>{`.glass {
  background: rgba(255,255,255,.045);   /* daylight: rgba(255,255,255,.66) */
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 22px;                  /* panes inside it: 12px */
  backdrop-filter: blur(18px) saturate(1.2);
}`}</code>
        </pre>
        <div className={s.demo}>
          <div className={`glass ${s.panel}`}>
            <div className={s.panelHead}>
              <h3>Choose your panel</h3>
              <span className="label">Kiln · example</span>
            </div>
            <div className={s.frames}>
              <div className={`${s.frameCard} ${s.frameOn}`}>
                <span className={s.thumb} />
                <span>
                  <span className={s.fcName}>Aqara S1 Plus</span>
                  <span className={s.fcSub}>S1 Unleashed · FEL install</span>
                </span>
                <span className={`${s.pill} ${s.ok}`}>Tested</span>
              </div>
              <div className={`${s.frameCard} ${s.frameOff}`}>
                <span className={`${s.thumb} ${s.thumbSq}`} />
                <span>
                  <span className={s.fcName}>Sonoff NSPanel Pro</span>
                  <span className={s.fcSub}>ADB root, no boot patch</span>
                </span>
                <span className={`${s.pill} ${s.plan}`}>Planned</span>
              </div>
            </div>
            <span className={s.kbtn}>Connect over USB</span>
            <p className={s.note}>One ember button per Kiln step.</p>
          </div>
          <div className={`glass ${s.panel}`}>
            <div className={s.panelHead}>
              <h3>Panes</h3>
              <span className="label">Aqara S1 frame</span>
            </div>
            <div>
              {[
                { Icon: MicGlyph, n: "Assist", d: "Wake word and voice overlay", on: true },
                { Icon: MusicGlyph, n: "Sendspin", d: "Music Assistant player", on: true },
                { Icon: RadioGlyph, n: "Zigbee / Thread radio", d: "Coordinator, router or border router", on: false },
              ].map(({ Icon, n, d, on }) => (
                <div key={n} className={s.paneRow}>
                  <span className={s.paneIc}>
                    <Icon />
                  </span>
                  <span>
                    <span className={s.pn}>{n}</span>
                    <span className={s.pd}>{d}</span>
                  </span>
                  <Switch label={n} defaultOn={on} />
                </div>
              ))}
              <div className={`${s.paneRow} ${s.paneOff}`}>
                <span className={s.paneIc}>
                  <BaseGlyph />
                </span>
                <span>
                  <span className={s.pn}>Wall base</span>
                  <span className={s.pd}>Needs the S1 wall base. This panel isn&rsquo;t on one.</span>
                </span>
                <Switch label="Wall base, unavailable" disabled />
              </div>
            </div>
            <p className={s.note}>On is lit. Unavailable panes say why.</p>
          </div>
        </div>
        <div className={s.rules}>
          <div className={s.rule}>
            <span className={s.ruleK}>radius</span>
            <p>22 for tiles, 12 inside. On the panel, 5.6% of tile width.</p>
          </div>
          <div className={s.rule}>
            <span className={s.ruleK}>anatomy</span>
            <p>Label top-left, status top-right, big content bottom-left.</p>
          </div>
          <div className={s.rule}>
            <span className={s.ruleK}>daylight</span>
            <p>Web follows the viewer&rsquo;s theme. The panel stays dark.</p>
          </div>
        </div>
      </Section>

      <Section id="vocabulary" label="Vocabulary" title="Frame, Pane, Kiln." lede="1.6 px stroke on a 24 px grid.">
        <div className={s.vocab}>
          <div className={`glass ${s.term}`}>
            <FrameGlyph />
            <span className={s.termW}>Frame</span>
            <p>
              One device definition: hardware, capabilities and the panes it ships. <code>frames/aqara-s1/</code>
            </p>
          </div>
          <div className={`glass ${s.term}`}>
            <PaneGlyph />
            <span className={s.termW}>Pane</span>
            <p>
              A plugin. Hardware and feature panes are one type and differ only in <code>requires</code>.
            </p>
          </div>
          <div className={`glass ${s.term}`}>
            <KilnGlyph />
            <span className={s.termW}>Kiln</span>
            <p>
              The installer that fires a stock device into a panel. <code>kiln.glassworks.dev</code>
            </p>
          </div>
        </div>
      </Section>

      <Section
        id="motion"
        label="Motion"
        title="Light moves; glass doesn't."
        lede="No bouncing, scaling or sliding. All of it stops under reduced motion."
      >
        <div className={s.vocab}>
          <div className={`glass ${s.mo}`}>
            <span className={s.ruleK}>sweep · 1.5 s · once</span>
            <h3>Waking</h3>
            <p>A diagonal sheen on boot, sign-in and install.</p>
          </div>
          <div className={`glass ${s.mo}`}>
            <span className={s.ruleK}>drift · 6 s · loop</span>
            <h3>Alive</h3>
            <p>Background glows drift, slowly enough to miss.</p>
          </div>
          <div className={`glass ${s.mo}`}>
            <span className={s.ruleK}>breathe · 2 s · loop</span>
            <h3>Status</h3>
            <p>Only the status dot pulses.</p>
          </div>
        </div>
      </Section>

      <Section id="dont" label="Don't" title="Four rules.">
        <div className={s.donts}>
          <div className={s.dont}>
            <div className={`${s.ground} ${s.gNight}`}>
              <svg viewBox="0 0 120 60" aria-hidden="true">
                <rect x="2" y="2" width="116" height="56" rx="14" fill="none" stroke="currentColor" strokeWidth="4" />
                <rect x="10" y="10" width="54" height="40" rx="6" fill="#38bdf8" />
                <rect x="70" y="10" width="40" height="17" rx="6" fill="currentColor" fillOpacity={0.26} />
                <rect x="70" y="33" width="40" height="17" rx="6" fill="currentColor" fillOpacity={0.26} />
              </svg>
            </div>
            <span className={s.x}>Flatten the light</span>
            <p>Keep the gradient.</p>
          </div>
          <div className={s.dont}>
            <div className={`${s.ground} ${s.gNight}`}>
              <Mark className={s.rotated} />
            </div>
            <span className={s.x}>Turn it portrait</span>
            <p>It&rsquo;s always landscape.</p>
          </div>
          <div className={s.dont}>
            <div className={`${s.ground} ${s.gGrad}`}>
              <Mark />
            </div>
            <span className={s.x}>Light on light</span>
            <p>Use one colour on coloured backgrounds.</p>
          </div>
          <div className={s.dont}>
            <div className={`${s.ground} ${s.gNight}`}>
              <span className={s.fakeName}>
                Glassworks for
                <br />
                Home Assistant
              </span>
            </div>
            <span className={s.x}>Borrow trademarks</span>
            <p>Taglines only, never names.</p>
          </div>
        </div>
      </Section>

      <Section id="downloads" label="Downloads" title="SVGs." lede="Text is outlined, so no fonts are needed.">
        <ul className={s.downloads}>
          {downloads.map((d) => (
            <li key={d.file}>
              <a href={`/brand/${d.file}`} download className={`glass ${s.dl}`}>
                <span className={s.dlName}>{d.file}</span>
                <span className={s.dlWhat}>{d.what}</span>
              </a>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
