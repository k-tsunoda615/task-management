import { defineStore } from "pinia";

type Todo = {
  id: string;
  title: string;
  status: string;
  task_id?: string;
  taskId?: string; // 互換性のために残す
  memo?: string;
  sort_order?: number;
  is_private?: boolean;
  user_id?: string;
  updated_at?: string;
  total_time?: number | number[]; // 配列または数値として定義
  is_timing?: boolean;
};

type Task = {
  id: string;
  title: string;
  projectId?: string;
};

type TaskFilter = "all" | "private" | "public";

// 配列から数値への変換ヘルパー関数
const extractTotalTime = (time: number | number[] | undefined): number => {
  if (Array.isArray(time) && time.length > 0) {
    return time[0];
  }
  return typeof time === "number" ? time : 0;
};

export const useTodoStore = defineStore("todo", {
  state: () => ({
    todos: [] as Todo[],
    tasks: [] as Task[],
    isLoaded: false,
    // 表示フィルター: 'all'=全表示, 'private'=プライベートのみ, 'public'=非プライベートのみ
    taskFilter: "public" as TaskFilter,
  }),

  getters: {
    // 表示状態に応じてフィルタリングされたTodos
    filteredTodos(): Todo[] {
      if (this.taskFilter === "all") {
        return this.todos;
      } else if (this.taskFilter === "private") {
        return this.todos.filter((todo) => todo.is_private);
      } else {
        // 'public'
        return this.todos.filter((todo) => !todo.is_private);
      }
    },
  },

  actions: {
    async fetchTodos() {
      this.isLoaded = false;

      const client = useSupabaseClient();
      console.log("Todoの取得を開始...");

      try {
        const { data: todos, error: todosError } = await client
          .from("todos")
          .select("*")
          .order("sort_order", { ascending: true })
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

          // total_timeを配列から数値に変換
          if (todo.total_time !== undefined) {
            const extractedTime = extractTotalTime(todo.total_time);
            console.log(
              `Todo ${todo.id} の total_time を変換: ${todo.total_time} -> ${extractedTime}`
            );
            todo.total_time = extractedTime;
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
        sort_order: todo.sort_order || 0,
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

    async updateTodo(todo: Partial<Todo>) {
      try {
        console.log("Todoを更新します:", todo);

        // 必須フィールドの確認
        if (!todo.id) {
          throw new Error("Todo IDが指定されていません");
        }

        // 計測中の場合は現在の経過時間を取得
        if (todo.total_time !== undefined) {
          if (!Array.isArray(todo.total_time)) {
            todo.total_time = [todo.total_time];
          }
        }

        console.log("変換後のデータ:", todo);

        // APIリクエストを送信
        const { data, error } = await useSupabaseClient()
          .from("todos")
          .update(todo)
          .eq("id", todo.id)
          .select();

        if (error) {
          console.error("Todo更新エラー:", error);
          throw error;
        }

        console.log("Todo更新成功:", data);

        // 更新されたTodoを取得して状態を更新
        await this.fetchTodos();

        return data;
      } catch (error) {
        console.error("Todo更新処理エラー:", error);
        throw error;
      }
    },

    async deleteTodo(id: string) {
      const client = useSupabaseClient();
      const { error } = await client.from("todos").delete().eq("id", id);

      if (error) throw error;
      this.todos = this.todos.filter((t) => t.id !== id);
    },

    // タスク表示フィルターを設定
    setTaskFilter(filter: TaskFilter) {
      this.taskFilter = filter;
    },

    // 順序のみを更新する軽量メソッド
    async updateTodoOrder(todo: { id: string; sort_order: number }) {
      const client = useSupabaseClient();

      const { error } = await client
        .from("todos")
        .update({ sort_order: todo.sort_order })
        .eq("id", todo.id);

      if (error) {
        console.error("Todo順序更新エラー:", error);
        throw error;
      }

      // ローカルの状態も更新
      const index = this.todos.findIndex((t) => t.id === todo.id);
      if (index !== -1) {
        this.todos[index].sort_order = todo.sort_order;
      }
    },
  },
});
