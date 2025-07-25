import { roleManager } from "~~/server/service/roleManager";

/**
 * 获取用户创建的所有 role
 */
export default defineEventHandler(async (event) => {
  const userId = (await requireUserSession(event)).user.id;
  const roles = await roleManager.instance.getUserRoles(userId);
  return roles;
});
