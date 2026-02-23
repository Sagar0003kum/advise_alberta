"use client";
import { useState, useEffect } from "react";

export default function TypingPlaceholder({ texts }) {
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIndex];
    let timeout;

    if (!isDeleting && charIndex < current.length) {
      timeout = setTimeout(() => setCharIndex(charIndex + 1), 45);
    } else if (!isDeleting && charIndex === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && charIndex > 0) {
      timeout = setTimeout(() => setCharIndex(charIndex - 1), 25);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setTextIndex((textIndex + 1) % texts.length);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex, texts]);

  return (
    <span className="text-slate-400 font-body text-sm sm:text-base pointer-events-none select-none">
      {texts[textIndex].substring(0, charIndex)}
      <span
        className="inline-block w-[2px] h-[1em] bg-slate-300 ml-[1px] align-middle"
        style={{ animation: "cursorBlink 1s step-end infinite" }}
      />
    </span>
  );
}
