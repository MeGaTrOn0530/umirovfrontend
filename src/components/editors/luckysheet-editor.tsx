"use client";

import * as React from "react";
import "luckysheet/dist/css/luckysheet.css";

declare global {
  interface Window {
    $?: typeof import("jquery");
    jQuery?: typeof import("jquery");
  }
}

export type LuckysheetApi = {
  create: (options: Record<string, unknown>) => void;
  destroy?: () => void;
  getLuckysheetfile?: () => unknown[];
};

type LuckysheetModule = {
  luckysheet?: LuckysheetApi;
  default?: LuckysheetApi;
};

type LuckysheetEditorProps = {
  value?: unknown[];
  readOnly?: boolean;
  onInit?: (api: LuckysheetApi) => void;
};

export function LuckysheetEditor({ value, readOnly = false, onInit }: LuckysheetEditorProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const containerIdRef = React.useRef(`luckysheet-${Math.random().toString(16).slice(2)}`);
  const luckysheetRef = React.useRef<LuckysheetApi | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      if (typeof window !== "undefined" && !window.$) {
        const jqueryModule = await import("jquery");
        const jquery = jqueryModule.default ?? jqueryModule;
        window.$ = jquery;
        window.jQuery = jquery;
      }

      const mousewheelModule = await import("jquery-mousewheel");
      const mousewheelFactory =
        (mousewheelModule as { default?: (jquery: typeof window.$) => void }).default ??
        (mousewheelModule as (jquery: typeof window.$) => void);
      if (typeof window.$ === "function") {
        mousewheelFactory(window.$);
      }

      await import("spectrum-colorpicker");

      const module = (await import("luckysheet")) as LuckysheetModule;
      const luckysheet =
        module.luckysheet ?? module.default ?? (module as unknown as LuckysheetApi);
      if (cancelled || !containerRef.current) return;

      luckysheet.create({
        container: containerIdRef.current,
        data:
          value ??
          [
            {
              name: "Sheet1",
              color: "",
              order: 0,
              index: 0,
              status: 1,
              data: [],
            },
          ],
        lang: "en",
        showToolbar: !readOnly,
        showFormulaBar: !readOnly,
        showStatisticalBar: !readOnly,
        showinfobar: false,
        allowEdit: !readOnly,
        allowEditRow: !readOnly,
        allowEditColumn: !readOnly,
        startSheetIndex: 0,
      });

      luckysheetRef.current = luckysheet;
      onInit?.(luckysheet);
    })();

    return () => {
      cancelled = true;
      luckysheetRef.current?.destroy?.();
    };
  }, [value, readOnly, onInit]);

  return (
    <div
      id={containerIdRef.current}
      ref={containerRef}
      className="min-h-[320px] w-full rounded-lg border border-border bg-background"
    />
  );
}
