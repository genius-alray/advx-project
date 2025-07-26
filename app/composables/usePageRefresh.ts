/**
 * 页面刷新 composable
 * 确保页面切换时重新加载数据
 */
export const usePageRefresh = (loadDataFn: () => Promise<void> | void) => {
  const route = useRoute();
  const isInitialized = ref(false);

  const safeLoadData = async () => {
    try {
      await loadDataFn();
    } catch (error) {
      console.error("Failed to load page data:", error);
    }
  };

  watch(
    () => route.path,
    async (newPath, oldPath) => {
      if (oldPath && newPath !== oldPath && isInitialized.value) {
        await nextTick();
        await safeLoadData();
      }
    },
    { immediate: false }
  );

  onActivated(async () => {
    if (isInitialized.value) {
      await safeLoadData();
    }
  });

  onMounted(async () => {
    await safeLoadData();
    isInitialized.value = true;
  });

  if (import.meta.client) {
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
