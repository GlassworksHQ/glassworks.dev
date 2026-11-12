import { DeviceModel } from "./DeviceModel";
import { RatingTags, StatusPill } from "./DeviceBits";
import { TiltCard } from "./TiltCard";
import { ships, type Device } from "@/lib/devices";
import s from "./DeviceCard.module.css";

/**
 * A device in the catalog: its 3D model, name, status and install footprint.
 * The home page and /frames both use it. On hover the device rises out of the
 * card and floats, leaning a little toward the pointer, like the pane cards.
 */
export function DeviceCard({ d, heading = "h3" }: { d: Device; heading?: "h2" | "h3" }) {
  const H = heading;
  return (
    <TiltCard className={`glass ${s.card}`} href={`/frames/${d.slug}`}>
      <div className={s.model}>
        <div className={s.float}>
          <div className={s.bob}>
            <DeviceModel shape={d.shape} label={`${d.name} running Glassworks`} />
          </div>
        </div>
        <span className={s.shadow} aria-hidden="true" />
      </div>
      <div className={s.text}>
        <div className={s.top}>
          <H className={s.name}>{d.name}</H>
          <StatusPill status={d.status} />
        </div>
        {d.aka && <p className={s.aka}>{d.aka}</p>}
        <p className={s.summary}>{d.summary}</p>
        <RatingTags ratings={d.ratings} expected={!ships(d.status)} />
      </div>
    </TiltCard>
  );
}
