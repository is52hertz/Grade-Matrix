/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                background: "#000000",
                foreground: "#ffffff",
                surface: "#111111",
                border: "#333333",
                "muted-fg": "#888888",
            },
            fontFamily: {
                // 修正：移除 Sans-serif 字体，确保纯正的等宽体验
                // 如果想让中文好看，我们依赖异步加载的 'Sarasa Term SC'，而不是强制回退到微软雅黑
                mono: [
                    '"JetBrains Mono"',
                    '"Fira Code"',
                    '"Sarasa Term SC"', // 只有下载完成后，这个才会生效
                    'Consolas',
                    'Monaco',
                    'monospace' // 兜底必须是系统等宽
                ],
                sans: ['"Inter"', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        },
    },
    plugins: [],
}