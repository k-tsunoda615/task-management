import type { AuthError, Session } from "@supabase/supabase-js";
import { mapAuthErrorToMessage } from "../utils/auth";

/**
 * 認証まわりの処理を統一し、UI の実装差を減らす。
 * @description サインイン/サインアップ/ゲストログインなどの API を提供する。
 * @returns {object} 認証操作関数と状態。
 */
export const useAuthService = () => {
  const client = useSupabaseClient();
  const user = useSupabaseUser();
  const router = useRouter();

  const loading = ref(false);
  const errorMessage = ref("");

  /**
   * ログイン処理の入口を一本化する。
   * @description メール/パスワードで認証し、必要ならリダイレクトする。
   * @param {string} email - ログインに使用するメールアドレス。
   * @param {string} password - ログインに使用するパスワード。
   * @param {string} redirectUrl - リダイレクト先（デフォルト: /board）。
   * @returns {Promise<{ success: boolean; error?: string }>} 成否とエラーメッセージ。
   */
  const loginWithPassword = async (
    email: string,
    password: string,
    redirectUrl: string = "/board",
  ) => {
    loading.value = true;
    errorMessage.value = "";
    try {
      const { error } = await client.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        errorMessage.value = mapAuthErrorToMessage(error);
        return { success: false, error: errorMessage.value };
      } else {
        if (redirectUrl) {
          router.push(redirectUrl);
        }
        return { success: true };
      }
    } catch (error) {
      console.error("認証エラー:", error);
      errorMessage.value = mapAuthErrorToMessage(error as AuthError);
      return { success: false, error: errorMessage.value };
    } finally {
      loading.value = false;
    }
  };

  /**
   * 新規登録と匿名ユーザー昇格の処理を統一する。
   * @description 状態に応じて signUp または updateUser を実行する。
   * @param {string} email - 登録に使用するメールアドレス。
   * @param {string} password - 登録に使用するパスワード。
   * @returns {Promise<{ success: boolean; error?: string; message?: string; requireConfirmation?: boolean }>} 成否とメッセージ。
   */
  const signUp = async (email: string, password: string) => {
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
      errorMessage.value = mapAuthErrorToMessage(error as AuthError);
      return { success: false, error: errorMessage.value };
    } finally {
      loading.value = false;
    }
  };

  /**
   * ゲストログインの挙動を一貫させる。
   * @description 匿名ログインを実行し、必要ならリダイレクトする。
   * @param {string} redirectUrl - リダイレクト先（デフォルト: /board）。
   * @returns {Promise<{ success: boolean; error?: string }>} 成否とエラーメッセージ。
   */
  const loginAsGuest = async (redirectUrl: string = "/board") => {
    loading.value = true;
    errorMessage.value = "";
    try {
      const { error } = await client.auth.signInAnonymously();
      if (error) {
        errorMessage.value = mapAuthErrorToMessage(error);
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
  };

  /**
   * パスワードリセットの実装を一箇所にまとめる。
   * @description resetPasswordForEmail を呼び、結果を返す。
   * @param {string} email - リセット対象のメールアドレス。
   * @returns {Promise<{ success: boolean; error?: string; message?: string }>} 成否とメッセージ。
   */
  const resetPassword = async (email: string) => {
    loading.value = true;
    try {
      const { error } = await client.auth.resetPasswordForEmail(email);
      if (error) {
        return { success: false, error: mapAuthErrorToMessage(error) };
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
  };

  /**
   * サインアウトの挙動を統一する。
   * @description signOut を実行し、必要ならリダイレクトする。
   * @param {string} redirectUrl - リダイレクト先（デフォルト: /）。
   * @returns {Promise<{ success: boolean; error?: string }>} 成否とエラーメッセージ。
   */
  const signOut = async (redirectUrl: string = "/") => {
    try {
      const { error } = await client.auth.signOut();
      if (error) throw error;
      if (redirectUrl) {
        router.push(redirectUrl);
      }
      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error: mapAuthErrorToMessage(error as AuthError),
      };
    }
  };

  /**
   * 認証状態の変化を UI に反映させる。
   * @description Supabase の onAuthStateChange を登録する。
   * @param {(event: string, session: Session | null) => void} callback - 状態変化時のコールバック。
   * @returns {() => void} 解除用の関数。
   */
  const watchAuthState = (
    callback: (event: string, session: Session | null) => void,
  ) => {
    const { data } = client.auth.onAuthStateChange(callback);

    // クリーンアップ関数を返す
    return () => {
      data.subscription.unsubscribe();
    };
  };

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
    mapAuthErrorToMessage,
  };
};
