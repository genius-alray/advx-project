import z from "zod";
import { threadManager } from "~~/server/service/threadManager";

const bodySchema = z.object({
  roleId: z.string(),
});

/**
 * 创建新对话
 */
export default defineEventHandler(async (event) => {
  const user = (await requireUserSession(event)).user;
  const body = await readValidatedBody(event, bodySchema.parse);
  const threadId = genUUID4();
  await threadManager.instance.addThread(user.id, body.roleId, threadId);
  return {
    id: threadId,
  };
});
