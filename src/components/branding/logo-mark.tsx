import * as React from "react";

export type LogoMarkProps = {
  className?: string;
};

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <div
      className={
        className ??
        "flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
      }
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 17l4-10h8l4 10" />
        <path d="M7 11h10" />
        <path d="M8 17v-4" />
        <path d="M16 17v-4" />
      </svg>
    </div>
  );
}
