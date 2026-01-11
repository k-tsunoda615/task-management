<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
    <!-- Chat Window -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-4 opacity-0 scale-95"
      enter-to-class="transform translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100 scale-100"
      leave-to-class="transform translate-y-4 opacity-0 scale-95"
    >
      <UCard
        v-if="isOpen"
        class="mb-4 w-80 md:w-96 shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col h-[500px]"
        :ui="{
          body: { base: 'flex-1 overflow-y-auto p-4 flex flex-col gap-4' },
          footer: { base: 'p-3 border-t' },
        }"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <UIcon name="i-heroicons-sparkles" class="text-yellow-500" />
              AI Assistant
            </h3>
            <div class="flex items-center gap-2">
              <USelect
                v-model="selectedModel"
                :options="models"
                option-attribute="label"
                class="w-40"
                size="xs"
              />
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-x-mark"
                size="sm"
                @click="isOpen = false"
              />
            </div>
          </div>
        </template>

        <!-- Messages -->
        <div v-if="messages.length === 0" class="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm">
          <UIcon name="i-heroicons-chat-bubble-left-right" class="w-12 h-12 mb-2 opacity-50" />
          <p>何かお手伝いできることはありますか？</p>
        </div>

        <div v-for="(msg, index) in messages" :key="index" :class="['flex flex-col max-w-[85%]', msg.role === 'user' ? 'self-end items-end' : 'self-start items-start']">
          <div
            :class="[
              'rounded-lg px-3 py-2 text-sm',
              msg.role === 'user'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
            ]"
          >
            {{ msg.text }}
          </div>
          <span class="text-[10px] text-gray-400 mt-1">{{ msg.role === 'user' ? 'You' : 'Gemini' }}</span>
        </div>

        <div v-if="isLoading" class="flex self-start items-center gap-1 text-gray-400 text-xs ml-1">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
          Thinking...
        </div>

        <!-- Input -->
        <template #footer>
          <form @submit.prevent="sendMessage" class="flex gap-2">
            <UInput
              v-model="input"
              placeholder="メッセージを入力..."
              class="flex-1"
              :disabled="isLoading"
              autocomplete="off"
            />
            <UButton
              type="submit"
              color="primary"
              :loading="isLoading"
              :disabled="!input.trim()"
              icon="i-heroicons-paper-airplane"
            />
          </form>
        </template>
      </UCard>
    </transition>

    <!-- Toggle Button -->
    <UButton
      v-if="!isOpen"
      size="xl"
      color="primary"
      class="rounded-full shadow-lg p-4"
      icon="i-heroicons-chat-bubble-bottom-center-text"
      @click="isOpen = true"
    />
  </div>
</template>

<script setup lang="ts">
interface ChatMessage {
  role: "user" | "model";
  text: string;
}

const models = [
  { label: 'Gemini 2.5 Flash', value: 'gemini-2.5-flash' },
  { label: 'Gemini 2.5 Pro', value: 'gemini-2.5-pro' },
  { label: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash' },
  { label: 'Gemini 2.5 Flash-Lite', value: 'gemini-2.5-flash-lite' },
  { label: 'Gemini Exp 1206', value: 'gemini-exp-1206' },
];

const isOpen = ref(false);
const input = ref("");
const isLoading = ref(false);
const messages = ref<ChatMessage[]>([]);
const selectedModel = ref(models[0]?.value || 'gemini-2.5-flash');

// Gemini API 用の履歴フォーマットに変換
const getHistory = () => {
  return messages.value.map(m => ({
    role: m.role,
    parts: [{ text: m.text }]
  }));
};

const sendMessage = async () => {
  if (!input.value.trim() || isLoading.value) return;

  const userMessage = input.value.trim();
  messages.value.push({ role: "user", text: userMessage });
  input.value = "";
  isLoading.value = true;

  try {
    const history = getHistory().slice(0, -1); // 最新の入力はAPI呼び出しのmessage引数として渡すため除く（または全部historyに入れてmessage空でもいいが、API仕様による）
    
    // server/api/gemini/chat.post.ts に合わせてリクエスト
    const { data, error } = await useFetch("/api/gemini/chat", {
      method: "POST",
      body: {
        message: userMessage,
        history: history,
        model: selectedModel.value,
      },
    });

    if (error.value) throw error.value;

    if (data.value?.text) {
      messages.value.push({ role: "model", text: data.value.text });
    }
  } catch (err) {
    console.error(err);
    messages.value.push({ role: "model", text: "エラーが発生しました。もう一度お試しください。" });
  } finally {
    isLoading.value = false;
  }
};
</script>
