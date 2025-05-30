import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
          primary: "#e63946",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily:{
        amiri:['Amiri', 'cursive']
       },
    },
  },
  plugins: [],
} satisfies Config;
