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
    drawer: {
      slots: {
        overlay: "backdrop-blur-sm bg-transparent",
      },
    },
    input: {
      slots: {
        base: "placeholder:text-primary/70 placeholder:font-black p-4",
      },
      variants: {
        variant: {
          outline: "bg-primary/30 ring-transparent text-primary font-black",
        },
      },
    },
    textarea: {
      slots: {
        base: "placeholder:text-primary/70 placeholder:font-black",
      },
      variants: {
        variant: {
          outline: "bg-primary/30 ring-transparent text-primary font-black",
        },
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
