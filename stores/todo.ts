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

      console.log("[updateTodo] 更新前のデータ:", todo);

      // ステータスの検証と正規化
      if (todo.status) {
        // ステータスが有効か確認
        const isValidStatus = Object.values(TASK_STATUS).includes(
          todo.status as TaskStatus
        );
        if (!isValidStatus) {
          console.warn(
            `[updateTodo] 無効なステータス: ${todo.status}, デフォルト値に置き換えます`
          );
          todo.status = TASK_STATUS.PRIORITY;
        }
      }

      // データベースに保存する形式に変換
      let updateData = { ...todo };
      if (todo.status) {
        const { tags, ...rest } = updateData;

        // ステータスの変換確認のログを追加
        const originalStatus = todo.status;
        const dbStatus = DB_STATUS_MAPPING[todo.status as TaskStatus];
        console.log(
          `[updateTodo] ステータス変換: ${originalStatus} -> ${dbStatus}`
        );

        updateData = {
          ...rest,
          status: dbStatus,
        };
      } else {
        const { tags, ...rest } = updateData;
        updateData = rest;
      }

      console.log("[updateTodo] データベースに送信するデータ:", updateData);

      // データベースの更新処理
      try {
        const { data, error } = await useSupabaseClient()
          .from("todos")
          .update(updateData)
          .eq("id", todo.id)
          .select();

        if (error) {
          console.error("[updateTodo] エラー:", error);
          throw error;
        }

        console.log("[updateTodo] 更新成功:", data);

        // タグの更新処理
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

        // ローカルストアの更新処理
        // ステータス変更の場合は常に対象のTodoを更新
        if (todo.status || todo.sort_order !== undefined) {
          // ローカルのtodosも更新して一貫性を保つ
          const index = this.todos.findIndex((t) => t.id === todo.id);
          if (index !== -1) {
            // 既存のTodoを更新
            this.todos[index] = {
              ...this.todos[index],
              ...todo, // todoの値で上書き
            };
            console.log("[updateTodo] ローカルデータ更新:", this.todos[index]);
            return data;
          }
        }
        // 部分的なデータだけを更新する場合は、ローカルのtodosも更新
        else if (!todo.tags && Object.keys(updateData).length < 5) {
          // ローカルでのTodo更新（fetchTodosを呼ばずに）
          const index = this.todos.findIndex((t) => t.id === todo.id);
          if (index !== -1) {
            // 既存のTodoを更新
            this.todos[index] = {
              ...this.todos[index],
              ...todo,
            };
            console.log(
              "[updateTodo] ローカルデータ更新（部分更新）:",
              this.todos[index]
            );
            return data;
          }
        }

        // 大規模な更新の場合は全データを再取得
        await this.fetchTodos();
        return data;
      } catch (error) {
        console.error("[updateTodo] 処理エラー:", error);
        throw error;
      }
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
      console.log("[updateTodoOrder] 順序更新:", todo);

      try {
        const { error } = await client
          .from("todos")
          .update({ sort_order: todo.sort_order })
          .eq("id", todo.id);

        if (error) throw error;

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
        }

        return true;
      } catch (error) {
        console.error("[updateTodoOrder] 更新エラー:", error);
        throw error;
      }
    },
  },
});
