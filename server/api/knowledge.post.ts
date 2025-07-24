const knowledgeStorage = useStorage("memory");
export default defineEventHandler(async (ev) => {
  if (!(await knowledgeStorage.hasItem("knowledge"))) {
    await knowledgeStorage.setItem("knowledge", []);
  }
  const knowledge = (await knowledgeStorage.getItem("knowledge")) as string[];

  const { data } = await readBody(ev);
  console.log(data);
  if (typeof data == "string") {
    await knowledgeStorage.setItem("knowledge", [...knowledge, data]);
  } else if (data.length) {
    await knowledgeStorage.setItem("knowledge", [...knowledge, ...data]);
  }
  return "Added knowledge";
});
