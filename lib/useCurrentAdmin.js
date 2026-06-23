"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getAdminToken } from "@/lib/clientAuth";

// Auth-Guard für Admin-Seiten. Leitet ohne gültigen Admin-Token zu /admin/login.
export function useCurrentAdmin() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    let active = true;
    (async () => {
      try {
        const { data } = await axios.post("/api/admin/me", { token });
        if (!active) return;
        setAdmin(data.admin);
        setStatus("ready");
      } catch (err) {
        if (!active) return;
        if (err.response?.status === 401) {
          router.replace("/admin/login");
          return;
        }
        setStatus("error");
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  return { admin, status };
}
