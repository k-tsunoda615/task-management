import { TASK_STATUS } from "../utils/constants";
import type { Todo } from "../../types/todo";
import { normalizeTodo, convertTodoForDB } from "../utils/todoUtils";

export function useTaskRepository() {
  // Supabaseクライアント
  const client = useSupabaseClient();
  const user = useSupabaseUser();

  /**
   * 全Todoを取得する（キャッシュ付き）
   */
  const fetchAllTodos = () => {
    return useAsyncData(
      "todos",
      async () => {
        try {
          const { data: todos, error } = await client
            .from("todos")
            .select("*, todo_tags:todo_tags(*, tag:tag_id(*))")
            .order("sort_order", { ascending: true })
            .order("updated_at", { ascending: false });

          if (error) throw error;

          // データの正規化
          const normalizedTodos =
            todos?.map((todo) => normalizeTodo(todo)) || [];
          return normalizedTodos;
        } catch (error) {
          console.error("Todoの取得中にエラーが発生しました:", error);
          throw error;
        }
      },
      {
        server: false, // クライアントサイドのみで実行（認証が必要なため）
      }
    );
  };

  /**
   * 単一のTodoを取得する（キャッシュ付き）
   */
  const fetchTodoById = (id: string) => {
    return useAsyncData(
      `todo-${id}`,
      async () => {
        try {
          const { data, error } = await client
            .from("todos")
            .select("*, todo_tags:todo_tags(*, tag:tag_id(*))")
            .eq("id", id)
            .single();

          if (error) throw error;

          return normalizeTodo(data);
        } catch (error) {
          console.error(`ID: ${id} のTodo取得中にエラー:`, error);
          throw error;
        }
      },
      {
        server: false,
      }
    );
  };

  /**
   * 新しいTodoを作成する
   */
  const createTodo = async (todo: Partial<Todo>) => {
    try {
      const { tags, ...todoData } = todo;
      todoData.user_id = user.value?.id;
      todoData.status = todo.status || TASK_STATUS.PRIORITY;
      todoData.is_private = todo.is_private || false;
      todoData.sort_order = todo.sort_order || 0;

      // データベースに保存する形式に変換
      const dataForDb = convertTodoForDB(todoData);

      // Todoの挿入
      const { data, error } = await client
        .from("todos")
        .insert(dataForDb)
        .select()
        .single();

      if (error) throw error;

      // タグの関連付け
      if (tags && tags.length > 0) {
        const todoTags = tags.map((tag) => ({
          todo_id: data.id,
          tag_id: tag.id,
        }));
        await client.from("todo_tags").insert(todoTags);
      }

      // キャッシュを無効化
      await refreshCookie("todos");

      // 作成したTodoを取得して返す
      const { data: newTodo } = await fetchTodoById(data.id);
      return newTodo.value;
    } catch (error) {
      console.error("Todo作成中にエラー:", error);
      throw error;
    }
  };

  /**
   * Todoを更新する
   */
  const updateTodo = async (todo: Partial<Todo>) => {
    try {
      if (!todo.id) throw new Error("Todo IDが指定されていません");

      // データベース更新用のデータに変換
      const updateData = convertTodoForDB(todo);

      // Todoの更新
      const { data, error } = await client
        .from("todos")
        .update(updateData)
        .eq("id", todo.id)
        .select();

      if (error) throw error;

      // タグの更新処理
      if (todo.tags) {
        await client.from("todo_tags").delete().eq("todo_id", todo.id);
        if (todo.tags.length > 0) {
          const todoTags = todo.tags.map((tag) => ({
            todo_id: todo.id,
            tag_id: tag.id,
          }));
          await client.from("todo_tags").insert(todoTags);
        }
      }

      // キャッシュを無効化
      await refreshCookie("todos");
      await refreshCookie(`todo-${todo.id}`);

      return data;
    } catch (error) {
      console.error("Todo更新中にエラー:", error);
      throw error;
    }
  };

  /**
   * Todoを削除する
   */
  const deleteTodo = async (id: string) => {
    try {
      // 関連するtodo_tagsレコードを先に削除
      const { error: tagsError } = await client
        .from("todo_tags")
        .delete()
        .eq("todo_id", id);

      if (tagsError) {
        console.warn(`Todo ID:${id} のタグ関連削除でエラー:`, tagsError);
      }

      // Todoレコードを削除
      const { error } = await client.from("todos").delete().eq("id", id);

      if (error) throw error;

      // キャッシュを無効化
      await refreshCookie("todos");
      await refreshCookie(`todo-${id}`);

      return true;
    } catch (error) {
      console.error(`Todo ID:${id} の削除でエラー:`, error);
      throw error;
    }
  };

  /**
   * Todoの並び順を更新する
   */
  const updateTodoOrder = async (todo: { id: string; sort_order: number }) => {
    try {
      console.log("[useTaskRepository] 順序更新リクエスト:", todo);

      // データが正しい形式かチェック
      if (!todo.id) {
        console.error("[useTaskRepository] IDが指定されていません");
        throw new Error("Todo IDが指定されていません");
      }

      const { error, data } = await client
        .from("todos")
        .update({ sort_order: todo.sort_order })
        .eq("id", todo.id)
        .select();

      if (error) {
        console.error("[useTaskRepository] 順序更新エラー:", error);
        throw error;
      }

      console.log("[useTaskRepository] 順序更新成功:", data);

      // キャッシュを無効化
      await refreshCookie("todos");

      return data;
    } catch (error) {
      console.error("[useTaskRepository] Todo順序更新中にエラー:", error);
      throw error;
    }
  };

  return {
    fetchAllTodos,
    fetchTodoById,
    createTodo,
    updateTodo,
    deleteTodo,
    updateTodoOrder,
  };
}
