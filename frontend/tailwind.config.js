/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    screens: {
      xxs: "320px",
      xs: "375px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["Outfit", "ui-sans-serif", "system-ui"],
        heading: ["Plus Jakarta Sans", "Outfit", "ui-sans-serif", "system-ui"],
        body: ["Inter", "ui-sans-serif", "system-ui"],
      },
      colors: {
        accent: {
          50: "#eef6ff",
          100: "#d9eaff",
          200: "#bad6ff",
          300: "#8bb8ff",
          400: "#5a91ff",
          500: "#3366ff",
          600: "#1f4ce6",
          700: "#193db7",
          800: "#1a378f",
          900: "#1a3270",
        },
      },
      boxShadow: {
        glow: "0 24px 80px rgba(51, 102, 255, 0.18)",
        "cyan-sm": "0 0 20px rgba(34,211,238,0.15)",
        "cyan-md": "0 0 40px rgba(34,211,238,0.25)",
        "cyan-lg": "0 0 80px rgba(34,211,238,0.3)",
      },
      backgroundImage: {
        grid: "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.18) 1px, transparent 0)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
