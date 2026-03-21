"use client";

import { HTTP_BACKEND } from "@/config";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

export default function AuthSync() {
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();
  const syncedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) {
      return;
    }

    if (syncedUserIdRef.current === userId) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const token = await getToken();
        if (!token || cancelled) {
          return;
        }

        const response = await fetch(`${HTTP_BACKEND}/auth/sync`, {
          method: "POST",
          headers: {
            authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok || cancelled) {
          return;
        }

        syncedUserIdRef.current = userId;
      } catch {
        // Keep this silent in the UI; auth-protected pages can retry sync on demand.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, userId, getToken]);

  return null;
}
