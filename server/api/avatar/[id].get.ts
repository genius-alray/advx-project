/**
 * 获取头像文件
 */
export default defineEventHandler(async (event) => {
  const avatarId = event.context.params!.id;
  const avatarStorage = useStorage("avatars");
  
  const avatar = await avatarStorage.getItem(avatarId);
  
  if (!avatar) {
    throw createError({
      statusCode: 404,
      statusMessage: "Avatar not found",
    });
  }
  
  // 设置响应头
  setHeader(event, "Content-Type", (avatar as Blob).type || "image/jpeg");
  setHeader(event, "Cache-Control", "public, max-age=31536000");
  
  return avatar;
});
