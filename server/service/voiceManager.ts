import { Singleton } from "~~/server/utils/singleton";

/**
 * 语音管理器
 * 管理赛博亲人的语音样本
 */
export class voiceManager extends Singleton<voiceManager>() {
  userVoices = useStorage<string[]>("userVoices");
  voices = useStorage<{ data: number[]; type: string; size: number }>();

  async addVoice(userId: string, voiceId: string, voice: Blob) {
    let voices = await this.userVoices.get(userId);
    if (!voices) {
      voices = [];
    }
    voices.push(voiceId);

    // Convert Blob to Buffer for storage
    const arrayBuffer = await voice.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await this.voices.set(voiceId, {
      data: Array.from(buffer), // Convert Buffer to array of numbers for JSON serialization
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
    // Convert number array back to Buffer, then to Blob
    const buffer = Buffer.from(voiceData.data);
    const blob = new Blob([buffer], { type: voiceData.type });
    // Manually set the size property (though it should be automatically set)
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
