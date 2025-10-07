import crypto from "crypto";
import { NextResponse } from "next/server";

const SHIPROCKET_API_KEY = process.env.SHIPROCKET_API_KEY!;
const SHIPROCKET_SECRET = process.env.SHIPROCKET_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Convert body to string for HMAC
    const payloadString = JSON.stringify(body);

    // Generate HMAC SHA256 in Base64
    const hmac = crypto
      .createHmac("sha256", SHIPROCKET_SECRET)
      .update(payloadString)
      .digest("base64");

    // Send request to Shiprocket webhook endpoint
    const response = await fetch(
      "https://checkout-api.shiprocket.com/wh/v1/custom/product",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": SHIPROCKET_API_KEY,
          "X-Api-HMAC-SHA256": hmac,
        },
        body: payloadString,
      }
    );

    const data = await response.json();

    return NextResponse.json({
      ok: true,
      status: response.status,
      shiprocketResponse: data,
    });
  } catch (error) {
    console.error("Shiprocket Product Webhook Error:", error);
    return NextResponse.json(
      { ok: false, message: "Error sending to Shiprocket", error },
      { status: 500 }
    );
  }
}
