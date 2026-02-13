import * as React from "react";

export type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
};

export function PageHeader({ title, description, actions, badge, icon }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {icon ? (
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {icon}
            </span>
          ) : null}
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {badge}
        </div>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
