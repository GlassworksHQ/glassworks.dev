import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { StatusPill } from "@glassworks/frame-card";
import { HeroModel } from "@/components/FrameCard";
import {
  RatingLabel,
  RatingValue,
  SpecLabel,
  SupportTag,
  paneIcon,
} from "@/components/DeviceBits";
import { KilnGlyph } from "@/components/Glyphs";
import { Mark } from "@/components/Mark";
import { frameById, frames, installLink } from "@/lib/frames";
import { ratingKeys, ships } from "@/lib/frameText";
import { panes, support } from "@/lib/site";
import s from "./device.module.css";
import { ClarityChip, ClarityPanel } from "@/components/clarity/Clarity";

export function generateStaticParams() {
  return frames.map((f) => ({ slug: f.id }));
}

export async function generateMetadata(
  props: PageProps<"/frames/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const d = frameById(slug);
  if (!d) return {};
  return { title: d.name, description: d.summary };
}

type Params = PageProps<"/frames/[slug]">["params"];

/* The slug is URL data, so it's read inside <Suspense> to keep navigations
   instant. All devices are prerendered, so the fallback only shows briefly on
   an unprefetched client navigation; it keeps the page's shape so nothing jumps. */
export default function DevicePage(props: PageProps<"/frames/[slug]">) {
  return (
    <Suspense fallback={<DeviceFallback />}>
      <Device params={props.params} />
    </Suspense>
  );
}

function DeviceFallback() {
  return (
    <div className={`wrap ${s.page}`} aria-busy="true">
      <nav className={s.crumbs} aria-label="Breadcrumb">
        <Link href="/frames">Devices</Link>
      </nav>
      <div className={s.hero}>
        <div className={s.heroText}>
          <span className={s.ghostLine} />
          <span className={`${s.ghostLine} ${s.ghostTitle}`} />
        </div>
        <span className={s.ghostScreen} />
      </div>
    </div>
  );
}

async function Device({ params }: { params: Params }) {
  const { slug } = await params;
  const d = frameById(slug);
  if (!d) notFound();
  const install = installLink(d);

  return (
    <article className={`wrap ${s.page}`}>
      <nav className={s.crumbs} aria-label="Breadcrumb">
        <Link href="/frames">Devices</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{d.name}</span>
      </nav>

      <header className={s.hero}>
        <div className={s.heroText}>
          <StatusPill stage={d.status} />
          <ClarityChip frameId={d.id} />
          <h1 className={s.h1}>{d.name}</h1>
          {d.aka && <p className={s.aka}>{d.aka}</p>}
          <p className={s.lede}>{d.summary}</p>
          {d.project && (
            <p className={s.project}>
              Runs as <a href={d.project.href}>{d.project.name}</a>
            </p>
          )}
        </div>
        <HeroModel f={d} />
      </header>

      {d.notice && <p className={s.notice}>{d.notice}</p>}

      <section
        className={`glass ${s.kiln} ${install ? "" : s.kilnOff}`}
        aria-labelledby="install"
      >
        {install && !install.kiln ? (
          <Mark className={s.kilnMark} title="Glassworks" />
        ) : (
          <Mark variant="ember" className={s.kilnMark} title="Kiln" />
        )}
        <div className={s.kilnText}>
          <h2 id="install" className={s.kilnTitle}>
            {!install ? "Not in Kiln yet" : install.kiln ? "Install with Kiln" : "Install"}
          </h2>
          <p>{d.install.how}</p>
        </div>
        {install?.kiln && (
          <a href={install.href} className={s.kilnBtn}>
            <KilnGlyph className={s.kilnBtnIcon} />
            Open Kiln
          </a>
        )}
        {install && !install.kiln && (
          /* not Kiln, so not ember: a plain glass button to the frame's own installer */
          <a href={install.href} className={s.installBtn}>
            Open {new URL(install.href).host}
          </a>
        )}
      </section>

      <ClarityPanel frameId={d.id} />

      {d.unverified && (
        <p className={s.caveat}>
          These details come from public writeups. Nobody has checked them on
          hardware yet.
        </p>
      )}

      <div className={s.cols}>
        <section className={s.section} aria-labelledby="specs">
          <h2 id="specs" className={s.h2}>
            Hardware
          </h2>
          <dl className={`glass ${s.specs}`}>
            {d.specs.map((sp) => (
              <div key={sp.label} className={s.spec}>
                <dt>
                  <SpecLabel label={sp.label} />
                </dt>
                <dd>{sp.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={s.section} aria-labelledby="panes">
          <h2 id="panes" className={s.h2}>
            Panes
          </h2>
          <ul className={`glass ${s.panes}`}>
            {panes.map((p) => {
              const Icon = paneIcon[p.id];
              const sup = support(d, p.id);
              return (
                <li key={p.id}>
                  <Link href={`/panes/${p.id}`} className={s.pane}>
                    <span className={s.paneIc}>
                      <Icon />
                    </span>
                    <span className={s.paneText}>
                      <span className={s.paneName}>{p.name}</span>
                      {sup.note && <span className={s.paneNote}>{sup.note}</span>}
                    </span>
                    <SupportTag support={sup.support} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section className={s.section} aria-labelledby="changes">
        <h2 id="changes" className={s.h2}>
          {ships(d.status)
            ? "What installing changes"
            : "What installing will change"}
        </h2>
        <dl className={`glass ${s.specs} ${s.changeList}`}>
          {ratingKeys.map((k) => (
            <div key={k} className={s.spec}>
              <dt>
                <RatingLabel field={k} />
              </dt>
              <dd>
                <RatingValue field={k} rating={d.ratings[k]} />
              </dd>
            </div>
          ))}
        </dl>
        {d.ratingsNote && <p className={s.note}>{d.ratingsNote}</p>}
        {/* A frame that doesn't ship yet, or one whose data comes from writeups: these ratings are the
            plan, not something run on the device. The card reads its tags as "expected" by the same rule. */}
        {(!ships(d.status) || d.unverified) && (
          <p className={s.note}>
            Expected, from the plan. Nothing has been run on this device yet.
          </p>
        )}
      </section>
    </article>
  );
}
