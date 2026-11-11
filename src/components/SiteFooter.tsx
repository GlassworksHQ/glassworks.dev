import Link from "next/link";
import { Mark } from "./Mark";
import { links } from "@/lib/site";
import styles from "./chrome.module.css";

export function SiteFooter() {
  return (
    <footer className={`wrap ${styles.footer}`}>
      <div className={styles.footTop}>
        <Link href="/" className={styles.home}>
          <Mark className={styles.markSm} />
          <span className={styles.wordSm}>Glassworks</span>
        </Link>
        <nav className={styles.footNav} aria-label="Footer">
          <Link href="/brand">Brand</Link>
          <a href={links.org}>GitHub</a>
          <a href={links.s1}>S1 Unleashed</a>
        </nav>
      </div>
      <p className={styles.legal}>
        Home Assistant is a trademark of the Open Home Foundation. Glassworks is an independent project and
        isn&rsquo;t affiliated with or endorsed by it.
      </p>
    </footer>
  );
}
