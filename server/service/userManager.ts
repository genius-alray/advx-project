/**
 * 用户管理
 */
export class userManager extends Singleton<userManager>() {
  users = useStorage<User>("users");

  async addUser(user: { id: string; name: string; password: string }) {
    if (await this.users.get(user.id)) {
      throw new Error("用户已存在");
    }
    this.users.set(user.id, user);
  }

  async getUser(userId: string) {
    return await this.users.get(userId);
  }
}
