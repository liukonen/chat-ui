import { useCallback, useRef } from "preact/hooks";


interface AuthState {
  token: string | null;
  expiresAt: number; // epoch ms
}

const TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function useAuthToken(userId: string) {
  const tokenRef = useRef<string | null>(null);
  const expiresAtRef = useRef<number>(0);

  const fetchNewToken = async (): Promise<string | null> => {
    try {
      const res = await fetch("https://ai.liukonen.dev/lease", {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      });

      if (!res.ok) throw new Error("Token request failed");

      const data = await res.json();

      tokenRef.current = data.token;
      expiresAtRef.current = Date.now() + data.ttl * 1000;

      return tokenRef.current;
    } catch (err) {
      console.error("Could not get auth token:", err);
      tokenRef.current = null;
      expiresAtRef.current = 0;
      return null;
    }
  };

  const getValidToken = useCallback(async (): Promise<string | null> => {
    if (
      tokenRef.current &&
      Date.now() < expiresAtRef.current - 5000 // 5s safety buffer
    ) {
      return tokenRef.current;
    }

    return await fetchNewToken();
  }, []);

  return { getValidToken };
}