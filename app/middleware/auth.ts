export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated } = useAuth();

  if (to.path === "/login" || to.path === "/register") {
    return;
  }

  if (!isAuthenticated.value) {
    return navigateTo("/login");
  }
});
