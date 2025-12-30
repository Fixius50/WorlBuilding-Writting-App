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
                "primary": "#6366f1",
                "primary-hover": "#4f51e0",
                "primary-light": "#8b8df8",
                "background-dark": "#09090b", // Void Dark
                "surface-dark": "#121214",
                "surface-light": "#1e1e21",
                "surface-lighter": "#2a2a2e",
                "accent-emerald": "#10b981",
                "glass": "rgba(9, 9, 11, 0.6)",
                "glass-border": "rgba(255, 255, 255, 0.05)",
                "text-main": "#fafafa",
                "text-muted": "#a1a1aa"
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
