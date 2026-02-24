import { useTodoStore } from "../../stores/tasks";

const DEFAULT_INTERVAL_FALLBACK = 1800000;

type AutoRefreshState = {
  started: boolean;
  cleanup?: () => void;
};

/**
 * タスクの再取得タイミングを統一する。
 * @description フォーカス/可視化/定期実行での再取得を管理する。
 * @returns {object} 同期制御用の関数と状態。
 */
export const useTodoSync = () => {
  /**
   * 設定値が未指定でも安定動作させる。
   * @description runtimeConfig からリフレッシュ間隔を解決する。
   * @returns {number} リフレッシュ間隔（ms）。
   */
  const resolveDefaultInterval = () => {
    const runtimeConfig = useRuntimeConfig();
    return (
      Number(runtimeConfig.public.todoRefreshIntervalMs) ||
      DEFAULT_INTERVAL_FALLBACK
    );
  };

  const todoStore = useTodoStore();
  const supabaseUser = useSupabaseUser();
  const autoRefreshState = useState<AutoRefreshState>(
    "todo-auto-refresh-state",
    () => ({
      started: false,
      cleanup: undefined,
    })
  );

  /**
   * 一貫した再取得処理を提供する。
   * @description ログイン状態を確認し、必要なら fetch を実行する。
   * @returns {Promise<void>} 再取得の完了。
   */
  const refresh = async () => {
    if (!supabaseUser.value?.id) {
      return;
    }
    const shouldForce = todoStore.isLoaded;
    await todoStore.fetchTodos({ force: shouldForce });
  };

  /**
   * 自動同期の開始条件を統一する。
   * @description イベントと interval を設定し、初回再取得を実行する。
   * @param {{ intervalMs?: number }} [options] - リフレッシュ間隔の上書き。
   * @returns {void} 自動同期の開始。
   */
  const startAutoRefresh = (options?: { intervalMs?: number }) => {
    if (!import.meta.client || autoRefreshState.value.started) {
      return;
    }

    const intervalMs = options?.intervalMs ?? resolveDefaultInterval();

    const handleRefreshError = (context: string, error: unknown) => {
      console.error(`[useTodoSync] ${context}の再取得に失敗:`, error);
      useToast().add({
        title: "データの同期に失敗しました",
        description: "ネットワーク接続を確認してください",
        color: "amber",
        icon: "i-heroicons-exclamation-triangle",
        timeout: 5000,
      });
    };

    const focusHandler = () => {
      refresh().catch((error) => handleRefreshError("フォーカス時", error));
    };

    const visibilityHandler = () => {
      if (document.hidden) {
        return;
      }

      refresh().catch((error) => handleRefreshError("表示復帰時", error));
    };

    window.addEventListener("focus", focusHandler);
    document.addEventListener("visibilitychange", visibilityHandler);

    const intervalId = window.setInterval(() => {
      if (document.hidden) {
        return;
      }

      refresh().catch((error) => handleRefreshError("定期", error));
    }, intervalMs);

    const cleanup = () => {
      window.removeEventListener("focus", focusHandler);
      document.removeEventListener("visibilitychange", visibilityHandler);
      window.clearInterval(intervalId);
      autoRefreshState.value.started = false;
      autoRefreshState.value.cleanup = undefined;
    };

    autoRefreshState.value.started = true;
    autoRefreshState.value.cleanup = cleanup;

    refresh().catch((error) => handleRefreshError("初期", error));
  };

  /**
   * 自動同期を確実に停止する。
   * @description 登録済みのリスナーと interval を解除する。
   * @returns {void} 自動同期の停止。
   */
  const stopAutoRefresh = () => {
    if (autoRefreshState.value.cleanup) {
      autoRefreshState.value.cleanup();
    }
  };

  return {
    refresh,
    startAutoRefresh,
    stopAutoRefresh,
    isAutoRefreshActive: computed(() => autoRefreshState.value.started),
    lastSyncedAt: computed(() => todoStore.lastSyncedAt),
    lastSyncError: computed(() => todoStore.lastSyncError),
    isSyncing: computed(() => todoStore.isLoading),
  };
};
