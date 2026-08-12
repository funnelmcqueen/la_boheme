"use client";

import { useEffect, useRef, useState } from "react";
import { Emblem } from "@/components/emblem/Emblem";
import { ALLERGY_NOTE, MENU, formatPrice, type MenuGroup } from "@/content/menu";
import type { Copy } from "@/content/copy/types";
import styles from "./Carte.module.css";

/**
 * The carte. The second signature, and the one tonal break on the page.
 *
 * The whole site is dark except this, which sits on sand and reads as the printed
 * menu laid on the water — on blue, the one warm object on the page, which is
 * exactly right for a menu. Do not add a second break.
 *
 * All ~90 items render inline. No PDF, no modal, no separate route: the length is
 * the argument, and a menu behind a link is a menu nobody reads.
 *
 * Every price comes from menu.ts through formatPrice. There is no price string
 * anywhere else in the codebase, and the group separator is the thin space of the
 * printed card.
 */
/**
 * `catch` is not in the carte tab. It is the whole of the Peshku section a little
 * further down — the same twelve species, the same per-kilo prices, from the same
 * group in menu.ts — and printing it twice on one page is not the printed card
 * being faithful, it is the same list twice. It still renders; it renders there.
 */
const TABS: Record<string, (group: MenuGroup) => boolean> = {
  carte: (g) => !g.id.startsWith("wine") && g.id !== "desserts" && g.id !== "catch",
  wine: (g) => g.id.startsWith("wine"),
  dessert: (g) => g.id === "desserts",
};

export function Carte({ copy }: { copy: Copy }) {
  const [tab, setTab] = useState("carte");
  const sheet = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  // Changing tab swaps a very tall block. Without this the viewport keeps its
  // scroll offset and lands somewhere arbitrary inside the new list.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    sheet.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [tab]);

  const groups = MENU.filter(TABS[tab]);

  return (
    <section id="menuja" className={`vj-sand ${styles.section}`}>
      <div className={styles.tabs} role="tablist" aria-label={copy.a11y.menuSections}>
        {copy.menu.tabs.map((item) => (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={tab === item.id}
            className={tab === item.id ? `${styles.tab} ${styles.on}` : styles.tab}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className={styles.sheet} ref={sheet}>
        <header className={styles.masthead}>
          <span className={styles.master}>La Bohème</span>
          <span className={styles.venue}>Vajana · Vlorë</span>
          <Ornament />
        </header>

        {groups.map((group) => (
          <section key={group.id} className={styles.group} aria-labelledby={`g-${group.id}`}>
            <h3 id={`g-${group.id}`} className={styles.groupTitle}>
              {group.title[copy.lang]}
            </h3>
            {group.note ? <p className={styles.note}>{group.note[copy.lang]}</p> : null}

            <ul className={group.layout === "wine" ? styles.wines : styles.dishes}>
              {group.items.map((item) => (
                <li key={item.id} className={styles.row}>
                  <span className={styles.name}>{item.name[copy.lang]}</span>
                  <span className={styles.leader} aria-hidden="true" />
                  <span className={styles.price}>{formatPrice(item, copy.lang)}</span>
                  {item.desc ? (
                    <span className={styles.desc}>{item.desc[copy.lang]}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className={styles.allergy}>{ALLERGY_NOTE[copy.lang]}</p>
      </div>
    </section>
  );
}

/** The printed card's own mark: two rules and the logo brown at full strength. */
function Ornament() {
  return (
    <span className={styles.ornament} aria-hidden="true">
      <i />
      <b />
      <i />
    </span>
  );
}
