export interface Knowledge {
  id: string;
  roleId: string;
  name: string;
  content: string;
  type: "text" | "file";
  createdAt: string;
  updatedAt: string;
}

/**
 * 知识/记忆管理
 */
export class knowledgeManager extends Singleton<knowledgeManager>() {
  private knowledgeStorage = useStorage("memory");
  private roleKnowledgeStorage = useStorage("memory");

  private constructor() {
    super();
    this.addKnowledge(
      "kevin",
      `我是一个在技术与人文之间搭建桥梁的人。

我痴迷于用代码，去捕捉那些最真实、最温暖的家庭记忆。面对这个信息爆炸但智慧日益稀缺的时代，我发起《我们的回响》这个实验，就是我的一次宣言：

我相信科技最大的价值，不是创造一个冰冷的未来，而是让我们能更好地传承一个温暖的过去。我希望用我们的实验，为每一个家庭，留住那份独一无二的、充满爱与智慧的回响。
我们要向遗忘说不，向家庭成员之间日渐增长的承诺说不用科技作为桥梁去连接两代人，以及代代人之间的代沟，去补全啊，完善一个完整的家庭故事。同时，我们还可以让年轻人发出属于自己的未来胶囊。这个胶囊可以给未来需要，只是自己的力量去给这一次经历一次郑重的回想`,
      "text"
    );
  }

  /**
   * 为角色添加知识/记忆
   */
  async addKnowledge(
    roleId: string,
    content: string,
    name?: string,
    type: "text" | "file" = "text"
  ): Promise<Knowledge> {
    const knowledge: Knowledge = {
      id: genUUID4(),
      roleId,
      name: name || `记忆 #${Date.now()}`,
      content,
      type,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.knowledgeStorage.setItem(`knowledge:${knowledge.id}`, knowledge);

    const roleKnowledgeKey = `role_knowledge:${roleId}`;
    const existingKnowledgeIds =
      (await this.roleKnowledgeStorage.getItem<string[]>(roleKnowledgeKey)) ||
      [];
    await this.roleKnowledgeStorage.setItem(roleKnowledgeKey, [
      ...existingKnowledgeIds,
      knowledge.id,
    ]);

    return knowledge;
  }

  /**
   * 获取角色的所有知识/记忆
   */
  async getRoleKnowledge(roleId: string): Promise<Knowledge[]> {
    const roleKnowledgeKey = `role_knowledge:${roleId}`;
    const knowledgeIds =
      (await this.roleKnowledgeStorage.getItem<string[]>(roleKnowledgeKey)) ||
      [];

    const knowledgeList: Knowledge[] = [];
    for (const id of knowledgeIds) {
      const knowledge = await this.knowledgeStorage.getItem<Knowledge>(
        `knowledge:${id}`
      );
      if (knowledge) {
        knowledgeList.push(knowledge);
      }
    }

    return knowledgeList.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * 获取单个知识条目
   */
  async getKnowledge(knowledgeId: string): Promise<Knowledge | null> {
    return await this.knowledgeStorage.getItem<Knowledge>(
      `knowledge:${knowledgeId}`
    );
  }

  /**
   * 更新知识条目
   */
  async updateKnowledge(
    knowledgeId: string,
    content: string,
    name?: string
  ): Promise<Knowledge | null> {
    const knowledge = await this.getKnowledge(knowledgeId);
    if (!knowledge) {
      return null;
    }

    const updatedKnowledge: Knowledge = {
      ...knowledge,
      content,
      ...(name && { name }),
      updatedAt: new Date().toISOString(),
    };

    await this.knowledgeStorage.setItem(
      `knowledge:${knowledgeId}`,
      updatedKnowledge
    );
    return updatedKnowledge;
  }

  /**
   * 删除知识条目
   */
  async deleteKnowledge(knowledgeId: string): Promise<boolean> {
    const knowledge = await this.getKnowledge(knowledgeId);
    if (!knowledge) {
      return false;
    }

    await this.knowledgeStorage.removeItem(`knowledge:${knowledgeId}`);

    const roleKnowledgeKey = `role_knowledge:${knowledge.roleId}`;
    const knowledgeIds =
      (await this.roleKnowledgeStorage.getItem<string[]>(roleKnowledgeKey)) ||
      [];
    const updatedIds = knowledgeIds.filter((id) => id !== knowledgeId);
    await this.roleKnowledgeStorage.setItem(roleKnowledgeKey, updatedIds);

    return true;
  }

  /**
   * 删除角色的所有知识
   */
  async deleteRoleKnowledge(roleId: string): Promise<boolean> {
    const roleKnowledgeKey = `role_knowledge:${roleId}`;
    const knowledgeIds =
      (await this.roleKnowledgeStorage.getItem<string[]>(roleKnowledgeKey)) ||
      [];

    for (const id of knowledgeIds) {
      await this.knowledgeStorage.removeItem(`knowledge:${id}`);
    }

    await this.roleKnowledgeStorage.removeItem(roleKnowledgeKey);

    return true;
  }

  /**
   * 批量添加知识（用于文件上传）
   */
  async addBatchKnowledge(
    roleId: string,
    contents: string[],
    names?: string[],
    type: "text" | "file" = "text"
  ): Promise<Knowledge[]> {
    const knowledgeList: Knowledge[] = [];

    for (let i = 0; i < contents.length; i++) {
      const content = contents[i];
      if (content.trim()) {
        const name = names?.[i];
        const knowledge = await this.addKnowledge(
          roleId,
          content.trim(),
          name,
          type
        );
        knowledgeList.push(knowledge);
      }
    }

    return knowledgeList;
  }

  /**
   * 获取角色知识的文本内容（用于 AI 上下文）
   */
  async getRoleKnowledgeText(roleId: string): Promise<string[]> {
    const knowledgeList = await this.getRoleKnowledge(roleId);
    return knowledgeList.map((k) => k.content);
  }
}
