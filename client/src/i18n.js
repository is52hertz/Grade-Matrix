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
            app: {
                brand: "GRADE_MATRIX"
            },
            layout: {
                drag_resize: "Drag to Resize"
            },
            import: {
                placeholder: "[IMPORT MODULE PLACEHOLDER]"
            },
            download: {
                system_update: "SYSTEM_UPDATE",
                receiving: "RECEIVING...",
                speed_connecting: "CONNECTING...",
                speed_calculating: "CALCULATING...",
                speed_done: "DONE",
                speed_failed: "FAILED",
                task_font_primary: "FONT_PACK: PRIMARY_SOURCE",
                task_font_fallback: "FONT_PACK: FALLBACK_SOURCE",
                task_font_debug: "DEBUG: {{name}}"
            },
            dashboard: {
                // 恢复 Cyberpunk 风格
                loading: "dev>> INITIALIZING_MODULES...",
                error_prefix: "SYSTEM ERROR",
                na: "N/A",
                tooltip_projection: "Projection (Grade 10)",
                tag_projected: "PROJECTED",
                axis_score: "Score",
                axis_rank: "Rank",
                sub_score_max: "/ {{max}} Max",
                err_api: "API Error: {{status}}",
                err_invalid_data: "Data format invalid",
                err_fetch: "Fetch Error: {{message}}",
                metric_totalScore: "Total Score",
                metric_gradeRank: "Grade Rank",
                metric_subject: "Subject",
                metric_gap: "Gap",
                metric_value: "Value",
                metric_mean: "Mean",
                metric_stdDev: "Std.Dev",

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
                sec_dashboard: "DASHBOARD_MODULES",
                lang_auto: "AUTO_RESOURCE_DETECT",
                lang_auto_desc: "Download 'Sarasa Gothic' for Chinese UI",
                lang_current: "DISPLAY_LANGUAGE",
                lang_current_desc: "Current: {{lng}}",
                lang_en: "ENGLISH",
                lang_zh: "中文 (CN)",
                mode_perf: "PERFORMANCE_MODE",
                mode_perf_desc: "Disable WebGL Particles (Low Power)",
                mode_privacy: "PRIVACY_MASK",
                mode_privacy_desc: "Obfuscate numeric values (***)",
                alert_no_font_url: "No font URL configured!",
                btn_force_redownload: "[DEBUG] Force Re-download (ZIP/TTF)",

                dash_overview: "OVERVIEW_PANEL",
                dash_overview_desc: "Top summary cards",
                dash_mainsequence: "MAIN_SEQUENCE",
                dash_mainsequence_desc: "Score vs Rank timeline",
                dash_shortstave: "SHORT_STAVE",
                dash_shortstave_desc: "Gap analysis bars",
                dash_radar: "CAPABILITY_RADAR",
                dash_radar_desc: "Radar proficiency map",
                dash_selection: "SELECTION_AI",
                dash_selection_desc: "Grade 10 only",
                dash_volatility: "VOLATILITY_INDEX",
                dash_volatility_desc: "Grade 11/12 only",
                dash_matrix: "DATA_MATRIX",
                dash_matrix_desc: "Raw performance table",

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
            app: {
                brand: "GRADE_MATRIX"
            },
            layout: {
                drag_resize: "拖动调整宽度"
            },
            import: {
                placeholder: "[导入模块占位]"
            },
            download: {
                system_update: "系统更新",
                receiving: "接收中...",
                speed_connecting: "连接中...",
                speed_calculating: "计算中...",
                speed_done: "完成",
                speed_failed: "失败",
                task_font_primary: "字体包：主源",
                task_font_fallback: "字体包：备选源",
                task_font_debug: "调试：{{name}}"
            },
            dashboard: {
                loading: "dev>> 模块初始化...",
                error_prefix: "系统错误",
                na: "N/A",
                tooltip_projection: "预测 (高一)",
                tag_projected: "预测",
                axis_score: "分数",
                axis_rank: "排名",
                sub_score_max: "/ {{max}} 满分",
                err_api: "接口错误：{{status}}",
                err_invalid_data: "数据格式异常",
                err_fetch: "请求失败：{{message}}",
                metric_totalScore: "总分",
                metric_gradeRank: "年级排名",
                metric_subject: "科目",
                metric_gap: "差值",
                metric_value: "数值",
                metric_mean: "平均分",
                metric_stdDev: "标准差",

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
                sec_dashboard: "仪表盘组件显示",
                lang_auto: "资源自动检测",
                lang_auto_desc: "下载 'Sarasa Gothic' 以支持中文界面",
                lang_current: "显示语言",
                lang_current_desc: "当前：{{lng}}",
                lang_en: "ENGLISH",
                lang_zh: "中文 (CN)",
                mode_perf: "性能模式",
                mode_perf_desc: "关闭 3D 粒子背景 (省电)",
                mode_privacy: "隐私遮罩",
                mode_privacy_desc: "隐藏具体分数 (***) 仅显示趋势",
                alert_no_font_url: "未配置字体下载地址！",
                btn_force_redownload: "[调试] 强制重新下载 (ZIP/TTF)",

                dash_overview: "顶部概览",
                dash_overview_desc: "摘要统计卡片",
                dash_mainsequence: "核心趋势 (Main Sequence)",
                dash_mainsequence_desc: "总分与排名双轴趋势图",
                dash_shortstave: "木桶效应分析 (Short Stave)",
                dash_shortstave_desc: "与年级均值差距条形图",
                dash_radar: "学科能力雷达",
                dash_radar_desc: "学科能力归一化雷达图",
                dash_selection: "选科智能推荐",
                dash_selection_desc: "仅探索阶段 (高一) 显示",
                dash_volatility: "稳定性指数",
                dash_volatility_desc: "仅聚焦阶段 (高二/高三) 显示",
                dash_matrix: "数据矩阵",
                dash_matrix_desc: "详细数据日志表格",

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
