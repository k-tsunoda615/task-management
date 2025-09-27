import type { AuthError } from "@supabase/supabase-js";

type ErrorLike = Partial<Pick<AuthError, "message">> | null | undefined;

/**
 * Supabase 認証エラーのメッセージをユーザー向けに整形する。
 * 他コンポーネントでも再利用できるように共通化。
 */
export function mapAuthErrorToMessage(error: ErrorLike): string {
  if (!error || !error.message) {
    return "認証に失敗しました";
  }

  const msg = error.message;

  if (msg.includes("Invalid login credentials")) {
    return "メールアドレスまたはパスワードが正しくありません";
  }
  if (msg.includes("Email not confirmed")) {
    return "メールアドレスの確認が完了していません。メールボックスをご確認ください。";
  }
  if (msg.includes("User already registered") || msg.includes("User already exists")) {
    return "このメールアドレスは既に登録されています";
  }
  if (msg.match(/Password should be at least (\d+) characters/)) {
    return "パスワードが短すぎます。8文字以上で入力してください。";
  }
  if (msg.includes("Password should contain at least one special character")) {
    return "パスワードには記号を1つ以上含めてください。";
  }
  if (msg.includes("Password should contain at least one number")) {
    return "パスワードには数字を1つ以上含めてください。";
  }
  if (msg.includes("Password should contain at least one uppercase letter")) {
    return "パスワードには大文字を1つ以上含めてください。";
  }
  if (msg.includes("Email is invalid") || msg.includes("Invalid email")) {
    return "メールアドレスの形式が正しくありません";
  }
  if (msg.includes("Rate limit exceeded")) {
    return "リクエストが多すぎます。しばらくしてから再度お試しください。";
  }
  if (msg.includes("network error")) {
    return "ネットワークエラーが発生しました。接続環境をご確認ください。";
  }

  return msg; // その他は原文表示
}
