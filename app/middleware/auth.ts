export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated } = useAuth();
  
  // Allow access to login and register pages
  if (to.path === '/login' || to.path === '/register') {
    return;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated.value) {
    return navigateTo('/login');
  }
});
