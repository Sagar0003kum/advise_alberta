import { NextResponse } from "next/server";

// Cache validated URLs to avoid re-checking
const validationCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ valid: false });
    }

    // Check cache first
    const cached = validationCache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({ valid: cached.valid, cached: true });
    }

    // Validate URL format
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      validationCache.set(url, { valid: false, timestamp: Date.now() });
      return NextResponse.json({ valid: false });
    }

    // Only allow http/https
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      validationCache.set(url, { valid: false, timestamp: Date.now() });
      return NextResponse.json({ valid: false });
    }

    // HEAD request with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

    try {
      const res = await fetch(url, {
        method: "HEAD",
        signal: controller.signal,
        redirect: "follow",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; AlbertaFinder/1.0; URL validator)",
        },
      });

      clearTimeout(timeout);

      // Consider 200, 301, 302, 303, 307, 308 as valid (page exists)
      // 404, 410, 500+ as invalid
      const valid = res.status >= 200 && res.status < 400;

      validationCache.set(url, { valid, timestamp: Date.now() });

      // Clean cache if too large
      if (validationCache.size > 1000) {
        const oldest = validationCache.keys().next().value;
        validationCache.delete(oldest);
      }

      return NextResponse.json({ valid, status: res.status });
    } catch (fetchError) {
      clearTimeout(timeout);

      // If HEAD is blocked, try GET with range header (some servers block HEAD)
      try {
        const getController = new AbortController();
        const getTimeout = setTimeout(() => getController.abort(), 5000);

        const getRes = await fetch(url, {
          method: "GET",
          signal: getController.signal,
          redirect: "follow",
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; AlbertaFinder/1.0; URL validator)",
            Range: "bytes=0-0", // Only fetch 1 byte to minimize data
          },
        });

        clearTimeout(getTimeout);
        const valid = getRes.status >= 200 && getRes.status < 400;
        validationCache.set(url, { valid, timestamp: Date.now() });
        return NextResponse.json({ valid, status: getRes.status });
      } catch {
        // Both HEAD and GET failed — assume invalid
        validationCache.set(url, { valid: false, timestamp: Date.now() });
        return NextResponse.json({ valid: false, error: "unreachable" });
      }
    }
  } catch (error) {
    return NextResponse.json({ valid: false, error: error.message });
  }
}
