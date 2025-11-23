import { NextResponse } from "next/server";

import { getCurrencyRates } from "@/lib/currency/rates";
import { rateLimitByKey } from "@/lib/rate-limit";

export async function GET(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "anonymous";
    const limit = await rateLimitByKey(`currency:${ip}`, 60, 60);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again soon." },
        { status: 429 },
      );
    }

    const rates = await getCurrencyRates();
    return NextResponse.json({ data: rates });
  } catch (error) {
    console.error("Currency API route failed", error);
    return NextResponse.json(
      { error: "Unable to load currency data right now." },
      { status: 500 },
    );
  }
}

