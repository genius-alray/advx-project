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

  if (!file.type.startsWith("image/")) {
    throw createError({
      statusCode: 400,
      statusMessage: "Only image files are allowed",
    });
  }

  if (file.size > 5 * 1024 * 1024) {
    throw createError({
      statusCode: 400,
      statusMessage: "File size too large (max 5MB)",
    });
  }

  const data = await file.arrayBuffer();
  const avatarId = genUUID4();

  const avatarStorage = useStorage("avatars");
  await avatarStorage.setItem(avatarId, new Blob([data], { type: file.type }));

  return {
    id: avatarId,
    url: `/api/avatar/${avatarId}`,
  };
});
