import { useTodoStore } from "../../stores/tasks";

export type TimerNavigationEvent = {
  action: "stop-timer";
  todoId: string;
  destination: string;
};

export default defineNuxtPlugin(() => {
  const todoStore = useTodoStore();

  // イベントバスを作成してコンポーネント間で通信できるようにする
  const timerEvent = useEventBus<TimerNavigationEvent>("timer-navigation");

  // グローバルナビゲーションガード
  useRouter().beforeEach((to, from, next) => {
    // ボードビューから別のページへの遷移を検出
    if (from.path.startsWith("/board") && !to.path.startsWith("/board")) {
      // 計測中のタスクがあるか確認
      const timingTodo = todoStore.todos.find((todo) => todo.is_timing);

      if (timingTodo) {
        // タイマー実行中の場合、確認ダイアログを表示
        if (
          confirm("タイマーが実行中です。タイマーを停止してから移動しますか？")
        ) {
          // 「OK」を選択した場合、タイマー停止イベントを発行して一時的に遷移を阻止
          timerEvent.emit({
            action: "stop-timer",
            todoId: timingTodo.id,
            destination: to.fullPath,
          });
          return next(false);
        } else {
          // 「キャンセル」を選択した場合も遷移を阻止
          return next(false);
        }
      }
    }

    // その他の場合は通常通り遷移を許可
    return next();
  });

  // イベントバスを提供
  return {
    provide: {
      timerNavigationBus: timerEvent,
    },
  };
});
