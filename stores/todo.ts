import { defineStore } from "pinia";
import type { Todo } from "../types/todo";
import {
  TASK_STATUS,
  LEGACY_STATUS_MAPPING,
  DB_STATUS_MAPPING,
} from "../utils/constants";
import type { TaskStatus } from "../utils/constants";

export const useTodoStore = defineStore("todo", {
  state: () => ({
    todos: [] as Todo[],
    isLoaded: false,
    taskFilter: "public" as "all" | "private" | "public",
  }),
  getters: {
    filteredTodos(): Todo[] {
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
      const client = useSupabaseClient();
      try {
        const { data: todos, error } = await client
          .from("todos")
          .select("*, todo_tags:todo_tags(*, tag:tag_id(*))")
          .order("sort_order", { ascending: true })
          .order("updated_at", { ascending: false });
        if (error) throw error;
        console.log("[fetchTodos] raw todos:", todos);
        const normalizedTodos = todos?.map((todo: any) => {
          // ステータスを新しい形式に正規化
          if (!todo.status) {
            todo.status = TASK_STATUS.PRIORITY;
          } else {
            // レガシーステータスを新しい形式に変換
            todo.status = this.normalizeStatus(todo.status);
          }

          if (todo.total_time !== undefined) {
            todo.total_time = Array.isArray(todo.total_time)
              ? todo.total_time[0]
              : todo.total_time;
          }
          todo.tags = (todo.todo_tags || [])
            .map((tt: any) => tt.tag)
            .filter(Boolean);
          return todo;
        });
        console.log("[fetchTodos] normalizedTodos:", normalizedTodos);
        this.todos = normalizedTodos || [];
        console.log("[fetchTodos] this.todos:", this.todos);
        console.log("[fetchTodos] taskFilter:", this.taskFilter);
        // filteredTodosはgetterなのでthis.filteredTodosでアクセス
        console.log("[fetchTodos] filteredTodos:", this.filteredTodos);
        this.isLoaded = true;
      } catch (error) {
        console.error("Todoの取得中にエラーが発生しました:", error);
        throw error;
      }
    },

    // ステータスを正規化するヘルパーメソッド
    normalizeStatus(status: string): TaskStatus {
      if (Object.keys(LEGACY_STATUS_MAPPING).includes(status)) {
        return LEGACY_STATUS_MAPPING[
          status as keyof typeof LEGACY_STATUS_MAPPING
        ];
      }
      // マッピングにない場合はデフォルト値を返す
      return TASK_STATUS.PRIORITY;
    },

    async createTodo(todo: Partial<Todo>) {
      const client = useSupabaseClient();
      const user = useSupabaseUser();
      const { tags, ...todoData } = todo;
      todoData.user_id = user.value?.id;
      // 新しい形式を使用
      todoData.status = todo.status || TASK_STATUS.PRIORITY;
      todoData.is_private = todo.is_private || false;
      todoData.sort_order = todo.sort_order || 0;

      // データベースに保存する形式に変換
      const dbStatus = DB_STATUS_MAPPING[todoData.status as TaskStatus];
      const dataForDb = {
        ...todoData,
        status: dbStatus,
      };

      const { data, error } = await client
        .from("todos")
        .insert(dataForDb)
        .select()
        .single();
      if (error) throw error;
      if (tags && tags.length > 0) {
        const todoTags = tags.map((tag) => ({
          todo_id: data.id,
          tag_id: tag.id,
        }));
        await client.from("todo_tags").insert(todoTags);
      }
      const { data: newTodo } = await client
        .from("todos")
        .select("*, todo_tags:todo_tags(*, tag:tag_id(*))")
        .eq("id", data.id)
        .single();

      // 取得したデータのステータスを正規化
      newTodo.status = this.normalizeStatus(newTodo.status);
      newTodo.tags = (newTodo.todo_tags || [])
        .map((tt: any) => tt.tag)
        .filter(Boolean);
      this.todos.unshift(newTodo);
    },

    async updateTodo(todo: Partial<Todo>) {
      if (!todo.id) throw new Error("Todo IDが指定されていません");
      if (todo.total_time !== undefined && !Array.isArray(todo.total_time)) {
        todo.total_time = [todo.total_time];
      }

      // データベースに保存する形式に変換
      let updateData = { ...todo };
      if (todo.status) {
        const { tags, ...rest } = updateData;
        updateData = {
          ...rest,
          status: DB_STATUS_MAPPING[todo.status as TaskStatus],
        };
      } else {
        const { tags, ...rest } = updateData;
        updateData = rest;
      }

      const { data, error } = await useSupabaseClient()
        .from("todos")
        .update(updateData)
        .eq("id", todo.id)
        .select();
      if (error) throw error;

      if (todo.tags) {
        const client = useSupabaseClient();
        await client.from("todo_tags").delete().eq("todo_id", todo.id);
        if (todo.tags.length > 0) {
          const todoTags = todo.tags.map((tag) => ({
            todo_id: todo.id,
            tag_id: tag.id,
          }));
          await client.from("todo_tags").insert(todoTags);
        }
      }
      await this.fetchTodos();
      return data;
    },

    async deleteTodo(id: string) {
      const client = useSupabaseClient();
      const { error } = await client.from("todos").delete().eq("id", id);
      if (error) throw error;
      this.todos = this.todos.filter((t) => t.id !== id);
    },

    setTaskFilter(filter: "all" | "private" | "public") {
      this.taskFilter = filter;
    },

    async updateTodoOrder(todo: { id: string; sort_order: number }) {
      const client = useSupabaseClient();
      const { error } = await client
        .from("todos")
        .update({ sort_order: todo.sort_order })
        .eq("id", todo.id);
      if (error) throw error;
      const index = this.todos.findIndex((t) => t.id === todo.id);
      if (index !== -1) {
        this.todos[index].sort_order = todo.sort_order;
      }
    },
  },
});
