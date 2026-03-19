import { createClient } from "./client";
import type { Session, User } from "@supabase/supabase-js";

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: User;
  session?: Session;
}

// 邮箱/密码注册
export async function signUpWithEmail(
  email: string,
  password: string
): Promise<AuthResponse> {
  const supabase = createClient();
  if (!supabase) {
    return { success: false, error: "Supabase client not initialized" };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    user: data.user || undefined,
    session: data.session || undefined
  };
}

// 邮箱/密码登录
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResponse> {
  const supabase = createClient();
  if (!supabase) {
    return { success: false, error: "Supabase client not initialized" };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    user: data.user || undefined,
    session: data.session || undefined
  };
}

// 手机号验证码登录 - 发送验证码
export async function sendPhoneOTP(phone: string): Promise<AuthResponse> {
  const supabase = createClient();
  if (!supabase) {
    return { success: false, error: "Supabase client not initialized" };
  }

  const { data, error } = await supabase.auth.signInWithOtp({
    phone
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// 手机号验证码登录 - 验证验证码
export async function verifyPhoneOTP(
  phone: string,
  token: string
): Promise<AuthResponse> {
  const supabase = createClient();
  if (!supabase) {
    return { success: false, error: "Supabase client not initialized" };
  }

  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms"
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    user: data.user || undefined,
    session: data.session || undefined
  };
}

// 登出
export async function signOut(): Promise<AuthResponse> {
  const supabase = createClient();
  if (!supabase) {
    return { success: false, error: "Supabase client not initialized" };
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// 重置密码
export async function resetPassword(email: string): Promise<AuthResponse> {
  const supabase = createClient();
  if (!supabase) {
    return { success: false, error: "Supabase client not initialized" };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// 获取当前用户
export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
}

// 获取当前会话
export async function getCurrentSession(): Promise<Session | null> {
  const supabase = createClient();
  if (!supabase) {
    return null;
  }

  const { data } = await supabase.auth.getSession();
  return data.session;
}

// 监听认证状态变化
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  const supabase = createClient();
  if (!supabase) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }

  return supabase.auth.onAuthStateChange(callback);
}

// 更新密码
export async function updatePassword(newPassword: string): Promise<AuthResponse> {
  const supabase = createClient();
  if (!supabase) {
    return { success: false, error: "Supabase client not initialized" };
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// 重新发送邮箱验证
export async function resendEmailVerification(email: string): Promise<AuthResponse> {
  const supabase = createClient();
  if (!supabase) {
    return { success: false, error: "Supabase client not initialized" };
  }

  const { error } = await supabase.auth.resend({
    type: "signup",
    email
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
