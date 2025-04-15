import { defineStore } from "pinia";

type Todo = {
  id: string;
  title: string;
  status: string;
  task_id?: string;
  taskId?: string; // 互換性のために残す
  memo?: string;
  order?: number;
  is_private?: boolean;
  user_id?: string;
  updated_at?: string;
};

type Task = {
  id: string;
  title: string;
  projectId?: string;
};

export const useTodoStore = defineStore("todo", {
  state: () => ({
    todos: [] as Todo[],
    tasks: [] as Task[],
    isLoaded: false,
  }),

  actions: {
    async fetchTodos() {
      this.isLoaded = false;

      const client = useSupabaseClient();
      console.log("Todoの取得を開始...");

      try {
        const { data: todos, error: todosError } = await client
          .from("todos")
          .select("*")
          .order("updated_at", { ascending: false });

        if (todosError) {
          console.error("Todoの取得エラー:", todosError);
          throw todosError;
        }

        const { data: tasks, error: tasksError } = await client
          .from("tasks")
          .select("*");

        if (tasksError) {
          console.error("Taskの取得エラー:", tasksError);
          throw tasksError;
        }

        console.log("取得したTodos（生データ）:", todos);
        console.log("取得したTasks:", tasks);

        // ステータスの標準化（大文字小文字や空白の違いを吸収）
        const normalizedTodos = todos?.map((todo) => {
          // ステータスが未設定の場合は「未対応」にする
          if (!todo.status) {
            todo.status = "未対応";
          }

          // ステータスの標準化
          if (
            todo.status.includes("未") ||
            todo.status.toLowerCase().includes("todo")
          ) {
            todo.status = "未対応";
          } else if (
            todo.status.includes("対応中") ||
            todo.status.includes("進行") ||
            todo.status.toLowerCase().includes("progress") ||
            todo.status.toLowerCase().includes("doing")
          ) {
            todo.status = "対応中";
          } else if (
            todo.status.includes("完了") ||
            todo.status.toLowerCase().includes("done") ||
            todo.status.toLowerCase().includes("complete")
          ) {
            todo.status = "完了";
          }

          return todo;
        });

        this.todos = normalizedTodos || [];
        this.tasks = tasks || [];
        this.isLoaded = true;
      } catch (error) {
        console.error("Todoの取得中にエラーが発生しました:", error);
        throw error;
      }
    },

    async createTodo(todo: Partial<Todo>) {
      const client = useSupabaseClient();
      const user = useSupabaseUser();

      const todoData = {
        title: todo.title,
        memo: todo.memo,
        status: todo.status || "未対応",
        task_id: todo.taskId || todo.task_id || null,
        is_private: todo.is_private || false,
        user_id: user.value?.id,
      };

      console.log("作成するTodo:", todoData);

      const { data, error } = await client
        .from("todos")
        .insert(todoData)
        .select()
        .single();

      if (error) {
        console.error("Todo作成エラー:", error);
        throw error;
      }

      console.log("作成されたTodo:", data);
      this.todos.unshift(data);
    },

    async updateTodo(todo: Todo) {
      const client = useSupabaseClient();

      // 更新に必要な最小限のデータだけを抽出
      const todoData = {
        id: todo.id,
        status: todo.status,
        updated_at: new Date().toISOString(),
        // 他の必要なフィールドがあれば追加
        title: todo.title,
        memo: todo.memo,
        task_id: todo.task_id,
        is_private: todo.is_private,
      };

      console.log("更新するTodo:", {
        id: todoData.id,
        status: todoData.status,
        updated_at: todoData.updated_at,
      });

      const { error, data } = await client
        .from("todos")
        .update(todoData)
        .eq("id", todo.id)
        .select();

      console.log("更新結果:", { error, data });

      if (error) {
        console.error("Todo更新エラー:", error);
        throw error;
      }

      // データベースから返された最新のデータで状態を更新
      if (data && data[0]) {
        const index = this.todos.findIndex((t) => t.id === todo.id);
        if (index !== -1) {
          this.todos[index] = data[0];
        }
      }
    },

    async deleteTodo(id: string) {
      const client = useSupabaseClient();
      const { error } = await client.from("todos").delete().eq("id", id);

      if (error) throw error;
      this.todos = this.todos.filter((t) => t.id !== id);
    },
  },
});
