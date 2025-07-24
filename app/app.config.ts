export default defineAppConfig({
  ui: {
    colors: {
      primary: "amber",
      neutral: "zinc",
    },
    button: {
      slots: {
        base: "rounded-lg shadow-md shadow-primary/30 font-bold",
      },
    },
  },
  icon: {
    customize: (content: string) => {
      return content
        .replace(/#2859c5/g, "#B8956A")
        .replace(/#8fbffa/g, "#DFC392");
    },
  },
});
