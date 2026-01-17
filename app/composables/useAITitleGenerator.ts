/**
 * メモからタイトルを生成する処理を UI から隠蔽する。
 * @description Gemini API を呼び出してタスクタイトルを生成する。
 * @returns {object} 生成状態と生成関数。
 */
export const useAITitleGenerator = () => {
  const isGenerating = ref(false);

  /**
   * タイトル生成を単一の流れで管理する。
   * @description メモを元にプロンプトを作り、API からタイトルを取得する。
   * @param {string} memo - タイトル生成の元となるメモ本文。
   * @returns {Promise<string | null>} 生成したタイトル文字列、失敗時は null。
   */
  const generateTitle = async (memo: string) => {
    if (!memo) return null;
    isGenerating.value = true;
    try {
      const prompt = `以下のメモの内容を表す適切なタスクのタイトルを30文字以内で生成してください。タイトルのみを返してください。引用符などは不要です。\n\nメモ:\n${memo}`;

      const { data, error } = await useFetch("/api/gemini/chat", {
        method: "POST",
        body: { prompt },
      });

      if (error.value) throw error.value;

      const text = data.value?.text;
      return (
        text
          ?.trim()
          .replace(/^["「]/, "")
          .replace(/["」]$/, "") || null
      );
    } catch (e) {
      console.error("AI Title generation failed", e);
      useToast().add({
        title: "エラー",
        description: "タイトルの生成に失敗しました",
        color: "red",
      });
      return null;
    } finally {
      isGenerating.value = false;
    }
  };

  return { isGenerating, generateTitle };
};
