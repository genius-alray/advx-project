import { threadManager } from "~~/server/service/threadManager";

/**
 * 获取 thread 内容
 */
export default defineEventHandler(async (event) => {
  await requireUserSession(event);
  const id = event.context.params!.id;
  return await threadManager.instance.getThread(id);
});
