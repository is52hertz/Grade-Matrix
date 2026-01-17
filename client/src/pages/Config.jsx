import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import JSZip from 'jszip'; // <--- 新增引入
import { useResource } from '../context/ResourceContext';
import { useConfig } from '../context/ConfigContext';
import { PRIMARY_FONT_URL, FALLBACK_FONT_URL, FONT_FAMILY_NAME, TARGET_FILE_IN_ZIP } from '../fontConfig';

const SectionHeader = ({ title }) => (
    <div className="mb-4 border-b border-border pb-2 mt-8">
        <h2 className="text-sm font-bold text-muted-fg tracking-widest uppercase flex items-center gap-2">
            <span className="w-1 h-1 bg-muted-fg inline-block"/> {title}
        </h2>
    </div>
);

const Toggle = ({ active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-12 h-6 border flex items-center p-1 transition-all ${active ? 'border-white bg-white justify-end' : 'border-border bg-transparent justify-start'}`}
    >
        <motion.div
            layout
            transition={{ type: 'spring', stiffness: 600, damping: 35 }}
            className={`w-4 h-4 shadow-sm ${active ? 'bg-black' : 'bg-muted-fg'}`}
        />
    </button>
);

const LangOption = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 border text-sm font-mono transition-all ${
            active ? 'bg-white text-black border-white hover:text-black' : 'bg-transparent text-muted-fg border-border hover:border-white hover:text-white'
        }`}
    >
        {label}
    </button>
);

const Config = () => {
    const { t, i18n } = useTranslation();
    const { isAutoDetect, toggleAutoDetect, registerDownload } = useResource();
    const { privacyMode, togglePrivacy, perfMode, togglePerf, dashboardModules, toggleDashboardModule } = useConfig();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('i18nextLng', lng);
    };

    // 升级版的 Debug 下载，支持 ZIP 解压
    const forceRedownload = async () => {
        const targetUrl = PRIMARY_FONT_URL || FALLBACK_FONT_URL;
        if (!targetUrl) {
            alert("No font URL configured!");
            return;
        }

        // 加时间戳绕过缓存
        const cacheBustedUrl = targetUrl + (targetUrl.includes('?') ? '&' : '?') + "debug=" + Date.now();

        console.log("[Config] Debugging download:", cacheBustedUrl);

        const buffer = await registerDownload(
            'font_debug_force',
            cacheBustedUrl,
            `DEBUG: ${FONT_FAMILY_NAME}`
        );

        if (buffer) {
            let fontBuffer = buffer;

            // 如果是 ZIP，尝试解压
            if (targetUrl.toLowerCase().endsWith('.zip')) {
                try {
                    console.log("[Config] ZIP detected, extracting...");
                    const zip = await JSZip.loadAsync(buffer);
                    let file = zip.file(TARGET_FILE_IN_ZIP);

                    if (!file) {
                        // 模糊搜索
                        const foundPath = Object.keys(zip.files).find(path => path.includes('sarasa-term-sc-regular.ttf'));
                        if (foundPath) file = zip.file(foundPath);
                    }

                    if (file) {
                        fontBuffer = await file.async("arraybuffer");
                        console.log("[Config] Extracted successfully.");
                    } else {
                        console.error("[Config] Target file not found in ZIP.");
                        return;
                    }
                } catch (e) {
                    console.error("[Config] Unzip failed:", e);
                    return;
                }
            }

            // 注入字体
            try {
                const fontFace = new FontFace(FONT_FAMILY_NAME, fontBuffer);
                await fontFace.load();
                document.fonts.add(fontFace);
                document.documentElement.style.setProperty('--font-mono', `"${FONT_FAMILY_NAME}", monospace`);
                console.log("[Config] Font injected.");
            } catch (e) {
                console.error("[Config] Font load failed:", e);
            }
        }
    };

    return (
        <div className="max-w-3xl mx-auto pb-20 animate-fade-in">
            <div className="mb-10">
                <h1 className="text-3xl font-bold font-mono text-white tracking-tighter">{t('config.title')}</h1>
                <p className="text-muted-fg font-mono mt-2 text-sm">// {t('config.subtitle')}</p>
            </div>

            <SectionHeader title={t('config.sec_ui')} />
            <div className="bg-surface border border-border p-6 space-y-6">

                <div className="flex justify-between items-center border-b border-border pb-6">
                    <div>
                        <div className="text-white font-bold">{t('config.lang_auto')}</div>
                        <div className="text-xs text-muted-fg mt-1">Download 'Sarasa Gothic' for Chinese UI</div>
                    </div>
                    <Toggle active={isAutoDetect} onClick={toggleAutoDetect} />
                </div>

                <div className="flex justify-between items-center border-b border-border pb-6">
                    <div>
                        <div className="text-white font-bold">{t('config.lang_current')}</div>
                        <div className="text-xs text-muted-fg mt-1">Current: {i18n.language}</div>
                    </div>
                    <div className="flex gap-2">
                        <LangOption label="ENGLISH" active={i18n.language.startsWith('en')} onClick={() => changeLanguage('en')} />
                        <LangOption label="中文 (CN)" active={i18n.language.startsWith('zh')} onClick={() => changeLanguage('zh')} />
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div>
                        <div className="text-white font-bold">{t('config.mode_perf')}</div>
                        <div className="text-xs text-muted-fg mt-1">{t('config.mode_perf_desc')}</div>
                    </div>
                    <Toggle active={perfMode} onClick={togglePerf} />
                </div>

                {/* 仅在中文模式下显示调试按钮 */}
                {i18n.language.startsWith('zh') && (
                    <div className="mt-2 flex justify-end">
                        <button onClick={forceRedownload} className="text-xs text-muted-fg hover:text-white underline font-mono">
                            [DEBUG] Force Re-download (ZIP/TTF)
                        </button>
                    </div>
                )}
            </div>

            <SectionHeader title={t('config.sec_dashboard')} />
            <div className="bg-surface border border-border p-6 space-y-6">

                <div className="flex justify-between items-center border-b border-border pb-6">
                    <div>
                        <div className="text-white font-bold">{t('config.dash_overview')}</div>
                        <div className="text-xs text-muted-fg mt-1">{t('config.dash_overview_desc')}</div>
                    </div>
                    <Toggle active={dashboardModules.overview} onClick={() => toggleDashboardModule('overview')} />
                </div>

                <div className="flex justify-between items-center border-b border-border pb-6">
                    <div>
                        <div className="text-white font-bold">{t('config.dash_mainsequence')}</div>
                        <div className="text-xs text-muted-fg mt-1">{t('config.dash_mainsequence_desc')}</div>
                    </div>
                    <Toggle active={dashboardModules.mainSequence} onClick={() => toggleDashboardModule('mainSequence')} />
                </div>

                <div className="flex justify-between items-center border-b border-border pb-6">
                    <div>
                        <div className="text-white font-bold">{t('config.dash_shortstave')}</div>
                        <div className="text-xs text-muted-fg mt-1">{t('config.dash_shortstave_desc')}</div>
                    </div>
                    <Toggle active={dashboardModules.shortStave} onClick={() => toggleDashboardModule('shortStave')} />
                </div>

                <div className="flex justify-between items-center border-b border-border pb-6">
                    <div>
                        <div className="text-white font-bold">{t('config.dash_radar')}</div>
                        <div className="text-xs text-muted-fg mt-1">{t('config.dash_radar_desc')}</div>
                    </div>
                    <Toggle active={dashboardModules.radar} onClick={() => toggleDashboardModule('radar')} />
                </div>

                <div className="flex justify-between items-center border-b border-border pb-6">
                    <div>
                        <div className="text-white font-bold">{t('config.dash_selection')}</div>
                        <div className="text-xs text-muted-fg mt-1">{t('config.dash_selection_desc')}</div>
                    </div>
                    <Toggle active={dashboardModules.selectionAI} onClick={() => toggleDashboardModule('selectionAI')} />
                </div>

                <div className="flex justify-between items-center border-b border-border pb-6">
                    <div>
                        <div className="text-white font-bold">{t('config.dash_volatility')}</div>
                        <div className="text-xs text-muted-fg mt-1">{t('config.dash_volatility_desc')}</div>
                    </div>
                    <Toggle active={dashboardModules.volatilityIndex} onClick={() => toggleDashboardModule('volatilityIndex')} />
                </div>

                <div className="flex justify-between items-center">
                    <div>
                        <div className="text-white font-bold">{t('config.dash_matrix')}</div>
                        <div className="text-xs text-muted-fg mt-1">{t('config.dash_matrix_desc')}</div>
                    </div>
                    <Toggle active={dashboardModules.dataMatrix} onClick={() => toggleDashboardModule('dataMatrix')} />
                </div>
            </div>

            <SectionHeader title={t('config.sec_privacy')} />
            <div className="bg-surface border border-border p-6 space-y-6">

                <div className="flex justify-between items-center border-b border-border pb-6">
                    <div>
                        <div className="text-white font-bold">{t('config.mode_privacy')}</div>
                        <div className="text-xs text-muted-fg mt-1">{t('config.mode_privacy_desc')}</div>
                    </div>
                    <Toggle active={privacyMode} onClick={togglePrivacy} />
                </div>

                <div className="flex gap-4">
                    <button className="flex-1 py-3 border border-border text-muted-fg hover:text-white hover:border-white transition-colors text-sm font-bold">
                        {t('config.btn_export')}
                    </button>
                    <button className="flex-1 py-3 border border-red-900/50 text-red-500 hover:bg-red-900/20 transition-colors text-sm font-bold">
                        {t('config.btn_clear_data')}
                    </button>
                </div>
            </div>
        </div>
    );
};
export default Config;
