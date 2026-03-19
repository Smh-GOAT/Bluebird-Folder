"use client";

import { useState } from "react";
import { sendPhoneOTP, verifyPhoneOTP } from "@/lib/supabase/auth";
import { useAuth } from "@/contexts/AuthContext";

interface PhoneLoginProps {
  onSuccess: () => void;
}

export function PhoneLogin({ onSuccess }: PhoneLoginProps) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const { refreshUser } = useAuth();

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await sendPhoneOTP(phone);
      if (result.success) {
        setStep("otp");
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(result.error || "发送验证码失败");
      }
    } catch (err) {
      setError("发生错误，请重试");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await verifyPhoneOTP(phone, otp);
      if (result.success) {
        await refreshUser();
        onSuccess();
      } else {
        setError(result.error || "验证码错误");
      }
    } catch (err) {
      setError("发生错误，请重试");
    } finally {
      setIsLoading(false);
    }
  }

  if (step === "phone") {
    return (
      <form onSubmit={handleSendOTP} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            手机号
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+86 13800138000"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <p className="mt-1 text-xs text-gray-500">请包含国家代码，如 +86</p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "发送中..." : "发送验证码"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerifyOTP} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
        验证码已发送至 {phone}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          验证码
        </label>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="123456"
          required
          maxLength={6}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "验证中..." : "验证并登录"}
      </button>

      <button
        type="button"
        onClick={() => setStep("phone")}
        disabled={countdown > 0 || isLoading}
        className="w-full rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {countdown > 0 ? `${countdown}秒后重试` : "重新发送验证码"}
      </button>
    </form>
  );
}
