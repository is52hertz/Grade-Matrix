import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useConfig } from '../context/ConfigContext';
import {
    ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, Radar, ReferenceLine,
    BarChart, Cell, ScatterChart, Scatter, ZAxis
} from 'recharts';

// --- 动画容器组件 (封装动画逻辑) ---
const AnimatedSection = ({ children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="w-full"
    >
        {children}
    </motion.div>
);

const SectionHeader = ({ title, sub }) => (
    <div className="mb-6 border-b border-border pb-2 mt-8">
        <h2 className="text-lg font-bold text-white tracking-widest uppercase flex items-center gap-2">
            <span className="w-2 h-2 bg-white inline-block"/> {title}
        </h2>
        {sub && <p className="text-xs text-muted-fg mt-1 font-mono">{sub}</p>}
    </div>
);

const StatCard = ({ label, value, sub, highlight }) => (
    <motion.div
        whileHover={{ y: -2 }}
        className={`bg-surface border p-4 transition-colors ${highlight ? 'border-white bg-white/5' : 'border-border hover:border-white'}`}
    >
        <div className="text-xs text-muted-fg uppercase mb-1">{label}</div>
        <div className="text-2xl font-bold font-mono">{value}</div>
        {sub && <div className="text-xs text-white/50 mt-1">{sub}</div>}
    </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-black border border-white p-3 text-xs font-mono shadow-2xl z-50 min-w-[150px]">
                <p className="text-white mb-2 border-b border-white/20 pb-1 font-bold">{data.name}</p>
                {data.isVirtual && <p className="text-muted-fg mb-2 border-l-2 border-white pl-2 italic">Projection (Grade 10)</p>}
                {payload.map((entry, index) => (
                    <div key={index} className="flex justify-between gap-4 mb-1" style={{ color: entry.color || '#fff' }}>
                        <span>{entry.name}:</span>
                        <span className="font-bold">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const Dashboard = () => {
    const { t } = useTranslation();
    const { privacyMode, dashboardModules } = useConfig();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 隐私模式过滤器
    const f = (val) => privacyMode ? '***' : val;

    useEffect(() => {
        fetch('http://localhost:5000/api/dashboard')
            .then(res => {
                if (!res.ok) throw new Error(`API Error: ${res.status}`);
                return res.json();
            })
            .then(d => {
                if (!d.analysis) throw new Error("Data format invalid");
                setData(d.analysis);
                setLoading(false);
            })
            .catch(err => {
                console.error("Fetch Error:", err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-20 text-center font-mono text-muted-fg animate-pulse">{"dev>> INITIALIZING_MODULES..."}</div>;
    if (error) return <div className="p-20 text-center text-red-500 font-mono">SYSTEM ERROR: {error}</div>;
    if (!data) return null;

    const { charts, overview } = data;
    const isGrade10 = overview.phase.includes('DISCOVERY');
    const showRadar = dashboardModules?.radar;
    const showSelection = isGrade10 && dashboardModules?.selectionAI;
    const showVolatility = !isGrade10 && dashboardModules?.volatilityIndex;
    const showRightModule = showSelection || showVolatility;
    const showGrid = showRadar || showRightModule;

    return (
        <div className="pb-20">

            {/* 顶部概览 */}
            {dashboardModules?.overview && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                >
                    <StatCard label={t('dashboard.label_phase')} value={isGrade10 ? t('dashboard.phase_discovery') : t('dashboard.phase_focus')} highlight />
                    <StatCard label={t('dashboard.label_score')} value={f(overview.latestTotal)} sub={`/ ${overview.maxPossible} Max`} />
                    <StatCard label={t('dashboard.label_exams')} value={overview.examCount} />
                    <StatCard label={t('dashboard.label_attn')} value={overview.mostUnstable || 'N/A'} sub={t('dashboard.sub_volatility')} />
                </motion.div>
            )}

            {/* 1. Main Sequence (恢复双轴 + 动画) */}
            {dashboardModules?.mainSequence && (
                <AnimatedSection delay={0.1}>
                    <SectionHeader title={t('dashboard.title_timeline')} sub={t('dashboard.sub_timeline')} />
                    <div className="h-80 w-full border border-border bg-surface/50 p-4 relative">
                        <ResponsiveContainer>
                            <ComposedChart data={charts.mainSequence}>
                                <XAxis dataKey="name" tick={{fontSize: 10, fill: '#666'}} interval={0} angle={-10} textAnchor="end" />
                                <YAxis yAxisId="left" stroke="#fff" tick={{fontSize: 10}} domain={['auto', 'auto']} label={{ value: 'Score', angle: -90, position: 'insideLeft', fill: '#666', fontSize: 10 }} />
                                <YAxis yAxisId="right" orientation="right" stroke="#666" reversed tick={{fontSize: 10}} domain={['auto', 'auto']} label={{ value: 'Rank', angle: 90, position: 'insideRight', fill: '#666', fontSize: 10 }} />
                                <Tooltip content={<CustomTooltip />} />
                                {charts.mainSequence.some(d => d.isVirtual) && (
                                    <ReferenceLine x={charts.mainSequence.find(d => !d.isVirtual)?.name} stroke="#333" strokeDasharray="3 3" />
                                )}
                                <Line yAxisId="left" type="monotone" dataKey="totalScore" stroke="#fff" strokeWidth={2}
                                      dot={(props) => <circle cx={props.cx} cy={props.cy} r={4} stroke={props.payload.isVirtual ? "#666" : "#fff"} strokeWidth={2} fill={props.payload.isVirtual ? "#000" : "#fff"} />}
                                />
                                <Line yAxisId="right" type="monotone" dataKey="gradeRank" stroke="#666" strokeWidth={1} strokeDasharray="4 4" dot={{r:2, fill:'#000', stroke:'#666'}} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </AnimatedSection>
            )}

            {/* 2. Short Stave */}
            {dashboardModules?.shortStave && (
                <AnimatedSection delay={0.2}>
                    <SectionHeader title={t('dashboard.title_shortstave')} sub={t('dashboard.sub_shortstave')} />
                    <div className="h-64 w-full border border-border bg-surface/50 p-4">
                        <ResponsiveContainer>
                            <BarChart data={charts.shortStave} layout="vertical" margin={{left: 40, right: 20}}>
                                <XAxis type="number" stroke="#666" tick={{fontSize: 10}} />
                                <YAxis dataKey="subject" type="category" stroke="#fff" tick={{fontSize: 10}} width={60} />
                                <Tooltip content={<CustomTooltip />} />
                                <ReferenceLine x={0} stroke="#444" />
                                <Bar dataKey="gap" barSize={15}>
                                    {charts.shortStave.map((entry, index) => <Cell key={index} fill={entry.gap > 0 ? '#fff' : '#333'} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </AnimatedSection>
            )}

            {showGrid && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
                    {/* 3. Radar */}
                    {showRadar && (
                        <AnimatedSection delay={0.3}>
                            <SectionHeader title={t('dashboard.title_radar')} sub={t('dashboard.sub_radar')} />
                            <div className="h-72 border border-border bg-surface/50">
                                <ResponsiveContainer>
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={charts.radar}>
                                        <PolarGrid stroke="#333" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} />
                                        <Radar dataKey="value" stroke="#fff" fill="#fff" fillOpacity={0.2} />
                                        <Tooltip content={<CustomTooltip />} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </AnimatedSection>
                    )}

                    {/* 4. Selection / Volatility */}
                    {showRightModule && (
                        <AnimatedSection delay={0.4}>
                            {isGrade10 ? (
                                <>
                                    <SectionHeader title={t('dashboard.title_selection')} sub={t('dashboard.sub_selection')} />
                                    <div className="h-72 space-y-2 overflow-y-auto custom-scrollbar">
                                        {charts.suggestions.map((sug, i) => (
                                            <div key={i} className="bg-surface border border-border p-4 flex justify-between items-center group hover:border-white transition-all cursor-pointer">
                                                <div>
                                                    <div className="text-base font-bold text-white group-hover:text-gray-300">#{i+1} {sug.name}</div>
                                                    <div className="text-xs text-muted-fg mt-1 flex gap-2">
                                                        {sug.subjects.map(sub => <span key={sub} className="bg-white/10 px-1 text-[10px]">{sub}</span>)}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xl font-mono font-bold">{Math.round(sug.total)}</div>
                                                    <div className="text-[10px] text-muted-fg">PROJECTED</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <SectionHeader title={t('dashboard.title_volatility')} sub={t('dashboard.sub_volatility_chart')} />
                                    <div className="h-72 border border-border bg-surface/50 p-4">
                                        <ResponsiveContainer>
                                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                                <XAxis dataKey="mean" type="number" stroke="#666" tick={{fontSize: 10}} domain={[0, 150]} />
                                                <YAxis dataKey="subject" type="category" stroke="#fff" tick={{fontSize: 10}} width={60} />
                                                <ZAxis dataKey="stdDev" range={[50, 400]} />
                                                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                                                <Scatter data={charts.volatility} fill="#fff" />
                                            </ScatterChart>
                                        </ResponsiveContainer>
                                    </div>
                                </>
                            )}
                        </AnimatedSection>
                    )}
                </div>
            )}

            {/* 5. Matrix */}
            {dashboardModules?.dataMatrix && (
                <AnimatedSection delay={0.5}>
                    <SectionHeader title={t('dashboard.title_matrix')} sub={t('dashboard.sub_matrix')} />
                    <div className="border border-border overflow-hidden mb-10">
                        <table className="w-full text-left text-xs font-mono">
                            <thead className="bg-white/5 text-white">
                            <tr>
                                <th className="p-3">{t('dashboard.table_subject')}</th>
                                <th className="p-3">{t('dashboard.table_avg')}</th>
                                <th className="p-3">{t('dashboard.table_std')}</th>
                                <th className="p-3 text-right">{t('dashboard.table_status')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {charts.volatility.map((row, i) => (
                                <tr key={i} className="border-t border-border hover:bg-white/5 transition-colors">
                                    <td className="p-3 border-r border-border font-bold text-white">{row.subject}</td>
                                    <td className="p-3 border-r border-border">{f(row.mean)}</td>
                                    <td className="p-3 border-r border-border">{row.stdDev}</td>
                                    <td className="p-3 text-right">
                                        {row.stdDev < 5
                                            ? <span className="text-white border border-white px-1 text-[10px]">{t('dashboard.status_stable')}</span>
                                            : <span className="text-muted-fg border border-border px-1 text-[10px]">{t('dashboard.status_unstable')}</span>}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </AnimatedSection>
            )}

        </div>
    );
};

export default Dashboard;
