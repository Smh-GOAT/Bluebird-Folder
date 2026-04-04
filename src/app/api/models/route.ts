import { NextRequest } from "next/server";
import { proxyGet } from "@/lib/forsion/proxy";

/**
 * Get available models for the Bluebird project from Forsion Backend.
 * Uses the project model configuration system.
 */
export async function GET(request: NextRequest) {
  return proxyGet(request, "/api/projects/bluebird/models");
}
