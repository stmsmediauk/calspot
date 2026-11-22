"use client";

import { useRef } from "react";
import styles from "./focus-picker.module.css";

const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)));

/** Click or drag on the photo to choose the point that stays in view when it is cropped. */
export function FocusPicker({
  src,
  x,
  y,
  onChange,
}: {
  src: string;
  x: number;
  y: number;
  onChange: (x: number, y: number) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const move = (clientX: number, clientY: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r || !r.width || !r.height) return;
    onChange(
      clamp(((clientX - r.left) / r.width) * 100),
      clamp(((clientY - r.top) / r.height) * 100),
    );
  };
  return (
    <div className={styles.picker}>
      <p className={styles.title}>Choose your focus point</p>
      <p className={styles.hint}>
        Tap or drag on your face. This keeps you in view when your photo is
        cropped to fit.
      </p>
      <div className={styles.row}>
        <div
          ref={box}
          className={styles.stage}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            move(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId))
              move(e.clientX, e.clientY);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" draggable={false} />
          <button
            type="button"
            className={styles.marker}
            style={{ left: `${x}%`, top: `${y}%` }}
            aria-label="Focus point. Use the arrow keys to move it."
            onKeyDown={(e) => {
              const step = e.shiftKey ? 10 : 2;
              const d: Record<string, [number, number]> = {
                ArrowLeft: [-step, 0],
                ArrowRight: [step, 0],
                ArrowUp: [0, -step],
                ArrowDown: [0, step],
              };
              const m = d[e.key];
              if (!m) return;
              e.preventDefault();
              onChange(clamp(x + m[0]), clamp(y + m[1]));
            }}
          />
        </div>
        <div className={styles.result}>
          <div
            className={styles.crop}
            style={{
              backgroundImage: `url("${src}")`,
              backgroundPosition: `${x}% ${y}%`,
            }}
            aria-hidden="true"
          />
          <small>How it will be cropped</small>
        </div>
      </div>
    </div>
  );
}
