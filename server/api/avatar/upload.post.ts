/**
 * 上传头像文件
 */
export default defineEventHandler(async (event) => {
  const user = (await requireUserSession(event)).user;
  const formData = await readFormData(event);
  const file = formData.get("file") as File;
  
  if (!file) {
    throw createError({
      statusCode: 400,
      statusMessage: "No file provided",
    });
  }
  
  // 检查文件类型
  if (!file.type.startsWith("image/")) {
    throw createError({
      statusCode: 400,
      statusMessage: "Only image files are allowed",
    });
  }
  
  // 检查文件大小 (限制为5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw createError({
      statusCode: 400,
      statusMessage: "File size too large (max 5MB)",
    });
  }
  
  const data = await file.arrayBuffer();
  const avatarId = genUUID4();
  
  // 存储头像文件
  const avatarStorage = useStorage("avatars");
  await avatarStorage.setItem(avatarId, new Blob([data], { type: file.type }));
  
  return {
    id: avatarId,
    url: `/api/avatar/${avatarId}`
  };
});
