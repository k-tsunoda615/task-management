import { useTodoStore } from "../../stores/tasks";
import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";

export type TimerNavigationEvent = {
  /** 発行するアクション */
  action: "stop-timer" | "confirm-navigation";
  /** 対象の Todo ID */
  todoId: string;
  /** 遷移先のパス */
  destination: string;
};

/**
 * タイマー稼働中の遷移を防止する。
 * @description ナビゲーションガードとイベントバスを登録する。
 * @returns {object} Nuxt プラグインの提供値。
 */
const plugin = () => {
  const todoStore = useTodoStore();

  // イベントバスを作成してコンポーネント間で通信できるようにする
  const timerEvent = useEventBus<TimerNavigationEvent>("timer-navigation");

  /**
   * タイマー稼働中のページ遷移を検知する。
   * @description 稼働中は確認ダイアログを出し、必要なら遷移を止める。
   * @param {RouteLocationNormalized} to - 遷移先ルート。
   * @param {RouteLocationNormalized} from - 遷移元ルート。
   * @param {NavigationGuardNext} next - ナビゲーション制御関数。
   * @returns {void} なし。
   */
  const handleBeforeEach = (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) => {
    // ボードビューから別のページへの遷移を検出
    if (from.path.startsWith("/board") && !to.path.startsWith("/board")) {
      // 計測中のタスクがあるか確認
      const timingTodo = todoStore.todos.find((todo) => todo.is_timing);

      if (timingTodo) {
        // タイマー実行中の場合、遷移をブロックし確認イベントを発行
        // コンポーネント側で Nuxt UI のモーダルを表示して対応する
        timerEvent.emit({
          action: "confirm-navigation",
          todoId: timingTodo.id,
          destination: to.fullPath,
        });
        return next(false);
      }
    }

    // その他の場合は通常通り遷移を許可
    return next();
  };

  // グローバルナビゲーションガード
  useRouter().beforeEach(handleBeforeEach);

  // イベントバスを提供
  return {
    provide: {
      timerNavigationBus: timerEvent,
    },
  };
};

export default defineNuxtPlugin(plugin);
