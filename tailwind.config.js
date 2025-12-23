/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                "primary": "#6366f2",
                "primary-hover": "#4f51c0",
                "primary-light": "#8b8df5",
                "background-dark": "#020617", // Slate-950
                "surface-dark": "#0f172a", // Slate-900
                "surface-light": "#1e293b", // Slate-800
                "surface-lighter": "#334155", // Slate-700
                "glass": "rgba(15, 23, 42, 0.7)",
                "glass-border": "rgba(255, 255, 255, 0.08)",
                "text-main": "#e2e8f0",
                "text-muted": "#94a3b8"
            },
            fontFamily: {
                "display": ["Manrope", "sans-serif"],
                "mono": ["Space Mono", "monospace"],
                "serif": ["Cormorant Garamond", "serif"],
            },
            backgroundImage: {
                'grid-pattern': "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        },
    },
    plugins: [],
}
