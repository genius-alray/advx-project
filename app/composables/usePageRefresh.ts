/**
 * 页面刷新 composable
 * 确保页面切换时重新加载数据
 */
export const usePageRefresh = (loadDataFn: () => Promise<void> | void) => {
  const route = useRoute();
  const isInitialized = ref(false);

  // 包装加载函数，添加错误处理
  const safeLoadData = async () => {
    try {
      await loadDataFn();
    } catch (error) {
      console.error("Failed to load page data:", error);
    }
  };

  // 监听路由变化，当切换到当前页面时重新加载数据
  watch(
    () => route.path,
    async (newPath, oldPath) => {
      // 只在路由真正改变且已经初始化后触发
      if (oldPath && newPath !== oldPath && isInitialized.value) {
        await nextTick(); // 确保页面已经切换完成
        await safeLoadData();
      }
    },
    { immediate: false }
  );

  // 页面激活时重新加载数据（用于 keep-alive 场景）
  onActivated(async () => {
    if (isInitialized.value) {
      await safeLoadData();
    }
  });

  // 组件挂载时加载数据
  onMounted(async () => {
    await safeLoadData();
    isInitialized.value = true;
  });

  // 页面可见性变化时刷新数据（用户切换标签页回来时）
  if (process.client) {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible" && isInitialized.value) {
        await safeLoadData();
      }
    };

    onMounted(() => {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    });

    onUnmounted(() => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    });
  }
};
