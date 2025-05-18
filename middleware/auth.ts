export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser();
  const loading = useState("auth-loading", () => true);
  console.log("middleware:", to.path, to.query);

  // ?code=を検知しgoogle認証完了後にリダイレクト
  if (to.path === "/" && to.query.code) {
    return navigateTo("/board");
  }

  // 認証が必要なページへのアクセス時
  if (to.path === "/board") {
    if (!user.value) {
      return navigateTo("/auth");
    }
  }

  // 認証済みユーザーの認証ページへのアクセス時
  // 匿名ユーザーは除外して、通常のログインユーザーのみリダイレクト
  if (to.path === "/auth" && user.value && !user.value.is_anonymous) {
    return navigateTo("/board");
  }

  // トップページへのアクセス時
  if (to.path === "/" && user.value) {
    return navigateTo("/board");
  }

  loading.value = false;
});
