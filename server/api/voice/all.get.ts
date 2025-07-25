import { voiceManager } from "~~/server/service/voiceManager";

/**
 * 获取用户创建的声音
 */
export default defineEventHandler(async (event) => {
  const user = (await requireUserSession(event)).user;
  return await voiceManager.instance.getUserVoiceList(user.id);
});
