"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

const HIGHLIGHT_CLASS = "hash-scroll-highlight";
const RETRY_MS = [0, 150, 350, 600, 1000, 1600];
const TOP_SETTLE_MS = 120;
const MIN_DURATION_MS = 850;
const MAX_DURATION_MS = 1550;
const MS_PER_PX = 0.65;

let scrollFrameId: number | null = null;
let scrollRunId = 0;

function easeInOutQuint(t: number): number {
  return t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2;
}

function cancelActiveScroll() {
  if (scrollFrameId !== null) {
    window.cancelAnimationFrame(scrollFrameId);
    scrollFrameId = null;
  }
  scrollRunId += 1;
}

function getTargetScrollTop(element: HTMLElement): number {
  const scrollMarginTop =
    Number.parseFloat(window.getComputedStyle(element).scrollMarginTop) || 0;
  const top = element.getBoundingClientRect().top + window.scrollY - scrollMarginTop;
  const maxScroll = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  );
  return Math.min(Math.max(0, top), maxScroll);
}

function scrollDurationForDistance(distance: number): number {
  return Math.min(MAX_DURATION_MS, Math.max(MIN_DURATION_MS, distance * MS_PER_PX));
}

function animateWindowScrollTo(targetTop: number, duration: number): Promise<void> {
  cancelActiveScroll();
  const runId = scrollRunId;

  return new Promise((resolve) => {
    const startTop = window.scrollY;
    const distance = targetTop - startTop;

    if (Math.abs(distance) < 1) {
      resolve();
      return;
    }

    const startTime = performance.now();

    const step = (now: number) => {
      if (runId !== scrollRunId) {
        resolve();
        return;
      }

      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutQuint(progress);

      window.scrollTo({ top: startTop + distance * eased, left: 0, behavior: "auto" });

      if (progress < 1) {
        scrollFrameId = window.requestAnimationFrame(step);
      } else {
        scrollFrameId = null;
        resolve();
      }
    };

    scrollFrameId = window.requestAnimationFrame(step);
  });
}

function scrollWindowToTop() {
  cancelActiveScroll();
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function pulseTarget(element: HTMLElement) {
  element.classList.remove(HIGHLIGHT_CLASS);
  void element.offsetWidth;
  element.classList.add(HIGHLIGHT_CLASS);
  window.setTimeout(() => element.classList.remove(HIGHLIGHT_CLASS), 1800);
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/** Scroll from page top to a section id with smooth motion (for deep links / Facts tiles). */
export async function scrollToHashSection(hash: string): Promise<boolean> {
  const id = decodeURIComponent(hash.replace(/^#/, ""));
  if (!id) return false;

  const target = document.getElementById(id);
  if (!target) return false;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (reduceMotion) {
    scrollWindowToTop();
    target.scrollIntoView({ behavior: "auto", block: "start" });
    pulseTarget(target);
    return true;
  }

  scrollWindowToTop();
  await wait(TOP_SETTLE_MS);

  const targetTop = getTargetScrollTop(target);
  const duration = scrollDurationForDistance(Math.abs(targetTop));

  await animateWindowScrollTo(targetTop, duration);
  pulseTarget(target);

  return true;
}

export function useHashScroll(active = true) {
  const pathname = usePathname();
  const [hash, setHash] = React.useState("");
  const scrollKeyRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  React.useEffect(() => {
    scrollKeyRef.current = null;
    return () => cancelActiveScroll();
  }, [pathname, hash]);

  React.useEffect(() => {
    if (!active || !hash) return;

    const scrollKey = `${pathname}${hash}`;
    const timeouts: number[] = [];
    let cancelled = false;

    const attempt = () => {
      if (cancelled || scrollKeyRef.current === scrollKey) return;

      const id = decodeURIComponent(hash.replace(/^#/, ""));
      if (!id || !document.getElementById(id)) return;

      scrollKeyRef.current = scrollKey;
      void scrollToHashSection(hash).catch(() => {
        scrollKeyRef.current = null;
      });
    };

    for (const delay of RETRY_MS) {
      timeouts.push(window.setTimeout(attempt, delay));
    }

    return () => {
      cancelled = true;
      timeouts.forEach((id) => window.clearTimeout(id));
    };
  }, [active, pathname, hash]);
}
