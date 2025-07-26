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
      variants: {
        size: {
          xl: "py-4 px-9",
        },
      },
    },
    drawer: {
      slots: {
        overlay: "backdrop-blur-sm bg-transparent",
        content: "backdrop-blur-lg bg-white/20",
      },
    },
    input: {
      slots: {
        base: "placeholder:text-primary/70 placeholder:font-black inset-shadow-sm/30 inset-shadow-primary",
      },
      variants: {
        variant: {
          outline: "bg-white/50  text-primary font-black ring-transparent",
        },
        size: {
          xl: {
            base: "p-4 rounded-xl",
          },
        },
      },
    },
    textarea: {
      slots: {
        base: "placeholder:text-primary/70 placeholder:font-black inset-shadow-sm/30 inset-shadow-primary",
      },
      variants: {
        variant: {
          outline: "bg-white/30 ring-transparent text-primary font-black",
        },
        size: {
          xl: {
            base: "p-4 rounded-xl",
          },
        },
      },
    },
    separator: {
      slots: {
        container: "font-bold text-primary flex",
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
