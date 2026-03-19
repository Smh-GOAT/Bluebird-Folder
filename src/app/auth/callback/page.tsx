"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function AuthCallbackContent() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("处理中...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createClient();
        if (!supabase) {
          setStatus("error");
          setMessage("Supabase 客户端初始化失败");
          return;
        }

        const hash = window.location.hash;
        const query = new URLSearchParams(window.location.search);
        const type = query.get("type");

        if (hash) {
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");

          if (accessToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ""
            });

            if (error) {
              setStatus("error");
              setMessage(`验证失败: ${error.message}`);
              return;
            }

            setStatus("success");

            if (type === "recovery") {
              setMessage("密码重置链接已验证，请设置新密码...");
              setTimeout(() => {
                router.push("/?reset=password");
              }, 2000);
            } else {
              setMessage("邮箱验证成功，正在跳转...");
              setTimeout(() => {
                router.push("/?verified=success");
              }, 2000);
            }
            return;
          }
        }

        const code = query.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            setStatus("error");
            setMessage(`验证失败: ${error.message}`);
            return;
          }

          setStatus("success");
          setMessage("登录成功，正在跳转...");
          setTimeout(() => {
            router.push("/");
          }, 2000);
          return;
        }

        setStatus("error");
        setMessage("无效的验证链接");
      } catch (error) {
        setStatus("error");
        setMessage("处理验证时发生错误");
        console.error("Auth callback error:", error);
      }
    };

    handleCallback();
  }, [router]);

  const statusConfig = {
    loading: { bg: "bg-zinc-100", icon: "⏳", text: "text-zinc-600" },
    success: { bg: "bg-green-50", icon: "✅", text: "text-green-700" },
    error: { bg: "bg-red-50", icon: "❌", text: "text-red-700" }
  };

  const config = statusConfig[status];

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <div className={`w-full max-w-md rounded-2xl ${config.bg} p-8 text-center shadow-lg`}>
        <div className="mb-4 text-5xl">{config.icon}</div>
        <h1 className={`mb-2 text-xl font-semibold ${config.text}`}>
          {status === "loading" ? "请稍候" : status === "success" ? "操作成功" : "操作失败"}
        </h1>
        <p className={`${config.text} opacity-80`}>{message}</p>

        {status === "error" ? (
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-6 rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            返回首页
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-zinc-100 p-8 text-center shadow-lg">
          <div className="mb-4 text-5xl">⏳</div>
          <h1 className="mb-2 text-xl font-semibold text-zinc-600">请稍候</h1>
          <p className="text-zinc-600 opacity-80">处理中...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
