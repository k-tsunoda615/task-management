import { defineStore } from "pinia";

interface Project {
  id: string;
  title: string;
  userId: string;
}

export const useProjectStore = defineStore("project", {
  state: () => ({
    projects: [] as Project[],
    selectedProject: null as Project | null,
    hidePrivateTasks: false,
    isLoaded: false,
  }),

  actions: {
    async fetchProjects() {
      if (this.isLoaded) return;

      const client = useSupabaseClient();
      const { data: projects, error } = await client
        .from("projects")
        .select("*");

      if (error) throw error;

      this.projects = projects || [];

      // デフォルトで最初のプロジェクトを選択
      if (projects && projects.length > 0 && !this.selectedProject) {
        this.selectedProject = projects[0];
      }

      this.isLoaded = true;
    },

    async createProject(title: string) {
      const client = useSupabaseClient();
      const user = useSupabaseUser();

      if (!user.value) throw new Error("ユーザーがログインしていません");

      const { data, error } = await client
        .from("projects")
        .insert({
          title,
          userId: user.value.id,
        })
        .select()
        .single();

      if (error) throw error;

      this.projects.push(data);
      this.selectedProject = data;
    },

    setSelectedProject(project: Project) {
      this.selectedProject = project;
    },

    togglePrivateTasks() {
      this.hidePrivateTasks = !this.hidePrivateTasks;
    },
  },
});
