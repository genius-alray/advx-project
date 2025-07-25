/**
 * 底部选项卡导航 composable
 * 确保点击选项卡时强制刷新页面数据
 */
export const useTabNavigation = () => {
  const router = useRouter();
  const route = useRoute();

  // 创建一个全局事件总线来通知页面刷新
  const refreshEvent = 'tab-navigation-refresh';

  const navigateToTab = async (path: string) => {
    // 如果已经在目标页面，强制刷新数据
    if (route.path === path) {
      // 触发页面刷新事件
      if (process.client) {
        window.dispatchEvent(new CustomEvent(refreshEvent, { detail: { path } }));
      }
    } else {
      // 导航到新页面
      await router.push(path);
    }
  };

  // 监听刷新事件的函数
  const onTabRefresh = (callback: () => void) => {
    if (process.client) {
      const handleRefresh = (event: CustomEvent) => {
        if (event.detail.path === route.path) {
          callback();
        }
      };

      window.addEventListener(refreshEvent, handleRefresh as EventListener);

      onUnmounted(() => {
        window.removeEventListener(refreshEvent, handleRefresh as EventListener);
      });
    }
  };

  return {
    navigateToTab,
    onTabRefresh,
  };
};
