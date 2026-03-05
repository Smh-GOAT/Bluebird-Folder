import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    code: 0,
    data: {
      status: "ok",
      milestone: "0"
    },
    message: "success"
  });
}
