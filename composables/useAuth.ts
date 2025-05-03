import { useSupabaseUser, useSupabaseClient } from "#imports";
import { useRouter } from "vue-router";

export function useAuth() {
  const user = useSupabaseUser();
  const client = useSupabaseClient();
  const router = useRouter();

  const logout = async () => {
    await client.auth.signOut();
    router.push("/auth");
  };

  return {
    user,
    logout,
  };
}
