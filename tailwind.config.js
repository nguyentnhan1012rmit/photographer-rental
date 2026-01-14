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
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'bounce-slow': 'bounce 3s infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [
        require('daisyui'),
    ],
    daisyui: {
        themes: [
            {
                light: {
                    ...require("daisyui/src/theming/themes")["light"],
                    "primary": "#4f46e5", // Indigo 600
                    "primary-content": "#ffffff",
                    "secondary": "#7c3aed", // Violet 600
                    "secondary-content": "#ffffff",
                    "accent": "#06b6d4",
                    "accent-content": "#ffffff",
                    "neutral": "#f1f5f9", // Slate 100
                    "neutral-content": "#1e293b", // Slate 800
                    "base-100": "#ffffff",
                    "base-200": "#f8fafc", // Slate 50
                    "base-300": "#e2e8f0", // Slate 200
                    "base-content": "#0f172a", // Slate 900

                    "--rounded-box": "1rem",
                    "--rounded-btn": "0.5rem",
                    "--rounded-badge": "1.9rem",
                    "--animation-btn": "0.25s",
                    "--animation-input": "0.2s",
                    "--btn-focus-scale": "0.95",
                    "--border-btn": "1px",
                    "--tab-border": "1px",
                    "--tab-radius": "0.5rem",
                },
                dark: {
                    ...require("daisyui/src/theming/themes")["dark"],
                    "primary": "#4f46e5", // Indigo 600 - slightly deeper/richer
                    "primary-content": "#ffffff",
                    "secondary": "#7c3aed", // Violet 600
                    "secondary-content": "#ffffff",
                    "accent": "#06b6d4", // Cyan 500
                    "accent-content": "#ffffff",
                    "neutral": "#1e293b", // Slate 800
                    "neutral-content": "#cbd5e1",
                    "base-100": "#0b1120", // Very deep slate/blue for a premium dark background
                    "base-200": "#161f32", // Slightly lighter
                    "base-300": "#1e293b", // Creating depth
                    "base-content": "#e2e8f0", // Slate 200
                    "info": "#3abff8",
                    "success": "#36d399",
                    "warning": "#fbbd23",
                    "error": "#f87171",

                    "--rounded-box": "1rem",
                    "--rounded-btn": "0.5rem",
                    "--rounded-badge": "1.9rem",
                    "--animation-btn": "0.25s",
                    "--animation-input": "0.2s",
                    "--btn-focus-scale": "0.95",
                    "--border-btn": "1px",
                    "--tab-border": "1px",
                    "--tab-radius": "0.5rem",
                },
            },
            "dark", // Fallback
        ],
    },
}
