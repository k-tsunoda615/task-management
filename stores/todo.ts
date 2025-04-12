import { defineStore } from "pinia";

interface Todo {
  id: string;
  title: string;
  status: string;
  taskId: string;
  memo?: string;
  order: number;
}

interface Task {
  id: string;
  title: string;
  projectId: string;
}

export const useTodoStore = defineStore("todo", {
  state: () => ({
    todos: [] as Todo[],
    tasks: [] as Task[],
    isLoaded: false,
  }),

  actions: {
    async fetchTodos() {
      if (this.isLoaded) return;

      const client = useSupabaseClient();
      const { data: todos, error: todosError } = await client
        .from("todos")
        .select("*")
        .order("order", { ascending: true });

      if (todosError) throw todosError;

      const { data: tasks, error: tasksError } = await client
        .from("tasks")
        .select("*");

      if (tasksError) throw tasksError;

      this.todos = todos;
      this.tasks = tasks;
      this.isLoaded = true;
    },

    async createTodo(todo: Partial<Todo>) {
      const client = useSupabaseClient();
      const { data, error } = await client
        .from("todos")
        .insert({
          ...todo,
          order: this.todos.length,
        })
        .select()
        .single();

      if (error) throw error;
      this.todos.push(data);
    },

    async updateTodo(todo: Todo) {
      const client = useSupabaseClient();
      const { error } = await client
        .from("todos")
        .update(todo)
        .eq("id", todo.id);

      if (error) throw error;
      const index = this.todos.findIndex((t) => t.id === todo.id);
      if (index !== -1) {
        this.todos[index] = todo;
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
