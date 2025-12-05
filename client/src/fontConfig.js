/**
 * 字体资源配置文件
 * ========================================================
 */

// 1. 【首选源】: 你的 GitHub Release ZIP 直链
// 请确保上传的是 SarasaTermSC-TTF-1.0.35.zip
export const PRIMARY_FONT_URL = "https://is52hertz.cn";

// 2. 【备选源】: 稳定直链 (.ttf)
export const FALLBACK_FONT_URL = "https://cdn.statically.io/gh/is52hertz/Sarasa-Gothic/main/SarasaTermSC-Bold.ttf";

// 3. 字体名称配置 (CSS font-family)
// 必须与 tailwind.config.js 里的 "Sarasa Term SC" 完全一致
export const FONT_FAMILY_NAME = "Sarasa Term SC";

// 4. ZIP 包内的目标文件名
// SarasaTermSC-TTF-1.0.35.zip 解压后，里面会有 sarasa-term-sc-regular.ttf
export const TARGET_FILE_IN_ZIP = "sarasa-term-sc-regular.ttf";