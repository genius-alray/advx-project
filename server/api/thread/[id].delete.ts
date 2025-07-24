import { threadManager } from "~~/server/service/threadManager";

/**
 * 删除对话
 */
export default defineEventHandler(async (event) => {
  const user = (await requireUserSession(event)).user;
  await threadManager.instance.removeThread(user.id, event.context.params!.id);
});
