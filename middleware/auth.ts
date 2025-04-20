export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser();
  const loading = useState("auth-loading", () => true);

  // 認証が必要なページへのアクセス時
  if (to.path === "/board") {
    if (!user.value) {
      return navigateTo("/auth");
    }
  }

  // 認証済みユーザーの認証ページへのアクセス時
  if (to.path === "/auth" && user.value) {
    return navigateTo("/board");
  }

  // トップページへのアクセス時
  if (to.path === "/" && user.value) {
    return navigateTo("/board");
  }

  loading.value = false;
});
