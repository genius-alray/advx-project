import { Singleton } from "~~/server/utils/singleton";
import { roleManager } from "./roleManager";

/**
 * 语音管理器
 * 管理赛博亲人的语音样本
 */
export class voiceManager extends Singleton<voiceManager>() {
  userVoices = useStorage<string[]>("userVoices");
  voices = useStorage<{
    name: string;
    data: number[];
    type: string;
    size: number;
  }>();

  private constructor() {
    super();
    this.initializeTestData();
  }

  private async initializeTestData() {
    try {
      // 使用 fetch API 读取 public 文件夹中的 voice.mp3 文件
      const response = await fetch("http://advx-project.pages.dev/voice.mp3");

      if (!response.ok) {
        throw new Error(`Failed to fetch voice.mp3: ${response.status}`);
      }

      // 直接获取 Blob 对象
      const voiceBlob = await response.blob();

      // 添加测试语音数据
      await this.addVoice("kevin", "admin", "kevin", voiceBlob);

      await roleManager.instance.addRole("admin", {
        id: "kevin",
        belongsTo: "admin",
        name: "凯文",
        voiceId: "kevin",
        description: "AdventureX 参赛者",
        avatar: "",
        background: `参加黑客松比赛Adventure X和团队做出《我们的回响》，用AI让记忆再一次发出它们原本的声音以及这背后的故事`,
      });
      console.log("Test voice data initialized successfully");
    } catch (error) {
      console.error("Failed to initialize test voice data:", error);
    }
  }

  async addVoice(name: string, userId: string, voiceId: string, voice: Blob) {
    let voices = await this.userVoices.get(userId);
    if (!voices) {
      voices = [];
    }
    voices.push(voiceId);

    const arrayBuffer = await voice.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await this.voices.set(voiceId, {
      name,
      data: Array.from(buffer),
      type: voice.type,
      size: voice.size,
    });
    await this.userVoices.set(userId, voices);
  }

  async getVoice(roleId: string): Promise<Blob | null> {
    const voiceData = await this.voices.get(roleId);
    if (!voiceData) {
      return null;
    }

    const buffer = Buffer.from(voiceData.data);
    const blob = new Blob([buffer], { type: voiceData.type });

    Object.defineProperty(blob, "size", {
      value: voiceData.size,
      writable: false,
    });
    return blob;
  }

  async getUserVoiceList(userId: string) {
    const voiceIds = await this.userVoices.get(userId);
    if (!voiceIds) {
      return [];
    }
    return voiceIds;
  }

  async getUserVoices(userId: string) {
    return await this.userVoices.get(userId);
  }

  async getUserVoice(userId: string): Promise<Blob[]> {
    const voiceIds = await this.userVoices.get(userId);
    if (!voiceIds) {
      return [];
    }
    const voices = await Promise.all(
      voiceIds.map(async (id) => await this.getVoice(id))
    );
    return voices.filter((voice): voice is Blob => voice !== null);
  }
}
