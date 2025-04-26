import type { Todo } from "~/types/todo";

export interface TodoStore {
  todos: Todo[];
  filteredTodos: Todo[];
  isLoaded: boolean;
  taskFilter: "all" | "private" | "public";
  fetchTodos(): Promise<void>;
  createTodo(todo: Partial<Todo>): Promise<void>;
  updateTodo(todo: Todo): Promise<void>;
  deleteTodo(id: string): Promise<void>;
  setTaskFilter(filter: "all" | "private" | "public"): void;
  updateTodoOrder(todo: { id: string; sort_order: number }): Promise<void>;
}

export function useTodoStore(): TodoStore;
