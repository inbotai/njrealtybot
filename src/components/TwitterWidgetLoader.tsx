"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    twttr?: { widgets: { load: (el?: HTMLElement) => void } };
  }
}

export default function TwitterWidgetLoader() {
  useEffect(() => {
    // If script already loaded, just re-render widgets
    if (window.twttr?.widgets) {
      window.twttr.widgets.load();
      return;
    }

    // Load the script
    const script = document.createElement("script");
    script.src = "https://platform.x.com/widgets.js";
    script.async = true;
    script.charset = "utf-8";
    document.body.appendChild(script);
  }, []);

  return null;
}
