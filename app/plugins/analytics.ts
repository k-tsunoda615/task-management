import { initDataLayer, pushEvent } from "../utils/analytics";

export default defineNuxtPlugin((nuxtApp) => {
  // クライアントサイドでのみ実行
  if (process.client) {
    // dataLayer初期化
    initDataLayer();

    // 各ページナビゲーション時に自動的にページビューイベントを送信
    nuxtApp.hook("page:finish", () => {
      const route = useRoute();

      // ページビューイベント送信
      pushEvent("page_view", {
        page_title: document.title,
        page_path: route.path,
        page_location: window.location.href,
      });
    });

    // ユーザー認証状態の変更を監視
    nuxtApp.hook("app:mounted", () => {
      const user = useSupabaseUser();

      watch(user, (newUser) => {
        if (newUser) {
          // ログイン状態に変わった
          pushEvent("user_login", {
            user_id: newUser.id,
            is_anonymous: newUser.is_anonymous,
          });
        }
      });
    });
  }

  return {
    provide: {
      analytics: {
        trackEvent: pushEvent,
      },
    },
  };
});

/**
 * フォーム送信イベント
 * @param formId フォームID
 * @param formName フォーム名
 * @param formDestination フォーム送信先URL
 * @param formLength フォームフィールド数
 */
export const trackFormSubmit = (
  formId: string,
  formName: string | null,
  formDestination: string,
  formLength: number,
) => {
  pushEvent("form_submit", {
    eventModel: {
      form_id: formId,
      form_name: formName,
      form_destination: formDestination,
      form_length: formLength,
      send_to: process.env.NUXT_PUBLIC_GTM_ID || "",
    },
  });
};

/**
 * フォーム完了イベント
 * @param formId フォームID
 * @param formName フォーム名
 * @param formType フォームタイプ
 * @param formLength フォームフィールド数
 */
export const trackFormComplete = (
  formId: string,
  formName: string,
  formType: string,
  formLength: number,
) => {
  pushEvent("form_complete", {
    form_id: formId,
    form_name: formName,
    form_type: formType,
    form_length: formLength,
  });
};

/**
 * フォームエラーイベント
 * @param formId フォームID
 * @param formName フォーム名
 * @param errorMessage エラーメッセージ
 * @param errorField エラーが発生したフィールド名
 */
export const trackFormError = (
  formId: string,
  formName: string,
  errorMessage: string,
  errorField?: string,
) => {
  pushEvent("form_error", {
    form_id: formId,
    form_name: formName,
    error_message: errorMessage,
    error_field: errorField || "",
  });
};

/**
 * フォーム開始イベント
 * @param formId フォームID
 * @param formName フォーム名
 * @param formType フォームタイプ
 */
export const trackFormStart = (
  formId: string,
  formName: string,
  formType: string,
) => {
  pushEvent("form_start", {
    form_id: formId,
    form_name: formName,
    form_type: formType,
  });
};
