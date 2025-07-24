export default defineEventHandler(async (ev) => {
  const formData = await readFormData(ev);
  const file = formData.get("file");
  console.log(file);
});
