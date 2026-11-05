import { useEffect, useRef, useState } from "react";

import { BRAND } from "../config";
import { CloseIcon, ExternalIcon } from "./Icons";

export default function WorkWithMe() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="work">
      <button
        ref={buttonRef}
        type="button"
        className="btn btn--cta"
        aria-expanded={open}
        aria-controls="work-card"
        onClick={() => setOpen((v) => !v)}
      >
        Work with me
      </button>

      {open && (
        <section id="work-card" className="work__card" aria-label="Work with me">
          <button type="button" className="icon-btn work__close" onClick={() => setOpen(false)} aria-label="Close">
            <CloseIcon width={17} height={17} />
          </button>
          <h2>{BRAND.pitchTitle}</h2>
          <p>{BRAND.pitch}</p>
          <ul>
            {BRAND.services.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <a className="btn btn--cta btn--block" href={BRAND.links.portfolio} target="_blank" rel="noreferrer">
            See my portfolio <ExternalIcon width={15} height={15} />
          </a>
          <div className="work__links">
            <a href={BRAND.links.youtube} target="_blank" rel="noreferrer">
              YouTube tutorials
            </a>
            <a href={BRAND.links.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </div>
          <p className="work__sig">{BRAND.person}, {BRAND.name}</p>
        </section>
      )}
    </div>
  );
}
