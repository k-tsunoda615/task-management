import type { Todo } from "../types/todo";

export interface TodoStore {
  todos: Todo[];
  filteredTodos: Todo[];
  isLoaded: boolean;
  isLoading: boolean;
  lastSyncedAt: number | null;
  lastSyncError: string | null;
  taskFilter: "all" | "private" | "public";
  fetchTodos(options?: { force?: boolean }): Promise<void>;
  createTodo(todo: Partial<Todo>): Promise<void>;
  updateTodo(todo: Todo): Promise<void>;
  deleteTodo(id: string): Promise<void>;
  setTaskFilter(filter: "all" | "private" | "public"): void;
  updateTodoOrder(todo: { id: string; sort_order: number }): Promise<void>;
}

export function useTodoStore(): TodoStore;
