import {
  TASK_STATUS,
  LEGACY_STATUS_MAPPING,
  DB_STATUS_MAPPING,
} from "./constants";
import type { TaskStatus } from "./constants";
import type { Todo } from "../types/todo";

/**
 * ステータスを正規化するヘルパー関数
 */
export function normalizeStatus(status: string): TaskStatus {
  if (Object.keys(LEGACY_STATUS_MAPPING).includes(status)) {
    return LEGACY_STATUS_MAPPING[status as keyof typeof LEGACY_STATUS_MAPPING];
  }
  // マッピングにない場合はデフォルト値を返す
  return TASK_STATUS.PRIORITY;
}

/**
 * Todoデータを正規化する関数
 */
export function normalizeTodo(todo: any): Todo {
  // ステータスを新しい形式に正規化
  if (!todo.status) {
    todo.status = TASK_STATUS.PRIORITY;
  } else {
    // レガシーステータスを新しい形式に変換
    todo.status = normalizeStatus(todo.status);
  }

  if (todo.total_time !== undefined) {
    todo.total_time = Array.isArray(todo.total_time)
      ? todo.total_time[0]
      : todo.total_time;
  }

  // タグの正規化
  todo.tags = (todo.todo_tags || []).map((tt: any) => tt.tag).filter(Boolean);

  return todo;
}

/**
 * DBへの保存用にTodoデータを変換する関数
 */
export function convertTodoForDB(todo: Partial<Todo>): any {
  const dbData = { ...todo };

  // tags属性を除外
  const { tags, ...rest } = dbData;

  // ステータスをDB形式に変換
  if (todo.status) {
    const dbStatus = DB_STATUS_MAPPING[todo.status as TaskStatus];
    return {
      ...rest,
      status: dbStatus,
    };
  }

  return rest;
}
