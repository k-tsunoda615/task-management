import { defineStore } from "pinia";

interface Todo {
  id: string;
  title: string;
  status: string;
  task_id?: string;
  memo?: string;
  order?: number;
  is_private?: boolean;
  user_id?: string;
  updated_at?: string;
}

interface Task {
  id: string;
  title: string;
  projectId?: string;
}

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

      console.log("取得したTodos:", todos);
      console.log("取得したTasks:", tasks);

      this.todos = todos || [];
      this.tasks = tasks || [];
      this.isLoaded = true;
    },

    async createTodo(todo: Partial<Todo>) {
      const client = useSupabaseClient();
      const user = useSupabaseUser();

      const todoData = {
        title: todo.title,
        memo: todo.memo,
        status: todo.status,
        task_id: todo.taskId || todo.task_id,
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

      const todoData = { ...todo };
      if (todoData.taskId && !todoData.task_id) {
        todoData.task_id = todoData.taskId;
        delete todoData.taskId;
      }

      const { error } = await client
        .from("todos")
        .update(todoData)
        .eq("id", todo.id);

      if (error) throw error;

      const index = this.todos.findIndex((t) => t.id === todo.id);
      if (index !== -1) {
        this.todos[index] = { ...this.todos[index], ...todoData };
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
