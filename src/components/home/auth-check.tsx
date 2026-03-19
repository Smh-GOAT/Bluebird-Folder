"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface AuthCheckProps {
  onAuthRequired: () => void;
}

export function AuthCheck({ onAuthRequired }: AuthCheckProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const authParam = searchParams.get("auth");
    if (authParam === "required") {
      onAuthRequired();
    }
  }, [searchParams, onAuthRequired]);

  return null;
}
