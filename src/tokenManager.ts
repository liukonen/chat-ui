import { useState, useEffect } from 'preact/hooks';

export function useAuthToken(user = "local-user") {
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number>(0);

  const fetchToken = async () => {
    try {
      const res = await fetch("https://ai.liukonen.dev/lease", {
        method: "GET"
      });

      if (!res.ok) throw new Error("Failed to fetch token");

      const data = await res.json();
      const ttl = data.expires_in || 600; // default 10 minutes
      setToken(data.token);
      setExpiresAt(Date.now() + ttl * 1000);
      console.log("Token fetched:", data.token);
    } catch (err) {
      console.error("Could not get auth token:", err);
      setToken(null);
      setExpiresAt(0);
    }
  };

  const getValidToken = async () => {
    if (!token || Date.now() >= expiresAt) {
      await fetchToken();
    }
    return token;
  };

  // Auto-refresh token if expired every minute
  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() >= expiresAt) fetchToken();
    }, 60_000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return { token, getValidToken, fetchToken };
}