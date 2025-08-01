import { voiceManager } from "~~/server/service/voiceManager";

/**
 * 上传语音样本
 * 请上传表单格式的请求
 */
export default defineEventHandler(async (event) => {
  const user = (await requireUserSession(event)).user;
  const formData = await readFormData(event);
  const file = formData.get("file") as File;
  const data = await file.arrayBuffer();
  const blob = new Blob([data], { type: file.type });
  const voiceId = genUUID4();

  await voiceManager.instance.addVoice(file.name, user.id, voiceId, blob);

  return {
    id: voiceId,
  };
});
