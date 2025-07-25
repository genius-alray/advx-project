import { voiceManager } from "~~/server/service/voiceManager";

/**
 * 获取用户的语音ID列表
 */
export default defineEventHandler(async (event) => {
  const user = (await requireUserSession(event)).user;
  const voiceIds = await voiceManager.instance.getUserVoices(user.id);

  if (!voiceIds || voiceIds.length === 0) {
    return [];
  }

  // 返回语音ID和显示名称的列表
  const result = voiceIds.map((id, index) => ({
    id,
    name: `语音文件 #${index + 1}`,
  }));

  return result;
});
