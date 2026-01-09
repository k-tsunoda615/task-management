export const useAITitleGenerator = () => {
  const isGenerating = ref(false);

  const generateTitle = async (memo: string) => {
    if (!memo) return null;
    isGenerating.value = true;
    try {
      const prompt = `以下のメモの内容を表す適切なタスクのタイトルを30文字以内で生成してください。タイトルのみを返してください。引用符などは不要です。\n\nメモ:\n${memo}`;
      
      const { data, error } = await useFetch("/api/gemini/chat", {
        method: "POST",
        body: { prompt }
      });

      if (error.value) throw error.value;
      
      // @ts-ignore
      const text = data.value?.text;
      return text?.trim().replace(/^["「]/, "").replace(/["」]$/, "") || null;
    } catch (e) {
      console.error("AI Title generation failed", e);
      useToast().add({
        title: "エラー",
        description: "タイトルの生成に失敗しました",
        color: "red"
      });
      return null;
    } finally {
      isGenerating.value = false;
    }
  };

  return { isGenerating, generateTitle };
};
