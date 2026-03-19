"use client";

import { useState } from "react";
import { User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function UserMenu() {
  const { user, signOut, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    setIsOpen(false);
  }

  const displayName = user?.email?.split("@")[0] || "用户";
  const email = user?.email || "";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-gray-300"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-medium text-white">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-medium text-gray-900">{displayName}</p>
          <p className="truncate text-xs text-gray-500">{email}</p>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full left-0 right-0 z-50 mb-2 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              {isLoading ? "退出中..." : "退出登录"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
