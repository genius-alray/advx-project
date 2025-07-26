/**
 * 底部选项卡导航 composable
 * 确保点击选项卡时强制刷新页面数据
 */
export const useTabNavigation = () => {
  const router = useRouter();
  const route = useRoute();

  const refreshEvent = "tab-navigation-refresh";

  const navigateToTab = async (path: string) => {
    if (route.path === path) {
      if (import.meta.client) {
        await navigateTo(path, { replace: true });
      }
    } else {
      await router.push(path);
    }
  };

  const onTabRefresh = (callback: () => void) => {
    if (import.meta.client) {
      const handleRefresh = (event: CustomEvent) => {
        if (event.detail.path === route.path) {
          callback();
        }
      };

      window.addEventListener(refreshEvent, handleRefresh as EventListener);

      onUnmounted(() => {
        window.removeEventListener(
          refreshEvent,
          handleRefresh as EventListener
        );
      });
    }
  };

  return {
    navigateToTab,
    onTabRefresh,
  };
};
