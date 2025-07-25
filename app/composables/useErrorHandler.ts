/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Global error handler composable
 */
export const useErrorHandler = () => {
  const handleError = (error: unknown, context?: string) => {
    console.error(`Error${context ? ` in ${context}` : ""}:`, error);

    let message = "发生了未知错误";

    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    } else if (error && typeof error === "object" && "message" in error) {
      message = (error as any).message;
    }

    // For now, use console.error and alert until toast is properly configured
    console.error("Error:", message);
    if (import.meta.client) {
      alert(`错误: ${message}`);
    }
  };

  const handleSuccess = (message: string) => {
    console.log("Success:", message);
    if (import.meta.client) {
      alert(`成功: ${message}`);
    }
  };

  const handleInfo = (message: string) => {
    console.info("Info:", message);
    if (import.meta.client) {
      alert(`提示: ${message}`);
    }
  };

  return {
    handleError,
    handleSuccess,
    handleInfo,
  };
};
