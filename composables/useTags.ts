import { ref, onMounted } from "vue";
import { useTagStore } from "../stores/tag";
import type { Tag } from "../types/todo";

export function useTags() {
  const tagStore = useTagStore();
  const newTagName = ref("");
  const newTagColor = ref("#3b82f6");

  onMounted(async () => {
    await tagStore.fetchTags();
  });

  const addTag = async () => {
    const name = newTagName.value.trim();
    const color = newTagColor.value;
    if (!name) return;
    if (tagStore.tags.some((t: Tag) => t.name === name)) {
      newTagName.value = "";
      newTagColor.value = "#3b82f6";
      return;
    }
    const { data, error } = await tagStore.createTag({ name, color });
    if (!error && data) {
      newTagName.value = "";
      newTagColor.value = "#3b82f6";
    }
  };

  const deleteTag = async (tagId: string) => {
    if (!confirm("このタグを削除しますか？")) return;
    await tagStore.deleteTag(tagId);
  };

  const updateTag = async (tagData: {
    id: string;
    name: string;
    color: string;
  }) => {
    if (!tagData.id || !tagData.name.trim()) return;

    await tagStore.updateTag(tagData.id, {
      name: tagData.name.trim(),
      color: tagData.color,
    });
  };

  return {
    tagStore,
    newTagName,
    newTagColor,
    addTag,
    deleteTag,
    updateTag,
  };
}
