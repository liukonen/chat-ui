interface AuthState {
  token: string | null;
  expiresAt: number;
}

const TOKEN_BUFFER_MS = 5_000;
const STORAGE_KEY = "ai.liukonen.dev.auth";
let authState: AuthState = {
  token: null,
  expiresAt: 0,
};

function loadFromStorage(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Only restore if token hasn't expired yet
      if (parsed.expiresAt > Date.now()) {
        authState = parsed;
        console.log("Token restored from localStorage, expires in", 
          Math.round((parsed.expiresAt - Date.now()) / 1000), "seconds");
      } else {
        console.log("Stored token expired, will fetch new one");
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  } catch (err) {
    console.error("Failed to load token from storage:", err);
  }
}

function saveToStorage(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
  } catch (err) {
    console.error("Failed to save token to storage:", err);
  }
}

let inFlight: Promise<string | null> | null = null;

async function fetchNewToken(): Promise<string | null> {
  try {
    const res = await fetch("https://ai.liukonen.dev/lease", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Token request failed: ${res.status}`);
    }

    const data = await res.json();

    authState = {
      token: data.token,
      expiresAt: Date.now() + data.ttl * 1000,
    };

    console.log("NEW TOKEN ISSUED", authState);
    saveToStorage();
    console.log("NEW TOKEN ISSUED, TTL:", data.ttl, "seconds");
    
    return authState.token;
  } catch (err) {
    console.error("Could not get auth token:", err);
    authState = { token: null, expiresAt: 0 };
    return null;
  }
}

export async function getValidToken(): Promise<string | null> {
   if (!authState.token && !inFlight) {
    loadFromStorage();
  }

  // ✅ fast path - token is valid
  if (
    authState.token &&
    Date.now() < authState.expiresAt - TOKEN_BUFFER_MS
  ) {
    console.log("Using cached token, expires in", 
      Math.round((authState.expiresAt - Date.now()) / 1000), "seconds");
    return authState.token;
  }

  // ✅ prevent duplicate fetches
  if (inFlight) {
    console.log("Token fetch already in flight, waiting...");
    return inFlight;
  }

  inFlight = fetchNewToken().finally(() => {
    inFlight = null;
  });

  return inFlight;
}
