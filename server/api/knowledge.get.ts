const knowledgeStorage = useStorage("memory");
export default defineEventHandler(async () => {
  return await knowledgeStorage.getItem("knowledge");
});
