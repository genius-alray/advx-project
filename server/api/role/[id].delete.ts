import { roleManager } from "~~/server/service/roleManager";

/**
 * 删除 role
 */
export default defineEventHandler(async (event) => {
  const user = (await requireUserSession(event)).user;
  roleManager.instance.removeRole(user.id, event.context.params!.id);
});
