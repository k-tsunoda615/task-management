import { defineStore } from "pinia";
import type { Todo, TodoAsset } from "../types/todo";
import { useTaskRepository } from "../app/composables/useTaskRepository";

export const useTodoStore = defineStore("todo", {
  state: () => ({
    todos: [] as Todo[],
    isLoaded: false,
    isLoading: false,
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
      try {
        const todoData = useTaskRepository();
        const { data: todos, pending, error } = await todoData.fetchAllTodos();

        this.isLoading = pending.value;

        if (error.value) {
          console.error("Todoの取得中にエラーが発生しました:", error.value);
          throw error.value;
        }

        if (todos.value) {
          this.todos = todos.value;
          this.isLoaded = true;
          console.log("[fetchTodos] データ取得完了:", this.todos.length);
        }
      } catch (error) {
        console.error("Todoの取得中にエラーが発生しました:", error);
        throw error;
      }
    },

    async createTodo(todo: Partial<Todo>) {
      try {
        const todoData = useTaskRepository();
        const newTodo = await todoData.createTodo(todo);

        if (newTodo) {
          // 新しく作成されたTodoを配列の先頭に追加
          this.todos = [newTodo, ...this.todos];
        }

        return newTodo;
      } catch (error) {
        console.error("Todo作成中にエラーが発生しました:", error);
        throw error;
      }
    },

    async updateTodo(todo: Partial<Todo>) {
      if (!todo.id) throw new Error("Todo IDが指定されていません");
      try {
        const todoData = useTaskRepository();
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
      if (index !== -1 && this.todos[index] && todo.id) {
        // 既存のTodoを更新
        this.todos[index] = {
          ...this.todos[index]!,
          ...todo,
        } as Todo;
        console.log("[updateTodo] ローカルデータ更新:", this.todos[index]);
      } else {
        // 見つからない場合は全てのデータを再取得
        this.fetchTodos();
      }
    },

    async deleteTodo(id: string) {
      try {
        const todoData = useTaskRepository();
        await todoData.deleteTodo(id);

        // ストアからも削除
        this.todos = this.todos.filter((t) => t.id !== id);
        return true;
      } catch (error) {
        console.error(`Todo ID:${id} の削除中にエラーが発生:`, error);
        throw error;
      }
    },

    async uploadTodoAsset(todoId: string, file: File) {
      try {
        const repository = useTaskRepository();
        const asset = await repository.uploadTodoAsset(todoId, file);
        this._appendAsset(todoId, asset);
        return asset;
      } catch (error) {
        console.error("[useTodoStore] 添付アップロード中にエラー:", error);
        throw error;
      }
    },

    async deleteTodoAsset(asset: TodoAsset) {
      try {
        const repository = useTaskRepository();
        await repository.deleteTodoAsset(asset);
        this._removeAsset(asset);
        return true;
      } catch (error) {
        console.error("[useTodoStore] 添付削除中にエラー:", error);
        throw error;
      }
    },

    async refreshTodo(todoId: string) {
      try {
        const repository = useTaskRepository();
        const { data, error } = await repository.fetchTodoById(todoId);
        if (error.value) {
          throw error.value;
        }
        if (data.value) {
          this._replaceTodo(data.value);
        }
      } catch (error) {
        console.error("[useTodoStore] Todo再取得中にエラー:", error);
        throw error;
      }
    },

    setTaskFilter(filter: "all" | "private" | "public") {
      this.taskFilter = filter;
    },

    async updateTodoOrder(todo: { id: string; sort_order: number }) {
      try {
        console.log("[updateTodoOrder] サーバー更新開始:", todo);
        const todoData = useTaskRepository();
        const result = await todoData.updateTodoOrder(todo);
        console.log("[updateTodoOrder] サーバー更新結果:", result);

        // ローカルのtodosも更新
        const index = this.todos.findIndex((t) => t.id === todo.id);
        if (index !== -1 && this.todos[index]) {
          this.todos[index]!.sort_order = todo.sort_order;
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

    _appendAsset(todoId: string, asset: TodoAsset) {
      const index = this.todos.findIndex((t) => t.id === todoId);
      if (index !== -1 && this.todos[index]) {
        const target = this.todos[index]!;
        const updatedAssets = target.assets ? [...target.assets, asset] : [asset];
        this.todos[index] = {
          ...target,
          assets: updatedAssets,
        };
      }
    },

    _removeAsset(asset: TodoAsset) {
      const index = this.todos.findIndex((t) => t.id === asset.todo_id);
      if (index !== -1 && this.todos[index]) {
        const target = this.todos[index]!;
        const updatedAssets = (target.assets || []).filter(
          (current) => current.id !== asset.id
        );
        this.todos[index] = {
          ...target,
          assets: updatedAssets,
        };
      }
    },

    _replaceTodo(todo: Todo) {
      const index = this.todos.findIndex((t) => t.id === todo.id);
      if (index !== -1) {
        this.todos[index] = todo;
      } else {
        this.todos = [todo, ...this.todos];
      }
    },
  },
});
