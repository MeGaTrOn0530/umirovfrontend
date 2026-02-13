"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { requireRole } from "@/lib/auth";
import type { Role } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export type RoleGuardProps = {
  role: Role;
  children: React.ReactNode;
};

export function RoleGuard({ role, children }: RoleGuardProps) {
  const router = useRouter();
  const [allowed, setAllowed] = React.useState(false);

  React.useEffect(() => {
    const result = requireRole(role);
    if (!result.session) {
      router.replace("/login");
      return;
    }

    if (!result.allowed) {
      router.replace("/unauthorized");
      return;
    }

    setAllowed(true);
  }, [role, router]);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
