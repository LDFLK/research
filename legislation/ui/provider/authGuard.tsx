"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/auth";

const PUBLIC_PATHS = ["/", "/login"];

export function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const path = pathname || "/";

    if (PUBLIC_PATHS.includes(path)) {
      setChecked(true);
      return;
    }

    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setChecked(true);
  }, [pathname, router]);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}

