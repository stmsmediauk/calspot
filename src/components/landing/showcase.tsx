"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { lookPresets } from "@/lib/coach-theme";
import { useClaim } from "./claim";
import styles from "./landing.module.css";

const views = {
  desktop: { label: "Desktop", width: 1280, height: 860 },
  phone: { label: "Phone", width: 390, height: 780 },
} as const;
type View = keyof typeof views;

/** "Make it look like you": live example pages that show the visitor's name in each look. */
export function Showcase() {
  const { name, setName, slug } = useClaim();
  const [look, setLook] = useState<string>(lookPresets[0].id);
  const [view, setView] = useState<View>("desktop");
  const [scale, setScale] = useState(1);
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const { width, height } = views[view];

  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const measure = () => setScale(Math.min(1, el.clientWidth / width));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [width]);

  const send = useCallback(() => {
    frame.current?.contentWindow?.postMessage(
      { type: "calspot:example-name", name },
      window.location.origin,
    );
  }, [name]);
  useEffect(send, [send, look, view]);
  useEffect(() => {
    const listen = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin &&
        event.source === frame.current?.contentWindow &&
        event.data?.type === "calspot:example-ready"
      )
        send();
    };
    window.addEventListener("message", listen);
    return () => window.removeEventListener("message", listen);
  }, [send]);

  const active = lookPresets.find((p) => p.id === look) ?? lookPresets[0];

  return (
    <div className={styles.container}>
      <div className={styles.looksHead}>
        <div>
          <p className={`${styles.eyebrow} ${styles.eyebrowBlue}`}>
            Make it look like you
          </p>
          <h2 id="looks-h" className={styles.h2}>
            Same page. Five different looks.
          </h2>
          <p className={`${styles.lead} ${styles.showcaseLead}`}>
            Type your name and see it on every design. These are example pages
            with sample clubs, lessons and photos. Yours will have your own.
          </p>
        </div>
        <label className={styles.nameField} htmlFor="looks-name">
          <span>Your name</span>
          <input
            id="looks-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Type your name"
            maxLength={60}
          />
        </label>
      </div>

      <div className={styles.showcaseBar}>
        <div role="tablist" aria-label="Page looks" className={styles.tabs}>
          {lookPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              role="tab"
              id={`look-tab-${preset.id}`}
              aria-selected={preset.id === look}
              aria-controls="look-panel"
              className={styles.tab}
              onClick={() => setLook(preset.id)}
            >
              {preset.name}
            </button>
          ))}
        </div>
        <div role="group" aria-label="Screen size" className={styles.viewToggle}>
          {(Object.keys(views) as View[]).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={key === view}
              onClick={() => setView(key)}
            >
              {views[key].label}
            </button>
          ))}
        </div>
      </div>
      <p className={styles.lookDescription}>{active.description}</p>

      <div
        id="look-panel"
        role="tabpanel"
        aria-labelledby={`look-tab-${look}`}
        className={`${styles.device} ${view === "phone" ? styles.devicePhone : ""}`}
      >
        <div className={styles.deviceBar} aria-hidden="true">
          <i />
          <i />
          <i />
          <span>calspot.co.uk/{slug}</span>
        </div>
        <div ref={stage} className={styles.deviceStage} style={{ height: height * scale }}>
          <iframe
            key={`${look}-${view}`}
            ref={frame}
            src={`/examples/${look}`}
            title={`Example ${active.name} coach page`}
            className={styles.deviceFrame}
            style={{
              width,
              height,
              transform: `scale(${scale})`,
            }}
          />
        </div>
      </div>
      <p className={styles.looksNote}>
        Start from a look, then change colours, fonts and layout. Your page
        lives at <strong>calspot.co.uk/{slug}</strong>.
      </p>
    </div>
  );
}
