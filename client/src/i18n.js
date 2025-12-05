import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            nav: {
                dashboard: "[DASHBOARD]",
                import: "[IMPORT]",
                config: "[sys_CONFIG]"
            },
            dashboard: {
                // 恢复 Cyberpunk 风格
                label_phase: "CURRENT_PHASE",
                phase_discovery: "DISCOVERY_PROTO (G10)",
                phase_focus: "FOCUS_MODE (G11/12)",
                label_score: "LATEST_SCORE",
                label_exams: "LOGS_COUNT",
                label_attn: "ATTENTION_REQUIRED",
                sub_volatility: "High Variance Detected",

                title_timeline: "01. MAIN_SEQUENCE",
                sub_timeline: "Correlation: Absolute Score vs Relative Rank",

                title_shortstave: "02. SHORT_STAVE_DETECTOR",
                sub_shortstave: "Delta analysis against Grade Mean",

                title_radar: "03. CAPABILITY_RADAR",
                sub_radar: "Normalized Proficiency Metrics",

                title_selection: "04. SELECTION_AI",
                sub_selection: "Optimal Combination Prediction",

                title_volatility: "04. VOLATILITY_INDEX",
                sub_volatility_chart: "Bubble Size = Std.Dev (Instability)",

                title_matrix: "05. DATA_MATRIX",
                sub_matrix: "Raw Performance Logs",

                table_subject: "SUBJECT",
                table_avg: "AVG",
                table_std: "STD_DEV",
                table_status: "STATUS",
                status_stable: "STABLE",
                status_unstable: "VOLATILE"
            },
            config: {
                title: "SYSTEM_CONFIGURATION",
                subtitle: "Global Preferences & Kernel Parameters",
                sec_ui: "INTERFACE_VISUALS",
                sec_privacy: "PRIVACY_SECURITY",
                lang_auto: "AUTO_RESOURCE_DETECT",
                lang_current: "DISPLAY_LANGUAGE",
                mode_perf: "PERFORMANCE_MODE",
                mode_perf_desc: "Disable WebGL Particles (Low Power)",
                mode_privacy: "PRIVACY_MASK",
                mode_privacy_desc: "Obfuscate numeric values (***)",
                btn_clear_data: "PURGE_ALL_DATA",
                btn_export: "EXPORT_SNAPSHOT (.JSON)"
            }
        }
    },
    zh: {
        translation: {
            nav: {
                dashboard: "[仪表盘]",
                import: "[数据录入]",
                config: "[系统配置]"
            },
            dashboard: {
                label_phase: "当前阶段",
                phase_discovery: "探索阶段 (高一)",
                phase_focus: "聚焦阶段 (高二/三)",
                label_score: "最新总分",
                label_exams: "考试记录",
                label_attn: "重点关注",
                sub_volatility: "波动异常",
                title_timeline: "01. 核心趋势 (Main Sequence)",
                sub_timeline: "左轴：绝对分值 | 右轴：年级排名",
                title_shortstave: "02. 木桶效应分析",
                sub_shortstave: "与年级平均分的差距",
                title_radar: "03. 学科能力雷达",
                sub_radar: "学科掌握度 (归一化)",
                title_selection: "04. 选科智能推荐",
                sub_selection: "基于数据的最佳组合",
                title_volatility: "04. 稳定性指数",
                sub_volatility_chart: "气泡大小 = 不稳定性",
                title_matrix: "05. 数据矩阵",
                sub_matrix: "详细数据日志",
                table_subject: "科目",
                table_avg: "平均分",
                table_std: "标准差",
                table_status: "状态",
                status_stable: "稳定",
                status_unstable: "波动"
            },
            config: {
                title: "系统配置中心",
                subtitle: "全局偏好设置与内核参数",
                sec_ui: "界面与视觉",
                sec_privacy: "隐私与安全",
                lang_auto: "资源自动检测",
                lang_current: "显示语言",
                mode_perf: "性能模式",
                mode_perf_desc: "关闭 3D 粒子背景 (省电)",
                mode_privacy: "隐私遮罩",
                mode_privacy_desc: "隐藏具体分数 (***) 仅显示趋势",
                btn_clear_data: "清除所有数据",
                btn_export: "导出数据快照 (.JSON)"
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        debug: false,
        interpolation: { escapeValue: false },
        detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] }
    });

export default i18n;