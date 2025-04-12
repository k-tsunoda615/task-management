import { defineStore } from 'pinia'

interface Project {
  id: string
  title: string
  userId: string
}

export const useProjectStore = defineStore('project', {
  state: () => ({
    projects: [] as Project[],
    selectedProject: null as Project | null,
    hidePrivateTasks: false
  }),

  actions: {
    async fetchProjects() {
      const client = useSupabaseClient()
      const { data, error } = await client
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      this.projects = data
    },

    async createProject(title: string) {
      const client = useSupabaseClient()
      const { data, error } = await client
        .from('projects')
        .insert({ title })
        .select()
        .single()

      if (error) throw error
      this.projects.unshift(data)
      this.selectedProject = data
    },

    setSelectedProject(project: Project | null) {
      this.selectedProject = project
    },

    togglePrivateTasks() {
      this.hidePrivateTasks = !this.hidePrivateTasks
    }
  }
})