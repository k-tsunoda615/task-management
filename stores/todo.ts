import { defineStore } from "pinia";

type Tag = {
  id: string;
  name: string;
};

type Todo = {
  id: string;
  title: string;
  status: string;
  memo?: string;
  sort_order?: number;
  is_private?: boolean;
  user_id?: string;
  updated_at?: string;
  total_time?: number | number[];
  is_timing?: boolean;
  tags?: Tag[];
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
    tags: [] as Tag[],
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

    // 総Todo数を取得
    totalTodoCount(): number {
      return this.todos.length;
    },
  },

  actions: {
    async fetchTodos() {
      this.isLoaded = false;

      const client = useSupabaseClient();
      console.log("Todoの取得を開始...");

      try {
        // todosとtagsのリレーションをJOINで取得
        const { data: todos, error: todosError } = await client
          .from("todos")
          .select("*, todo_tags:todo_tags(*, tag:tag_id(*))")
          .order("sort_order", { ascending: true })
          .order("updated_at", { ascending: false });

        if (todosError) {
          console.error("Todoの取得エラー:", todosError);
          throw todosError;
        }

        // タグ一覧も取得
        const { data: tags, error: tagsError } = await client
          .from("tags")
          .select("*");

        if (tagsError) {
          console.error("Tagの取得エラー:", tagsError);
          throw tagsError;
        }

        // todosのtagsを整形
        const normalizedTodos = todos?.map((todo: any) => {
          // ステータスの標準化などは従来通り
          if (!todo.status) {
            todo.status = "未対応";
          }
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
          if (todo.total_time !== undefined) {
            const extractedTime = extractTotalTime(todo.total_time);
            todo.total_time = extractedTime;
          }
          // tagsの整形
          todo.tags = (todo.todo_tags || [])
            .map((tt: any) => tt.tag)
            .filter(Boolean);
          return todo;
        });

        this.todos = normalizedTodos || [];
        this.tags = tags || [];
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
        is_private: todo.is_private || false,
        user_id: user.value?.id,
        sort_order: todo.sort_order || 0,
      };

      console.log("作成するTodo:", todoData);

      // Todo本体を作成
      const { data, error } = await client
        .from("todos")
        .insert(todoData)
        .select()
        .single();

      if (error) {
        console.error("Todo作成エラー:", error);
        throw error;
      }

      // tagsが指定されていれば中間テーブルに登録
      if (todo.tags && todo.tags.length > 0) {
        const todoTags = todo.tags.map((tag) => ({
          todo_id: data.id,
          tag_id: tag.id,
        }));
        await client.from("todo_tags").insert(todoTags);
      }

      // tagsをJOINして再取得
      const { data: newTodo } = await client
        .from("todos")
        .select("*, todo_tags:todo_tags(*, tag:tag_id(*))")
        .eq("id", data.id)
        .single();
      newTodo.tags = (newTodo.todo_tags || [])
        .map((tt: any) => tt.tag)
        .filter(Boolean);
      this.todos.unshift(newTodo);
    },

    async updateTodo(todo: Partial<Todo>) {
      try {
        if (!todo.id) {
          throw new Error("Todo IDが指定されていません");
        }
        if (todo.total_time !== undefined) {
          if (!Array.isArray(todo.total_time)) {
            todo.total_time = [todo.total_time];
          }
        }
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
        // tagsの更新
        if (todo.tags) {
          const client = useSupabaseClient();
          // 既存のtodo_tagsを削除
          await client.from("todo_tags").delete().eq("todo_id", todo.id);
          // 新しいtagsを挿入
          if (todo.tags.length > 0) {
            const todoTags = todo.tags.map((tag) => ({
              todo_id: todo.id,
              tag_id: tag.id,
            }));
            await client.from("todo_tags").insert(todoTags);
          }
        }
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
