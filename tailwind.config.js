/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class', '[data-theme="dark"]'],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            },
        },
    },
    plugins: [
        require('daisyui'),
    ],
    daisyui: {
        themes: [
            {
                dark: {
                    ...require("daisyui/src/theming/themes")["dark"],
                    "primary": "#6366f1", // Indigo 500
                    "primary-content": "#ffffff",
                    "secondary": "#8b5cf6", // Violet 500
                    "accent": "#22d3ee", // Cyan 400
                    "neutral": "#0f172a", // Slate 900
                    "base-100": "#1e293b", // Slate 800
                    "base-200": "#0f172a", // Slate 900
                    "base-300": "#334155", // Slate 700
                    "--rounded-box": "1rem",
                    "--rounded-btn": "0.5rem",
                },
            },
            "dark", // Fallback
        ],
    },
}
