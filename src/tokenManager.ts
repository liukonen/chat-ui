import { useRef, useCallback } from "preact/hooks";

interface AuthState {
  token: string | null;
  expiresAt: number; // epoch ms
}

const TOKEN_BUFFER_MS = 5000; // 5s safety buffer

export function useAuthToken() {
  // refs persist across renders but won't trigger re-render
  const authStateRef = useRef<AuthState>({ token: null, expiresAt: 0 });

  const fetchNewToken = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch("https://ai.liukonen.dev/lease", {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Token request failed");

      const data = await res.json();
      const token = data.token;
      const expiresAt = Date.now() + data.ttl * 1000;

      // update ref
      authStateRef.current = { token, expiresAt };
      return token;
    } catch (err) {
      console.error("Could not get auth token:", err);
      authStateRef.current = { token: null, expiresAt: 0 };
      return null;
    }
  }, []);

  const getValidToken = useCallback(async (): Promise<string | null> => {
    const state = authStateRef.current;
    if (state.token && Date.now() < state.expiresAt - TOKEN_BUFFER_MS) {
      return state.token;
    }
    return await fetchNewToken();
  }, [fetchNewToken]);

  return { getValidToken };
}