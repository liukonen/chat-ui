interface AuthState {
  token: string | null;
  expiresAt: number;
}

const TOKEN_BUFFER_MS = 5_000;

let authState: AuthState = {
  token: null,
  expiresAt: 0,
};

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

    return authState.token;
  } catch (err) {
    console.error("Could not get auth token:", err);
    authState = { token: null, expiresAt: 0 };
    return null;
  }
}

export async function getValidToken(): Promise<string | null> {
  // ✅ fast path
  if (
    authState.token &&
    Date.now() < authState.expiresAt - TOKEN_BUFFER_MS
  ) {
    return authState.token;
  }

  // ✅ prevent duplicate fetches
  if (inFlight) {
    return inFlight;
  }

  inFlight = fetchNewToken().finally(() => {
    inFlight = null;
  });

  return inFlight;
}
