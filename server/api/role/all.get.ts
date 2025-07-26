import { knowledgeManager } from "~~/server/service/knowledgeManager";
import { roleManager } from "~~/server/service/roleManager";

/**
 * 获取用户创建的所有 role
 */
export default defineEventHandler(
  async (event): Promise<(Role & { knowledgeCount: number })[]> => {
    const userId = (await requireUserSession(event)).user.id;
    const roles = await roleManager.instance.getUserRoles(userId);
    const data = [];
    for (const role of roles) {
      const knowledgeArr = await knowledgeManager.instance.getRoleKnowledge(
        role.id
      );
      data.push({
        ...role,
        knowledgeCount: knowledgeArr.length,
      });
    }
    return data;
  }
);
