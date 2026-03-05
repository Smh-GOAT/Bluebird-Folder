"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export function AuthPanel() {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) {
      return;
    }
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function signUp() {
    if (!supabase) {
      setMessage("请先配置 .env.local 中的 Supabase 变量。");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    setMessage(error ? error.message : "注册成功，请检查邮箱验证。");
  }

  async function signIn() {
    if (!supabase) {
      setMessage("请先配置 .env.local 中的 Supabase 变量。");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    setMessage(error ? error.message : "登录成功。");
  }

  async function signOut() {
    if (!supabase) {
      return;
    }
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    setMessage("已退出登录。");
  }

  return (
    <section className="ui-block p-4">
      <h2 className="mb-2 text-sm font-semibold">账号（Supabase Auth）</h2>
      {user ? (
        <div className="space-y-2 text-sm">
          <p className="break-all text-zinc-700">{user.email}</p>
          <button
            type="button"
            onClick={signOut}
            className="ui-btn-secondary w-full text-left"
            disabled={loading}
          >
            退出登录
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {!supabase ? (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              当前未配置 Supabase，登录组件处于只读提示状态。
            </p>
          ) : null}
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="邮箱"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-300"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="密码"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-300"
          />
          <div className="space-y-3">
            <button
              type="button"
              onClick={signIn}
              disabled={loading || !supabase}
              className="ui-btn-primary w-full py-2.5 font-medium"
            >
              登录
            </button>

            <p className="text-center text-sm text-zinc-500">
              还没有账号？
              <button
                type="button"
                onClick={signUp}
                disabled={loading || !supabase}
                className="ml-1 font-medium text-zinc-900 hover:underline disabled:opacity-50"
              >
                立即注册
              </button>
            </p>
          </div>
        </div>
      )}
      {message ? <p className="mt-2 text-xs text-zinc-500">{message}</p> : null}
    </section>
  );
}
