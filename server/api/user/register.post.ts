import { userManager } from "~~/server/service/userManager";
import { z } from "zod";

const bodySchema = z.object({
  id: z.string(),
  name: z.string(),
  password: z.string(),
});

/**
 * 用户注册
 */
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse);
  try {
    await userManager.instance.addUser(body);
    return {
      message: "注册成功",
    };
  } catch (e: unknown) {
    throw createError({
      statusCode: 400,
      statusMessage: (e as Error).message,
    });
  }
});
