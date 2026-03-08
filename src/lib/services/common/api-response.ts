import { NextResponse } from "next/server";
import type { ErrorCode } from "@/lib/services/common/error-codes";

export function successResponse<T>(data: T) {
  return NextResponse.json({
    code: 0,
    data,
    message: "success"
  });
}

export function errorResponse(code: ErrorCode, message: string, status = 400) {
  return NextResponse.json(
    {
      code,
      data: null,
      message
    },
    { status }
  );
}
