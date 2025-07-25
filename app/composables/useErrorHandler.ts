/**
 * Global error handler composable
 */
export const useErrorHandler = () => {
  const toast = useToast();

  const handleError = (error: unknown, context?: string) => {
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);
    
    let message = "发生了未知错误";
    
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      message = (error as any).message;
    }

    // Show toast notification
    toast.add({
      title: "错误",
      description: message,
      color: "red",
      timeout: 5000,
    });
  };

  const handleSuccess = (message: string) => {
    toast.add({
      title: "成功",
      description: message,
      color: "green",
      timeout: 3000,
    });
  };

  const handleInfo = (message: string) => {
    toast.add({
      title: "提示",
      description: message,
      color: "blue",
      timeout: 3000,
    });
  };

  return {
    handleError,
    handleSuccess,
    handleInfo,
  };
};
