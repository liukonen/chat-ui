import { useCallback, useState } from "preact/hooks";

interface AuthState {
  token: string | null;
  expiresAt: number; // epoch ms
}

const TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function useAuthToken(userId: string) {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    expiresAt: 0
  });

  const fetchNewToken = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch("https://ai.liukonen.dev/lease", {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      });
      if (!res.ok) throw new Error("Token request failed");
      const data = await res.json();

      const newState = {
        token: data.token,
        expiresAt: Date.now() + data.ttl * 1000
      };
      setAuthState(newState);
      return newState.token;
    } catch (err) {
      console.error("Could not get auth token:", err);
      setAuthState({ token: null, expiresAt: 0 });
      return null;
    }
  }, []);

  const getValidToken = useCallback(async (): Promise<string | null> => {
    if (
      authState.token &&
      Date.now() < authState.expiresAt - 5000 // 5s safety buffer
    ) {
      return authState.token;
    }
    return await fetchNewToken();
  }, [authState, fetchNewToken]);

  return { getValidToken };
}
