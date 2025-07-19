import type { AuthError, Session } from "@supabase/supabase-js";

export function useAuthService() {
  const client = useSupabaseClient();
  const user = useSupabaseUser();
  const router = useRouter();

  const loading = ref(false);
  const errorMessage = ref("");

  // エラーメッセージ日本語化関数
  function getAuthErrorMessage(error: AuthError): string {
    if (!error || !error.message) return "認証に失敗しました";
    const msg = error.message;
    if (msg.includes("Invalid login credentials")) {
      return "メールアドレスまたはパスワードが正しくありません";
    }
    if (msg.includes("Email not confirmed")) {
      return "メールアドレスの確認が完了していません。メールボックスをご確認ください。";
    }
    if (
      msg.includes("User already registered") ||
      msg.includes("User already exists")
    ) {
      return "このメールアドレスは既に登録されています";
    }
    if (msg.match(/Password should be at least (\d+) characters/)) {
      return "パスワードが短すぎます。8文字以上で入力してください。";
    }
    if (
      msg.includes("Password should contain at least one special character")
    ) {
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

  // 通常のログイン処理
  async function loginWithPassword(
    email: string,
    password: string,
    redirectUrl: string = "/board"
  ) {
    loading.value = true;
    errorMessage.value = "";
    try {
      const { error } = await client.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        errorMessage.value = getAuthErrorMessage(error);
        return { success: false, error: errorMessage.value };
      } else {
        if (redirectUrl) {
          router.push(redirectUrl);
        }
        return { success: true };
      }
    } catch (error) {
      console.error("認証エラー:", error);
      errorMessage.value = getAuthErrorMessage(error as AuthError);
      return { success: false, error: errorMessage.value };
    } finally {
      loading.value = false;
    }
  }

  // 新規登録処理
  async function signUp(email: string, password: string) {
    loading.value = true;
    errorMessage.value = "";
    try {
      // 匿名ユーザーから永続的なユーザーへの変換
      if (user.value?.is_anonymous) {
        // メールアドレスのみ更新
        const { error: updateError } = await client.auth.updateUser({
          email,
        });

        if (updateError) {
          // メール更新でエラーが発生した場合
          throw updateError;
        }

        errorMessage.value =
          "確認メールを送信しました。メールボックスを確認して確認リンクをクリックしてください。";
        return {
          success: true,
          message: errorMessage.value,
          requireConfirmation: true,
        };
      } else {
        // 通常の新規登録
        const { error } = await client.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        errorMessage.value =
          "確認メールを送信しました。メールボックスをご確認ください。";
        return {
          success: true,
          message: errorMessage.value,
          requireConfirmation: true,
        };
      }
    } catch (error) {
      console.error("認証エラー:", error);
      errorMessage.value = getAuthErrorMessage(error as AuthError);
      return { success: false, error: errorMessage.value };
    } finally {
      loading.value = false;
    }
  }

  // ゲストログイン処理
  async function loginAsGuest(redirectUrl: string = "/board") {
    loading.value = true;
    errorMessage.value = "";
    try {
      const { error } = await client.auth.signInAnonymously();
      if (error) {
        errorMessage.value = getAuthErrorMessage(error);
        return { success: false, error: errorMessage.value };
      } else {
        if (redirectUrl) {
          router.push(redirectUrl);
        }
        return { success: true };
      }
    } catch {
      errorMessage.value = "ゲストログイン中にエラーが発生しました。";
      return { success: false, error: errorMessage.value };
    } finally {
      loading.value = false;
    }
  }

  // パスワードリセット
  async function resetPassword(email: string) {
    loading.value = true;
    try {
      const { error } = await client.auth.resetPasswordForEmail(email);
      if (error) {
        return { success: false, error: getAuthErrorMessage(error) };
      } else {
        return {
          success: true,
          message:
            "パスワードリセット用のメールを送信しました。メールボックスをご確認ください。",
        };
      }
    } catch {
      return {
        success: false,
        error: "リセット処理中にエラーが発生しました。",
      };
    } finally {
      loading.value = false;
    }
  }

  // サインアウト処理
  async function signOut(redirectUrl: string = "/") {
    try {
      const { error } = await client.auth.signOut();
      if (error) throw error;
      if (redirectUrl) {
        router.push(redirectUrl);
      }
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: getAuthErrorMessage(error as AuthError) };
    }
  }

  // 認証状態変更を監視
  function watchAuthState(
    callback: (event: string, session: Session | null) => void
  ) {
    const { data } = client.auth.onAuthStateChange(callback);

    // クリーンアップ関数を返す
    return () => {
      data.subscription.unsubscribe();
    };
  }

  return {
    user,
    loading,
    errorMessage,
    loginWithPassword,
    signUp,
    loginAsGuest,
    resetPassword,
    signOut,
    watchAuthState,
    getAuthErrorMessage,
  };
}
