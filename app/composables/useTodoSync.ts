import { computed } from "vue";
import { useTodoStore } from "../../stores/tasks";

const DEFAULT_INTERVAL =
  Number(useRuntimeConfig().public.todoRefreshIntervalMs) || 1800000;

type AutoRefreshState = {
  started: boolean;
  cleanup?: () => void;
};

export function useTodoSync() {
  const todoStore = useTodoStore();
  const supabaseUser = useSupabaseUser();
  const autoRefreshState = useState<AutoRefreshState>(
    "todo-auto-refresh-state",
    () => ({
      started: false,
      cleanup: undefined,
    })
  );

  const refresh = async () => {
    if (!supabaseUser.value?.id) {
      return;
    }
    const shouldForce = todoStore.isLoaded;
    await todoStore.fetchTodos({ force: shouldForce });
  };

  const startAutoRefresh = (options?: { intervalMs?: number }) => {
    if (!process.client || autoRefreshState.value.started) {
      return;
    }

    const intervalMs = options?.intervalMs ?? DEFAULT_INTERVAL;

    const focusHandler = () => {
      refresh().catch((error) => {
        console.error("[useTodoSync] フォーカス時の再取得に失敗:", error);
      });
    };

    const visibilityHandler = () => {
      if (document.hidden) {
        return;
      }

      refresh().catch((error) => {
        console.error("[useTodoSync] 表示復帰時の再取得に失敗:", error);
      });
    };

    window.addEventListener("focus", focusHandler);
    document.addEventListener("visibilitychange", visibilityHandler);

    const intervalId = window.setInterval(() => {
      if (document.hidden) {
        return;
      }

      refresh().catch((error) => {
        console.error("[useTodoSync] 定期再取得に失敗:", error);
      });
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

    refresh().catch((error) => {
      console.error("[useTodoSync] 初期再取得に失敗:", error);
    });
  };

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
}
