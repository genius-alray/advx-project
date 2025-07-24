import { threadManager } from "~~/server/service/threadManager";

/**
 * 向 thread 添加内容
 */
export default defineEventHandler(async (event) => {
  await requireUserSession(event);
  const thread = await threadManager.instance.getThread(
    event.context.params!.id
  );
  if (!thread) {
    throw createError({
      statusCode: 404,
      message: "thread not found",
    });
  }
  return await threadManager.instance.addMessage(event.context.params!.id, {
    id: genUUID4(),
    sender: "ai",
    senderId: thread.roleId,
    type: "text",
    content: "您的的赛博祖先正在通话中，请稍候再拨。",
  });
});
