import { ref, computed } from "vue";

export function useAuth() {
  const user = useSupabaseUser();
  const client = useSupabaseClient();
  const loading = ref(false);
  const errorMessage = ref("");

  // client-side only
  if (process.client) {
    // 認証状態の初期化は自動的に行われるため必要なし
  }

  const isLoggedIn = computed(() => !!user.value);
  const isAnonymous = computed(() => user.value?.is_anonymous === true);

  const login = async (email: string, password: string) => {
    loading.value = true;
    errorMessage.value = "";
    const { error } = await client.auth.signInWithPassword({
      email,
      password,
    });
    if (error) errorMessage.value = error.message;
    loading.value = false;
  };

  const logout = async () => {
    await client.auth.signOut();
  };

  const guestLogin = async () => {
    loading.value = true;
    errorMessage.value = "";
    const { error } = await client.auth.signInAnonymously();
    if (error) errorMessage.value = error.message;
    loading.value = false;
  };

  return {
    user,
    isLoggedIn,
    isAnonymous,
    loading,
    errorMessage,
    login,
    logout,
    guestLogin,
  };
}
