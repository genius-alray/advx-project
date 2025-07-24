import z from "zod";
import { threadManager } from "~~/server/service/threadManager";

const bodySchema = z.object({
  message: z.string(),
});

/**
 * 向 thread 添加内容
 */
export default defineEventHandler(async (event) => {
  const user = (await requireUserSession(event)).user;
  const body = await readValidatedBody(event, bodySchema.parse);
  await threadManager.instance.addMessage(event.context.params!.id, {
    id: genUUID4(),
    sender: "user",
    senderId: user.id,
    type: "text",
    content: body.message,
  });
});
