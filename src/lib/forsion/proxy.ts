/**
 * Helpers to proxy Next.js API routes to Forsion Backend.
 *
 * The browser sends requests to `/api/xxx` on the Next.js server.
 * These route handlers forward the request to Forsion Backend's `/api/bluebird/xxx`,
 * passing along the Authorization header.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerForsionClient, extractToken, ForsionApiError } from "./client";

/**
 * Create a Forsion server client from an incoming Next.js request.
 */
export function forsionFromRequest(request: Request) {
  const token = extractToken(request);
  return createServerForsionClient(token);
}

/**
 * Standard proxy: forwards request to Forsion Backend and returns the raw JSON.
 */
export async function proxyGet(request: NextRequest, forsionPath: string) {
  try {
    const client = forsionFromRequest(request);
    const data = await client.fetch(forsionPath);
    return NextResponse.json(data);
  } catch (error) {
    return handleForsionError(error);
  }
}

export async function proxyPost(request: NextRequest, forsionPath: string) {
  try {
    const client = forsionFromRequest(request);
    const body = await request.json();
    const data = await client.fetch(forsionPath, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(data);
  } catch (error) {
    return handleForsionError(error);
  }
}

export async function proxyPut(request: NextRequest, forsionPath: string) {
  try {
    const client = forsionFromRequest(request);
    const body = await request.json();
    const data = await client.fetch(forsionPath, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return NextResponse.json(data);
  } catch (error) {
    return handleForsionError(error);
  }
}

export async function proxyPatch(request: NextRequest, forsionPath: string) {
  try {
    const client = forsionFromRequest(request);
    const body = await request.json();
    const data = await client.fetch(forsionPath, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return NextResponse.json(data);
  } catch (error) {
    return handleForsionError(error);
  }
}

export async function proxyDelete(request: NextRequest, forsionPath: string) {
  try {
    const client = forsionFromRequest(request);
    const data = await client.fetch(forsionPath, { method: "DELETE" });
    return NextResponse.json(data);
  } catch (error) {
    return handleForsionError(error);
  }
}

function handleForsionError(error: unknown): NextResponse {
  if (error instanceof ForsionApiError) {
    return NextResponse.json(
      { code: error.status * 100, data: null, message: error.detail },
      { status: error.status }
    );
  }
  console.error("[forsion-proxy]", error);
  return NextResponse.json(
    { code: 50000, data: null, message: error instanceof Error ? error.message : "Unknown error" },
    { status: 500 }
  );
}
