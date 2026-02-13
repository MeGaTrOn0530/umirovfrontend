"use client";

import * as React from "react";

import { subscribeRequestProgress } from "@/lib/request-progress";

export function RequestProgressBar() {
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    return subscribeRequestProgress((count) => {
      setActive(count > 0);
    });
  }, []);

  return (
    <div className="pointer-events-none fixed left-0 top-0 z-50 h-0.5 w-full">
      <div
        className={`h-full bg-primary transition-all duration-300 ${
          active ? "w-4/5 opacity-100" : "w-0 opacity-0"
        }`}
      />
      {active ? (
        <div className="absolute right-0 top-0 h-full w-12 animate-pulse bg-primary/60" />
      ) : null}
    </div>
  );
}
