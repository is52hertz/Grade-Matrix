import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import JSZip from 'jszip';
import { useResource } from '../context/ResourceContext';
import {
    PRIMARY_FONT_URL,
    FALLBACK_FONT_URL,
    FONT_FAMILY_NAME,
    TARGET_FILE_IN_ZIP
} from '../fontConfig';

const MAX_RETRIES = 5; // 降低重试次数，避免死循环

export const useFontLoader = () => {
    const { i18n, t } = useTranslation();
    const { registerDownload, isAutoDetect } = useResource();

    const isProcessing = useRef(false);
    const hasLoadedSuccessfully = useRef(false);

    useEffect(() => {
        if (!i18n || !i18n.language) return;

        // 延时 1s 启动，避开 React 严格模式的双重挂载
        const timer = setTimeout(() => {
            runLoader();
        }, 1000);

        const runLoader = async () => {
            const currentLang = i18n.language;
            const needsFont = currentLang.startsWith('zh') && isAutoDetect;
            const failCount = parseInt(localStorage.getItem('font_fail_count') || '0');

            if (!needsFont || hasLoadedSuccessfully.current || isProcessing.current) return;
            if (failCount >= MAX_RETRIES) {
                console.warn(`[FontLoader] Retry limit (${MAX_RETRIES}) reached.`);
                return;
            }

            isProcessing.current = true;
            let fontBuffer = null;

            // 辅助：数据预处理
            const processData = async (data, url) => {
                if (!data) return null;
                if (url.toLowerCase().includes('.zip')) {
                    try {
                        const zip = await JSZip.loadAsync(data);
                        let file = zip.file(TARGET_FILE_IN_ZIP);
                        if (!file) {
                            const found = Object.keys(zip.files).find(p => p.includes('sarasa') && (p.includes('.ttf') || p.includes('.otf')));
                            if (found) file = zip.file(found);
                        }
                        if (file) return await file.async("arraybuffer");
                    } catch (e) {
                        console.error("Unzip error:", e);
                        return null;
                    }
                }
                return data;
            };

            // 辅助：下载包装器 (带 URL 校验)
            const attemptDownload = async (id, url, label) => {
                // 核心修复：如果 URL 无效，直接返回 null，不触发 Axios
                if (!url || url.trim() === "" || url === "/") return null;

                // 加上时间戳防止缓存死锁
                const safeUrl = url + (url.includes('?') ? '&' : '?') + "t=" + Date.now();
                return await registerDownload(id, safeUrl, label);
            };

            try {
                console.log(`[FontLoader] Start (Attempt ${failCount + 1})...`);

                // 1. 尝试主源
                fontBuffer = await attemptDownload('font_main', PRIMARY_FONT_URL, t('download.task_font_primary'));
                if (fontBuffer) fontBuffer = await processData(fontBuffer, PRIMARY_FONT_URL);

                // 2. 尝试备选 (如果主源失败或未配置)
                if (!fontBuffer) {
                    if (PRIMARY_FONT_URL) console.warn("[FontLoader] Primary failed/empty, trying fallback...");
                    fontBuffer = await attemptDownload('font_alt', FALLBACK_FONT_URL, t('download.task_font_fallback'));
                    if (fontBuffer) fontBuffer = await processData(fontBuffer, FALLBACK_FONT_URL);
                }

                // 3. 注入
                if (fontBuffer) {
                    const fontFace = new FontFace(FONT_FAMILY_NAME, fontBuffer);
                    await fontFace.load();
                    document.fonts.add(fontFace);
                    document.documentElement.style.setProperty('--font-mono', `"${FONT_FAMILY_NAME}", monospace`);

                    console.log(`[FontLoader] SUCCESS: ${FONT_FAMILY_NAME}`);
                    hasLoadedSuccessfully.current = true;
                    localStorage.setItem('font_fail_count', '0'); // 清零
                } else {
                    throw new Error("No buffer received");
                }

            } catch (e) {
                console.error("[FontLoader] Failed:", e);
                localStorage.setItem('font_fail_count', (failCount + 1).toString());
            } finally {
                isProcessing.current = false;
            }
        };

        return () => clearTimeout(timer);
    }, [i18n.language, registerDownload, isAutoDetect]);
};
