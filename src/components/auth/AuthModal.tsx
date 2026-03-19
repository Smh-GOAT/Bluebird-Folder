"use client";

import { useState } from "react";
import { X, Mail, Smartphone } from "lucide-react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { PhoneLogin } from "./PhoneLogin";
import { ResetPassword } from "./ResetPassword";

type AuthMode = "login" | "register" | "phone" | "reset";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: AuthMode;
}

export function AuthModal({ isOpen, onClose, defaultMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);

  if (!isOpen) return null;

  const titles = {
    login: "登录",
    register: "注册",
    phone: "手机号登录",
    reset: "重置密码"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
          {titles[mode]}
        </h2>

        {/* Form content */}
        <div className="mb-6">
          {mode === "login" && <LoginForm onSuccess={onClose} />}
          {mode === "register" && <RegisterForm onSuccess={onClose} />}
          {mode === "phone" && <PhoneLogin onSuccess={onClose} />}
          {mode === "reset" && <ResetPassword onBack={() => setMode("login")} />}
        </div>

        {/* Mode switcher */}
        {mode !== "reset" && (
          <div className="space-y-3 border-t border-gray-100 pt-4">
            <div className="flex justify-center gap-4">
              {mode !== "login" && (
                <button
                  onClick={() => setMode("login")}
                  className="text-sm text-gray-600 transition-colors hover:text-gray-900"
                >
                  已有账号？立即登录
                </button>
              )}
              {mode !== "register" && (
                <button
                  onClick={() => setMode("register")}
                  className="text-sm text-gray-600 transition-colors hover:text-gray-900"
                >
                  还没有账号？立即注册
                </button>
              )}
            </div>

            <div className="flex justify-center gap-2">
              {mode !== "phone" && (
                <button
                  onClick={() => setMode("phone")}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                >
                  <Smartphone className="h-4 w-4" />
                  手机号登录
                </button>
              )}
              {mode === "phone" && (
                <button
                  onClick={() => setMode("login")}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                >
                  <Mail className="h-4 w-4" />
                  邮箱登录
                </button>
              )}
            </div>

            {mode === "login" && (
              <button
                onClick={() => setMode("reset")}
                className="block w-full text-center text-sm text-gray-500 transition-colors hover:text-gray-700"
              >
                忘记密码？
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
