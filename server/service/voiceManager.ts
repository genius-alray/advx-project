import { Singleton } from "~~/server/utils/singleton";

/**
 * 语音管理器
 * 管理赛博亲人的语音样本
 */
export class voiceManager extends Singleton<voiceManager>() {
  userVoices = useStorage<string[]>("userVoices");
  voices = useStorage<Blob>();

  async addVoice(userId: string, voiceId: string, voice: Blob) {
    let voices = await this.userVoices.get(userId);
    if (!voices) {
      voices = [];
    }
    voices.push(voiceId);
    await this.voices.set(voiceId, voice);
    await this.userVoices.set(userId, voices);
  }

  async getVoice(roleId: string) {
    return await this.voices.get(roleId);
  }

  async getUserVoice(userId: string) {
    return (
      (await this.userVoices.get(userId))?.map(async (id) => {
        await this.getVoice(id);
      }) ?? []
    );
  }

  async getUserVoices(userId: string) {
    return await this.userVoices.get(userId);
  }
}
