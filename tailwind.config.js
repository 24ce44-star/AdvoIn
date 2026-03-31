/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        legal: {
          // Primary: Authority, Trust, Security
          navy: "#0F172A", // Deep Navy Blue
          navyLight: "#1E3A8A",

          // Secondary/Tech Accent: AI, Intelligence, Modern
          steel: "#3B82F6", // Steel Blue (Primary AI color)
          steelLight: "#0EA5E9", // Teal/Ice blue for active states

          // Background: Clean, minimal, readable
          ice: "#F8FAFC", // Off-White / Ice Background
          surface: "#FFFFFF", // Pure white blocks

          // Highlights/Feedback: Success, verification, status
          emerald: "#059669", // Premium Green
          sage: "#10B981", // Soft Green

          // Warnings, Destruction, Errors
          crimson: "#E11D48", // Professional deep red
          charcoal: "#171717",
          slate: "#64748B",
          accent: "#1E293B",
        },
      },
    },
  },
  plugins: [],
};
