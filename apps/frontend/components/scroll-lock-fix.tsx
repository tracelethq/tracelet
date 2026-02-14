"use client";

import { useEffect } from "react";

/**
 * Prevents layout shift when Radix dialogs/dropdowns open by adding
 * padding-right to body equal to the scrollbar width when body gets overflow:hidden.
 */
export function ScrollLockFix() {
  useEffect(() => {
    // Measure scrollbar width once on mount (while scrollbar is visible)
    const getScrollbarWidth = () => {
      if (typeof window === "undefined") return 0;
      const w = window.innerWidth - document.documentElement.clientWidth;
      // Fallback when page doesn't overflow yet (scrollbar not visible)
      return w > 0 ? w : 15;
    };

    const width = getScrollbarWidth();
    const applyFix = () => {
      const bodyStyle = document.body.getAttribute("style") ?? "";
      const htmlStyle = document.documentElement.getAttribute("style") ?? "";
      const overflowHidden =
        document.body.style.overflow === "hidden" ||
        bodyStyle.includes("overflow: hidden") ||
        bodyStyle.includes("overflow:hidden") ||
        document.documentElement.style.overflow === "hidden" ||
        htmlStyle.includes("overflow: hidden") ||
        htmlStyle.includes("overflow:hidden");

      if (overflowHidden && width > 0) {
        document.body.style.paddingRight = `${width}px`;
      } else {
        document.body.style.paddingRight = "";
      }
    };

    const observer = new MutationObserver(() => {
      applyFix();
      // Catch Radix async updates (portals/microtasks)
      requestAnimationFrame(applyFix);
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });

    // Catch async scroll lock (Radix may set it after mount)
    const t1 = setTimeout(applyFix, 0);
    const t2 = setTimeout(applyFix, 100);
    const t3 = setTimeout(applyFix, 300);

    applyFix();

    return () => {
      observer.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      document.body.style.paddingRight = "";
    };
  }, []);

  return null;
}
