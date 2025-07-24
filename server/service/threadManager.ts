import { genUUID4 } from "~~/shared/utils/uuid4";

/**
 * 对话管理
 */
export class threadManager extends Singleton<threadManager>() {
  private userThreads = useStorage<string[]>("userThreads");
  private threads = useStorage<Thread>("threads");

  async addThread(userId: string, roleId: string) {
    const threadId = genUUID4();
    let threads = await this.userThreads.get(userId);
    if (!threads) {
      threads = [];
    }
    threads.push(threadId);
    await this.userThreads.set(userId, threads);
    await this.threads.set(threadId, {
      id: threadId,
      userId,
      roleId,
      title: "新对话",
      content: [],
    });
    return threadId;
  }

  async removeThread(userId: string, threadId: string) {
    await this.threads.remove(threadId);
    const threads = await this.userThreads.get(userId);
    if (!threads) {
      return;
    }
    threads.splice(threads.indexOf(threadId), 1);
    await this.userThreads.set(userId, threads);
  }

  async getThread(threadId: string) {
    return await this.threads.get(threadId);
  }

  async getUserThreads(userId: string) {
    return (
      (await this.userThreads.get(userId))?.map(async (id) => {
        await this.getThread(id);
      }) ?? []
    );
  }

  async setThreadTitle(userId: string, threadId: string, title: string) {
    const thread = await this.threads.get(threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }
    thread.title = title;
    await this.threads.set(threadId, thread);
  }

  async addMessage(threadId: string, message: Message) {
    const thread = await this.threads.get(threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }
    thread.content.push(message);
    await this.threads.set(threadId, thread);
  }
}
