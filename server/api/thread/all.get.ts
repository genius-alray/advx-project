import { threadManager } from "~~/server/service/threadManager";

/**
 * 获取用户创建的所有 thread
 */
export default defineEventHandler(async (event) => {
  const userId = event.context.auth.user.id;
  const userThreads = await threadManager.instance.getUserThreads(userId);
  return userThreads;
});
