import { useTodoStore } from "../stores/todo";
import { useTagStore } from "../stores/tag";
import { TASK_STATUS } from "../utils/constants";

/**
 * 初回ログイン時にサンプルタスク・タグを追加するcomposable
 */
export async function useInitialSampleData() {
  const todoStore = useTodoStore();
  const tagStore = useTagStore();
  const user = typeof useSupabaseUser === "function" ? useSupabaseUser() : null;

  await todoStore.fetchTodos();
  if (todoStore.todos.length > 0 || !user?.value) return;

  // サンプルタグを追加（なければ）
  await tagStore.fetchTags();
  let sampleTag = tagStore.tags.find((t) => t.name === "サンプル");
  if (!sampleTag) {
    const { data } = await tagStore.createTag({
      name: "サンプル",
      color: "#f59e42",
      user_id: user.value.id,
    });
    sampleTag = data;
  }

  // サンプルタスクを3件追加
  const sampleTodos = [
    {
      title: "優先タスクの例",
      status: TASK_STATUS.PRIORITY,
      memo: `### 優先タスクの例\n\nこのタスクは「優先」カラムに表示されます。\n\n- 重要なタスクをここに追加しましょう\n- ドラッグ＆ドロップで他のカラムに移動できます\n\n**使い方ヒント:**\n\n- タスクをクリックすると詳細・編集ができます\n- **サイドバーの「＋」ボタンで新しいタスクを追加できます**`,
      tags: sampleTag ? [sampleTag] : [],
    },
    {
      title: "次にやるタスクの例",
      status: TASK_STATUS.NEXT,
      memo: `### 次にやるタスクの例\n\nこのタスクは「次にやる」カラムに表示されます。\n\n- 優先度が下がったタスクや、後でやりたいタスクをここに移動しましょう\n- カンバン方式で進捗を管理できます`,
      tags: sampleTag ? [sampleTag] : [],
    },
    {
      title: "完了・アーカイブの例",
      status: TASK_STATUS.ARCHIVED,
      memo: `### アーカイブタスクの例\n\nこのカラムには完了したタスクや、今は不要なタスクを移動します。\n\n- タスクをアーカイブしてもデータは残ります\n- 必要なら再度他のカラムに戻すこともできます`,
      tags: sampleTag ? [sampleTag] : [],
    },
  ];
  for (const todo of sampleTodos) {
    await todoStore.createTodo({
      title: todo.title,
      status: todo.status,
      memo: todo.memo,
      tags: todo.tags,
      is_private: false,
      sort_order: 0,
      user_id: user.value.id,
    });
  }
  await todoStore.fetchTodos();
}
