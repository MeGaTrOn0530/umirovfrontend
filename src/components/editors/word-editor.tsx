"use client";

import * as React from "react";

type CKEditorInstance = {
  setData: (data: string) => void;
  getData: () => string;
  destroy: () => Promise<void>;
  enableReadOnlyMode?: (id: string) => void;
  disableReadOnlyMode?: (id: string) => void;
  isReadOnly?: boolean;
  model: {
    document: {
      on: (event: string, callback: () => void) => void;
    };
  };
};

type WordEditorProps = {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
};

export function WordEditor({ value, onChange, readOnly = false }: WordEditorProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const editorRef = React.useRef<CKEditorInstance | null>(null);
  const onChangeRef = React.useRef(onChange);

  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  React.useEffect(() => {
    let cancelled = false;
    let instance: CKEditorInstance | null = null;

    (async () => {
      const module = await import("@ckeditor/ckeditor5-build-classic");
      const ClassicEditor = (module.default ?? module) as {
        create: (element: HTMLElement, config: Record<string, unknown>) => Promise<CKEditorInstance>;
      };
      if (!containerRef.current || cancelled) return;
      instance = await ClassicEditor.create(containerRef.current, {
        toolbar: readOnly
          ? []
          : [
              "heading",
              "|",
              "bold",
              "italic",
              "link",
              "bulletedList",
              "numberedList",
              "blockQuote",
              "insertTable",
              "undo",
              "redo",
            ],
        placeholder: readOnly ? undefined : "Write your response...",
        table: {
          shouldCreateHeaderRow: true,
        },
      });
      editorRef.current = instance;
      instance.setData(value ?? "");
      if (readOnly) {
        if (typeof instance.enableReadOnlyMode === "function") {
          instance.enableReadOnlyMode("word-preview");
        } else {
          instance.isReadOnly = true;
        }
      } else {
        instance.model.document.on("change:data", () => {
          onChangeRef.current(instance?.getData() ?? "");
        });
      }
    })();

    return () => {
      cancelled = true;
      if (readOnly && instance?.disableReadOnlyMode) {
        instance.disableReadOnlyMode("word-preview");
      }
      instance?.destroy().catch(() => {});
    };
  }, [readOnly]);

  React.useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getData()) {
      editorRef.current.setData(value);
    }
  }, [value]);

  return (
    <div className="min-h-[280px] rounded-lg border border-border bg-background px-3 py-2">
      <div ref={containerRef} />
    </div>
  );
}
