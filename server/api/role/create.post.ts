import z from "zod";
import { roleManager } from "~~/server/service/roleManager";

const bodySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  avatar: z.string().optional(),
  background: z.string().optional(),
  voiceId: z.string().optional(),
});

/**
 * 创建新的赛博亲人
 */
export default defineEventHandler(async (event) => {
  const user = (await requireUserSession(event)).user;
  const body = await readValidatedBody(event, bodySchema.parse);
  const roleId = genUUID4();
  await roleManager.instance.addRole(user.id, {
    id: roleId,
    name: body.name,
    description: body.description ?? "我的赛博祖先",
    avatar: body.avatar ?? "",
    background: body.background ?? "",
    voiceId: body.voiceId ?? "default",
    belongsTo: user.id,
  });
  return {
    id: roleId,
  };
});
