/**
 * 单例模式 (Singleton Pattern)
 * @param T
 * @returns
 */
export function Singleton<T>() {
  class Singleton {
    protected constructor() {}

    /**
     * 获取单例实例 (Get singleton instance)
     * @returns 单例实例 (Singleton instance)
     */
    public static get instance(): T {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(Singleton as any)._instance) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (Singleton as any)._instance = new this();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (Singleton as any)._instance as T;
    }

    /**
     * 销毁单例实例 (Destroy singleton instance)
     */
    public static destroyInstance(): void {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Singleton as any)._instance = null;
    }
  }

  return Singleton;
}
