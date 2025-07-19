import { defineStore } from "pinia";
import type { Todo } from "../types/todo";
import { useTodoData } from "../app/composables/useTodoData";

export const useTodoStore = defineStore("todo", {
  state: () => ({
    todos: [] as Todo[],
    isLoaded: false,
    taskFilter: "public" as "all" | "private" | "public",
  }),

  getters: {
    todosByVisibility(): Todo[] {
      if (this.taskFilter === "all") {
        return this.todos;
      } else if (this.taskFilter === "private") {
        return this.todos.filter((todo) => todo.is_private);
      } else {
        return this.todos.filter((todo) => !todo.is_private);
      }
    },
    totalTodoCount(): number {
      return this.todos.length;
    },
  },

  actions: {
    async fetchTodos() {
      this.isLoaded = false;
      try {
        const todoData = useTodoData();
        const todos = await todoData.fetchAllTodos();
        this.todos = todos;
        this.isLoaded = true;
        console.log("[fetchTodos] データ取得完了:", this.todos.length);
      } catch (error) {
        console.error("Todoの取得中にエラーが発生しました:", error);
        throw error;
      }
    },

    async createTodo(todo: Partial<Todo>) {
      try {
        const todoData = useTodoData();
        const newTodo = await todoData.createTodo(todo);
        this.todos.unshift(newTodo);
        return newTodo;
      } catch (error) {
        console.error("Todo作成中にエラーが発生しました:", error);
        throw error;
      }
    },

    async updateTodo(todo: Partial<Todo>) {
      if (!todo.id) throw new Error("Todo IDが指定されていません");
      try {
        const todoData = useTodoData();
        const updatedData = await todoData.updateTodo(todo);

        // ローカルストアのデータ更新
        this._updateLocalTodo(todo);

        return updatedData;
      } catch (error) {
        console.error("Todo更新中にエラーが発生しました:", error);
        throw error;
      }
    },

    // ローカルTodoデータを更新する内部メソッド
    _updateLocalTodo(todo: Partial<Todo>) {
      const index = this.todos.findIndex((t) => t.id === todo.id);
      if (index !== -1) {
        // 既存のTodoを更新
        this.todos[index] = {
          ...this.todos[index],
          ...todo,
        };
        console.log("[updateTodo] ローカルデータ更新:", this.todos[index]);
      } else {
        // 見つからない場合は全てのデータを再取得
        this.fetchTodos();
      }
    },

    async deleteTodo(id: string) {
      try {
        const todoData = useTodoData();
        await todoData.deleteTodo(id);

        // ストアからも削除
        this.todos = this.todos.filter((t) => t.id !== id);
        return true;
      } catch (error) {
        console.error(`Todo ID:${id} の削除中にエラーが発生:`, error);
        throw error;
      }
    },

    setTaskFilter(filter: "all" | "private" | "public") {
      this.taskFilter = filter;
    },

    async updateTodoOrder(todo: { id: string; sort_order: number }) {
      try {
        console.log("[updateTodoOrder] サーバー更新開始:", todo);
        const todoData = useTodoData();
        const result = await todoData.updateTodoOrder(todo);
        console.log("[updateTodoOrder] サーバー更新結果:", result);

        // ローカルのtodosも更新
        const index = this.todos.findIndex((t) => t.id === todo.id);
        if (index !== -1) {
          this.todos[index].sort_order = todo.sort_order;
          console.log(
            "[updateTodoOrder] ローカルデータ更新成功:",
            this.todos[index]
          );
        } else {
          console.warn(
            "[updateTodoOrder] ローカルでTodoが見つかりません:",
            todo.id
          );
          await this.fetchTodos();
        }

        return true;
      } catch (error) {
        console.error("[updateTodoOrder] 更新エラー:", error);
        throw error;
      }
    },
  },
});
