import { TASK_STATUS, TASK_ASSET_BUCKET } from "../utils/constants";
import type { Todo, TodoAsset } from "../../types/todo";
import { normalizeTodo, convertTodoForDB } from "../utils/todoUtils";

const TODO_SELECT_BASE = "*, todo_tags:todo_tags(*, tag:tag_id(*))";
const TODO_SELECT_WITH_ASSETS = `${TODO_SELECT_BASE}, todo_assets:todo_assets(*)`;

/**
 * 旧スキーマ環境でも安全に動作させる。
 * @description エラー内容から todo_assets のリレーション不足か判定する。
 * @param {unknown} error - 判定対象のエラー。
 * @returns {boolean} リレーション不足の場合は true。
 */
const isMissingAssetsRelationship = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeError = error as { message?: string };
  return (
    typeof maybeError.message === "string" &&
    maybeError.message.includes("todo_assets")
  );
};

/**
 * Todo の CRUD と添付管理をまとめ、呼び出し口を統一する。
 * @description Supabase の todos/todo_tags/todo_assets を扱う API を提供する。
 * @returns {object} Todo 操作用の関数群。
 */
export const useTaskRepository = () => {
  // Supabaseクライアント
  const client = useSupabaseClient();
  const user = useSupabaseUser();

  /**
   * 一覧取得の流れを一貫化する。
   * @description useAsyncData で全 Todo を取得し、正規化して返す。
   * @returns {ReturnType<typeof useAsyncData>} Todo 配列を含む取得結果。
   */
  const fetchAllTodos = () => {
    return useAsyncData(
      "todos",
      async () => {
        try {
          let { data: todos, error } = await client
            .from("todos")
            .select(TODO_SELECT_WITH_ASSETS)
            .eq("user_id", user.value?.id)
            .order("sort_order", { ascending: true })
            .order("updated_at", { ascending: false });

          if (error && isMissingAssetsRelationship(error)) {
            console.warn(
              "[useTaskRepository] 添付ファイル用リレーションが未設定のため、添付を含まないクエリにフォールバックします。",
            );
            ({ data: todos, error } = await client
              .from("todos")
              .select(TODO_SELECT_BASE)
              .eq("user_id", user.value?.id)
              .order("sort_order", { ascending: true })
              .order("updated_at", { ascending: false }));
          }

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
      },
    );
  };

  /**
   * 詳細画面用の取得を統一する。
   * @description ID で Todo を取得し、正規化して返す。
   * @param {string} id - 取得対象の Todo ID。
   * @returns {ReturnType<typeof useAsyncData>} Todo を含む取得結果。
   */
  const fetchTodoById = (id: string) => {
    return useAsyncData(
      `todo-${id}`,
      async () => {
        try {
          let { data, error } = await client
            .from("todos")
            .select(TODO_SELECT_WITH_ASSETS)
            .eq("id", id)
            .single();

          if (error && isMissingAssetsRelationship(error)) {
            console.warn(
              `[useTaskRepository] 添付ファイル用リレーションが未設定のため、タスク(${id})の単一取得でフォールバックします。`,
            );

            ({ data, error } = await client
              .from("todos")
              .select(TODO_SELECT_BASE)
              .eq("id", id)
              .single());
          }

          if (error) throw error;

          return normalizeTodo(data);
        } catch (error) {
          console.error(`ID: ${id} のTodo取得中にエラー:`, error);
          throw error;
        }
      },
      {
        server: false,
      },
    );
  };

  /**
   * 作成処理を一箇所にまとめる。
   * @description todos への insert と tag 連携を行い、最新を再取得する。
   * @param {Partial<Todo>} todo - 作成する Todo 情報。
   * @returns {Promise<Todo | undefined>} 作成した Todo。
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
   * 更新処理を統一し、タグ同期を安全に行う。
   * @description todos を更新し、todo_tags を再構築する。
   * @param {Partial<Todo>} todo - 更新する Todo 情報。
   * @returns {Promise<unknown>} 更新結果の配列。
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
   * 削除の順序を守る。
   * @description 添付/中間テーブルを先に削除してから todos を削除する。
   * @param {string} id - 削除対象の Todo ID。
   * @returns {Promise<boolean>} 成功時 true。
   */
  const deleteTodo = async (id: string) => {
    try {
      // 添付アセットを先に削除
      const { data: assets, error: assetsFetchError } = await client
        .from("todo_assets")
        .select("storage_path")
        .eq("todo_id", id);

      if (assetsFetchError) {
        console.warn(
          `[useTaskRepository] Todo ID:${id} の添付取得でエラー:`,
          assetsFetchError,
        );
      }

      if (assets && assets.length > 0) {
        const storagePaths = assets
          .map((asset) => asset.storage_path)
          .filter((path): path is string => Boolean(path));
        if (storagePaths.length > 0) {
          const { error: removeError } = await client.storage
            .from(TASK_ASSET_BUCKET)
            .remove(storagePaths);
          if (removeError) {
            console.warn(
              `[useTaskRepository] Todo ID:${id} の添付削除でエラー:`,
              removeError,
            );
          }
        }

        const { error: assetDeleteError } = await client
          .from("todo_assets")
          .delete()
          .eq("todo_id", id);
        if (assetDeleteError) {
          console.warn(
            `[useTaskRepository] Todo ID:${id} の添付レコード削除でエラー:`,
            assetDeleteError,
          );
        }
      }

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
   * 並び順更新を一貫して扱う。
   * @description sort_order を更新し、キャッシュを無効化する。
   * @param {{ id: string; sort_order: number }} todo - 更新対象の ID と並び順。
   * @returns {Promise<unknown>} 更新結果の配列。
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

  /**
   * 添付アップロードの手順を統一する。
   * @description Storage へ upload し、todo_assets を登録する。
   * @param {string} todoId - 添付対象の Todo ID。
   * @param {File} file - アップロードするファイル。
   * @returns {Promise<TodoAsset>} 作成された TodoAsset。
   */
  const uploadTodoAsset = async (todoId: string, file: File) => {
    if (!todoId) throw new Error("Todo IDが指定されていません");
    if (!file) throw new Error("アップロードするファイルが指定されていません");

    const currentUserId = user.value?.id;
    if (!currentUserId) throw new Error("ユーザー情報が取得できませんでした");

    const storage = client.storage.from(TASK_ASSET_BUCKET);
    const uniqueId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const sanitizedFileName = file.name.replace(/[^\w.\-()]/g, "_");
    const storagePath = `${currentUserId}/${todoId}/${uniqueId}-${sanitizedFileName}`;

    const { error: uploadError } = await storage.upload(storagePath, file, {
      contentType: file.type || "application/octet-stream",
      cacheControl: "3600",
      upsert: false,
    });

    if (uploadError) {
      console.error("[useTaskRepository] 添付アップロードに失敗:", uploadError);
      throw uploadError;
    }

    const { data: insertedAsset, error: insertError } = await client
      .from("todo_assets")
      .insert({
        todo_id: todoId,
        file_name: file.name,
        storage_path: storagePath,
        mime_type: file.type,
        size: file.size,
        created_by: currentUserId,
      })
      .select()
      .single();

    if (insertError) {
      console.error(
        "[useTaskRepository] 添付メタデータ挿入に失敗:",
        insertError,
      );
      await storage.remove([storagePath]);
      throw insertError;
    }

    await refreshCookie("todos");
    await refreshCookie(`todo-${todoId}`);

    return insertedAsset as TodoAsset;
  };

  /**
   * 添付ファイルの参照 URL を安全に作る。
   * @description Storage の signed URL を発行する。
   * @param {TodoAsset} asset - サイン対象の添付情報。
   * @param {number} [expiresIn] - 署名 URL の有効秒数（デフォルト: 60）。
   * @returns {Promise<string>} サイン付き URL 文字列。
   */
  const getTodoAssetUrl = async (asset: TodoAsset, expiresIn = 60) => {
    const storage = client.storage.from(TASK_ASSET_BUCKET);
    const { data, error } = await storage.createSignedUrl(
      asset.storage_path,
      expiresIn,
    );

    if (error) {
      console.error("[useTaskRepository] 添付ファイルURL生成に失敗:", error);
      throw error;
    }

    return data.signedUrl;
  };

  /**
   * 添付ファイル削除を安全に行う。
   * @description Storage と todo_assets の両方から削除する。
   * @param {TodoAsset} asset - 削除対象の添付情報。
   * @returns {Promise<boolean>} 成功時 true。
   */
  const deleteTodoAsset = async (asset: TodoAsset) => {
    if (!asset?.storage_path) {
      throw new Error("削除対象の添付ファイルが不正です");
    }

    const storage = client.storage.from(TASK_ASSET_BUCKET);

    const { error: removeError } = await storage.remove([asset.storage_path]);
    if (removeError) {
      console.error("[useTaskRepository] 添付ファイル削除に失敗:", removeError);
      throw removeError;
    }

    const { error: deleteError } = await client
      .from("todo_assets")
      .delete()
      .eq("id", asset.id);

    if (deleteError) {
      console.error(
        "[useTaskRepository] 添付メタデータ削除に失敗:",
        deleteError,
      );
      throw deleteError;
    }

    await refreshCookie("todos");
    await refreshCookie(`todo-${asset.todo_id}`);

    return true;
  };

  return {
    fetchAllTodos,
    fetchTodoById,
    createTodo,
    updateTodo,
    deleteTodo,
    updateTodoOrder,
    uploadTodoAsset,
    deleteTodoAsset,
    getTodoAssetUrl,
  };
};
