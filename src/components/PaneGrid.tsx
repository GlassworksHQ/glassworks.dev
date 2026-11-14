import { PaneLift } from "./PaneLift";
import { TiltCard } from "./TiltCard";
import { StageMark, paneIcon } from "./DeviceBits";
import { frames } from "@/lib/frames";
import { supportText } from "@/lib/frameText";
import { generalPanes, links } from "@/lib/site";
import { support } from "@/lib/paneSupport";
import s from "./PaneGrid.module.css";

/** A small mark for the empty "your pane" card: a plus, nothing lit. */
function EmptyGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" {...props}>
      <path d="M12 6v12M6 12h12" />
    </svg>
  );
}

/**
 * The general panes as cards, plus "Your pane". The home page and /panes both
 * show exactly this, so the two never drift apart. Each card links to its pane.
 */
export function PaneGrid() {
  return (
    <ul className={s.grid}>
      {generalPanes.map((p) => {
        const Icon = paneIcon[p.id];
        return (
          <li key={p.id}>
            <TiltCard className={s.card} href={`/panes/${p.id}`}>
              <div className={s.stage}>
                <PaneLift Icon={Icon} />
              </div>
              <div className={s.body}>
                <h3 className={s.name}>{p.name}</h3>
                <p className={s.does}>{p.does}</p>
                <dl className={s.facts}>
                  <dt>Needs</dt>
                  <dd>{p.requires}</dd>
                </dl>
                <ul className={s.runs} aria-label={`Where ${p.name} runs`}>
                  {frames.map((d) => {
                    const { support: sup } = support(d, p.id);
                    return (
                      <li key={d.id} className={`${s.run} ${s[`r_${sup}`]}`} title={supportText[sup]}>
                        <StageMark stage={sup} />
                        {d.name}
                        <span className="visually-hidden">: {supportText[sup]}</span>
                      </li>
                    );
                  })}
                </ul>
                <span className={s.more} aria-hidden="true">
                  Details
                </span>
              </div>
            </TiltCard>
          </li>
        );
      })}
      <li>
        <TiltCard className={`${s.card} ${s.yours}`}>
          <div className={s.stage}>
            <PaneLift Icon={EmptyGlyph} frame />
          </div>
          <div className={s.body}>
            <h3 className={s.name}>Your pane</h3>
            <p className={s.does}>
              A pane is a plugin that declares what it <code>requires</code>. The guide to writing one comes with the
              first release.
            </p>
            <a href={links.org} className={s.cta}>
              Follow along on GitHub
            </a>
          </div>
        </TiltCard>
      </li>
    </ul>
  );
}
