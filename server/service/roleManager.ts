/**
 * 赛博亲人管理
 */
export class roleManager extends Singleton<roleManager>() {
  private userRoles = useStorage<string[]>("userRoles");
  private roles = useStorage<Role>("roles");

  private constructor() {
    super();
  }

  async addRole(userId: string, role: Role) {
    let roles = await this.userRoles.get(userId);
    if (!roles) {
      roles = [];
    }
    roles.push(role.id);
    await this.roles.setItem(role.id, role);
    await this.userRoles.set(userId, roles);
  }

  async getRole(roleId: string) {
    return await this.roles.get(roleId);
  }

  async getUserRoles(userId: string) {
    const roleIds = await this.userRoles.get(userId);
    if (!roleIds) {
      return [];
    }
    const roles = await Promise.all(
      roleIds.map(async (id) => await this.getRole(id))
    );
    return roles.filter((role) => role !== null);
  }

  async removeRole(userId: string, roleId: string) {
    this.roles.removeItem(roleId);
    const roles = await this.userRoles.get(userId);
    if (!roles) {
      return;
    }
    roles.splice(roles.indexOf(roleId), 1);
    await this.userRoles.set(userId, roles);
  }
}
