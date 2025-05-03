import { ref } from "vue";
import type { Todo } from "@/types/todo";

export function useTaskTimer() {
  const timerInterval = ref<number | null>(null);
  const startTime = ref<number | null>(null);
  const currentTotalTime = ref(0);

  // タイマーを開始する
  function startTimerForTodo(todo: Todo, onUpdate: (total: number) => void) {
    currentTotalTime.value = extractTotalTime(todo.total_time);
    startTime.value = Date.now();
    if (timerInterval.value) {
      cancelAnimationFrame(timerInterval.value);
      timerInterval.value = null;
    }
    const updateTimer = () => {
      if (!startTime.value) return;
      const elapsedSeconds = Math.floor((Date.now() - startTime.value) / 1000);
      const newTotalTime = extractTotalTime(todo.total_time) + elapsedSeconds;
      if (currentTotalTime.value !== newTotalTime) {
        currentTotalTime.value = newTotalTime;
        onUpdate(currentTotalTime.value);
      }
      timerInterval.value = requestAnimationFrame(updateTimer);
    };
    timerInterval.value = requestAnimationFrame(updateTimer);
  }

  // タイマーを停止する
  function stopTimer(todo: Todo) {
    if (timerInterval.value) {
      cancelAnimationFrame(timerInterval.value);
      timerInterval.value = null;
    }
    if (startTime.value) {
      const elapsedSeconds = Math.floor((Date.now() - startTime.value) / 1000);
      currentTotalTime.value =
        extractTotalTime(todo.total_time) + elapsedSeconds;
      startTime.value = null;
    }
  }

  // total_timeから数値を抽出
  function extractTotalTime(time: number | number[] | undefined): number {
    if (Array.isArray(time) && time.length > 0) {
      return time[0];
    }
    return typeof time === "number" ? time : 0;
  }

  return {
    timerInterval,
    startTime,
    currentTotalTime,
    startTimerForTodo,
    stopTimer,
    extractTotalTime,
  };
}
