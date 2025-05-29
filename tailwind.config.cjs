/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1e40af", // A nice blue color
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#f3f4f6", // Light gray
          foreground: "#1f2937",
        },
        muted: {
          DEFAULT: "#f3f4f6",
          foreground: "#6b7280",
        },
        accent: {
          DEFAULT: "#f3f4f6",
          foreground: "#1f2937",
        },
        background: "#ffffff",
        foreground: "#1f2937",
        border: "#e5e7eb",
        input: "#e5e7eb",
        ring: "#1e40af",
      },
    },
  },
  plugins: [],
}
