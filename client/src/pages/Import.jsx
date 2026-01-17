import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const API_BASE = 'http://localhost:5000';

const MotionDiv = motion.div;

const SUBJECT_PRESETS = [
    { subject: 'Chinese', maxScore: 150 },
    { subject: 'Math', maxScore: 150 },
    { subject: 'English', maxScore: 150 },
    { subject: 'Physics', maxScore: 100 },
    { subject: 'Chemistry', maxScore: 100 },
    { subject: 'Biology', maxScore: 100 },
    { subject: 'Politics', maxScore: 100 },
    { subject: 'History', maxScore: 100 },
    { subject: 'Geography', maxScore: 100 },
];

const DISCOVERY_TEMPLATE = SUBJECT_PRESETS;
const FOCUS_TEMPLATE = SUBJECT_PRESETS.filter(s => ['Chinese', 'Math', 'English', 'Physics', 'Chemistry', 'Biology'].includes(s.subject));

const AnimatedSection = ({ children, delay = 0 }) => (
    <MotionDiv
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay }}
        className="w-full"
    >
        {children}
    </MotionDiv>
);

const TabButton = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 border text-sm font-mono transition-all ${
            active ? 'bg-white text-black border-white hover:text-black' : 'bg-transparent text-muted-fg border-border hover:border-white hover:text-white'
        }`}
    >
        {children}
    </button>
);

const FieldLabel = ({ children }) => (
    <div className="text-xs text-muted-fg uppercase tracking-widest">{children}</div>
);

const TextInput = (props) => (
    <input
        {...props}
        className={`w-full bg-black/40 border border-border px-3 py-2 text-sm font-mono text-white outline-none focus:border-white transition-colors ${props.className || ''}`}
    />
);

const SelectInput = (props) => (
    <select
        {...props}
        className={`w-full bg-black/40 border border-border px-3 py-2 text-sm font-mono text-white outline-none focus:border-white transition-colors ${props.className || ''}`}
    />
);

const NumberInput = (props) => (
    <TextInput {...props} inputMode="decimal" />
);

const toNumberOrUndef = (v) => {
    if (v === null || v === undefined || v === '') return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
};

const toIntOrUndef = (v) => {
    if (v === null || v === undefined || v === '') return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : undefined;
};

const normalizeExamForApi = (raw) => {
    const name = String(raw.name || '').trim();
    if (!name) throw new Error('Exam name is required');

    const type = String(raw.type || '').trim() || 'Mock';
    const date = raw.date ? new Date(raw.date) : new Date();
    if (Number.isNaN(date.getTime())) throw new Error('Exam date is invalid');

    if (!Array.isArray(raw.scores) || raw.scores.length === 0) throw new Error('Scores must be a non-empty array');

    const scores = raw.scores.map((s, i) => {
        const subject = String(s.subject || '').trim();
        if (!subject) throw new Error(`scores[${i}].subject is required`);

        const score = toNumberOrUndef(s.score);
        if (score === undefined) throw new Error(`scores[${i}].score must be a number`);

        const maxScore = toNumberOrUndef(s.maxScore) ?? 100;
        if (!(maxScore > 0)) throw new Error(`scores[${i}].maxScore must be > 0`);

        return {
            subject,
            score,
            maxScore,
            gradeAvgScore: toNumberOrUndef(s.gradeAvgScore),
            classRank: toIntOrUndef(s.classRank),
            gradeRank: toIntOrUndef(s.gradeRank),
        };
    });

    const seen = new Set();
    for (const s of scores) {
        if (seen.has(s.subject)) throw new Error(`Duplicate subject: ${s.subject}`);
        seen.add(s.subject);
    }

    const computedTotal = scores.reduce((acc, cur) => acc + cur.score, 0);

    return {
        name,
        type,
        date: date.toISOString(),
        totalScore: toNumberOrUndef(raw.totalScore) ?? computedTotal,
        classRank: toIntOrUndef(raw.classRank),
        gradeRank: toIntOrUndef(raw.gradeRank),
        scores,
    };
};

const extractExamsFromJson = (parsed) => {
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.exams)) return parsed.exams;
        if (parsed.exam && typeof parsed.exam === 'object') return [parsed.exam];
        if (parsed.name || parsed.scores) return [parsed];
    }
    throw new Error('Payload must be { exams: [...] } or a single exam object');
};

const ImportPage = () => {
    const { t } = useTranslation();
    const [mode, setMode] = useState('json'); // 'json' | 'manual'

    // JSON mode
    const [jsonText, setJsonText] = useState('');
    const [jsonError, setJsonError] = useState('');
    const [jsonPreview, setJsonPreview] = useState(null);
    const [jsonBusy, setJsonBusy] = useState(false);
    const [jsonResult, setJsonResult] = useState(null);

    // Manual mode
    const [exam, setExam] = useState(() => ({
        name: '',
        date: new Date().toISOString().slice(0, 10),
        type: 'Mock',
        totalScore: '',
        classRank: '',
        gradeRank: '',
        scores: DISCOVERY_TEMPLATE.map(s => ({
            subject: s.subject,
            score: '',
            maxScore: String(s.maxScore),
            gradeAvgScore: '',
        })),
    }));
    const [manualError, setManualError] = useState('');
    const [manualBusy, setManualBusy] = useState(false);
    const [manualResult, setManualResult] = useState(null);

    const manualComputedTotal = useMemo(() => {
        return exam.scores.reduce((acc, s) => acc + (toNumberOrUndef(s.score) ?? 0), 0);
    }, [exam.scores]);

    const setTemplate = (template) => {
        setExam(prev => ({
            ...prev,
            scores: template.map(s => ({
                subject: s.subject,
                score: '',
                maxScore: String(s.maxScore),
                gradeAvgScore: '',
            })),
        }));
    };

    const setScoreRow = (idx, patch) => {
        setExam(prev => ({
            ...prev,
            scores: prev.scores.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
        }));
    };

    const addScoreRow = () => {
        setExam(prev => ({
            ...prev,
            scores: [...prev.scores, { subject: '', score: '', maxScore: '100', gradeAvgScore: '' }],
        }));
    };

    const removeScoreRow = (idx) => {
        setExam(prev => ({
            ...prev,
            scores: prev.scores.filter((_, i) => i !== idx),
        }));
    };

    const fillJsonExample = () => {
        const example = {
            exams: [
                {
                    name: t('import.example_exam_name'),
                    date: new Date().toISOString().slice(0, 10),
                    type: 'Mock',
                    gradeRank: 120,
                    classRank: 5,
                    scores: [
                        { subject: 'Chinese', score: 110, maxScore: 150, gradeAvgScore: 98 },
                        { subject: 'Math', score: 125, maxScore: 150, gradeAvgScore: 102 },
                        { subject: 'English', score: 118, maxScore: 150, gradeAvgScore: 96 },
                        { subject: 'Physics', score: 82, maxScore: 100, gradeAvgScore: 70 },
                        { subject: 'Chemistry', score: 76, maxScore: 100, gradeAvgScore: 68 },
                        { subject: 'Biology', score: 71, maxScore: 100, gradeAvgScore: 65 },
                    ],
                },
            ],
        };
        setJsonText(JSON.stringify(example, null, 2));
        setJsonError('');
        setJsonPreview(null);
        setJsonResult(null);
    };

    const parseJson = () => {
        setJsonError('');
        setJsonResult(null);
        setJsonPreview(null);

        try {
            const parsed = JSON.parse(jsonText);
            const examsRaw = extractExamsFromJson(parsed);
            const normalized = examsRaw.map(normalizeExamForApi);
            setJsonPreview({
                examCount: normalized.length,
                subjectsTotal: normalized.reduce((acc, e) => acc + e.scores.length, 0),
                exams: normalized,
            });
        } catch (e) {
            setJsonError(e?.message || String(e));
        }
    };

    const submitJsonImport = async () => {
        setJsonError('');
        setJsonResult(null);
        setJsonBusy(true);
        try {
            const parsed = JSON.parse(jsonText);
            const examsRaw = extractExamsFromJson(parsed);
            const exams = examsRaw.map(normalizeExamForApi);

            const res = await fetch(`${API_BASE}/api/import`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ exams }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

            setJsonResult(data);
            setJsonPreview(null);
        } catch (e) {
            setJsonError(e?.message || String(e));
        } finally {
            setJsonBusy(false);
        }
    };

    const submitManual = async () => {
        setManualError('');
        setManualResult(null);
        setManualBusy(true);
        try {
            const payload = normalizeExamForApi(exam);
            const res = await fetch(`${API_BASE}/api/exam`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

            setManualResult({ id: data?.id, name: data?.name });
        } catch (e) {
            setManualError(e?.message || String(e));
        } finally {
            setManualBusy(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
            <div className="mb-10">
                <h1 className="text-3xl font-bold font-mono text-white tracking-tighter">{t('import.title')}</h1>
                <p className="text-muted-fg font-mono mt-2 text-sm">// {t('import.subtitle')}</p>
            </div>

            <div className="flex gap-2 mb-6">
                <TabButton active={mode === 'json'} onClick={() => setMode('json')}>
                    {t('import.tab_json')}
                </TabButton>
                <TabButton active={mode === 'manual'} onClick={() => setMode('manual')}>
                    {t('import.tab_manual')}
                </TabButton>
            </div>

            {mode === 'json' && (
                <AnimatedSection>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-surface border border-border p-6">
                            <div className="flex items-center justify-between mb-3">
                                <FieldLabel>{t('import.json_title')}</FieldLabel>
                                <button
                                    onClick={fillJsonExample}
                                    className="text-xs font-mono text-muted-fg hover:text-white transition-colors"
                                >
                                    {t('import.btn_example')}
                                </button>
                            </div>
                            <textarea
                                value={jsonText}
                                onChange={(e) => setJsonText(e.target.value)}
                                className="w-full min-h-[320px] bg-black/40 border border-border p-3 text-xs font-mono text-white outline-none focus:border-white transition-colors resize-y"
                                spellCheck={false}
                                placeholder={t('import.json_placeholder')}
                            />

                            {jsonError && (
                                <div className="mt-3 border border-red-900/50 bg-red-900/10 p-3 text-xs font-mono text-red-400">
                                    {jsonError}
                                </div>
                            )}

                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={parseJson}
                                    className="flex-1 py-3 border border-border text-muted-fg hover:text-white hover:border-white transition-colors text-sm font-bold disabled:opacity-50"
                                    disabled={jsonBusy}
                                >
                                    {t('import.btn_parse')}
                                </button>
                                <button
                                    onClick={submitJsonImport}
                                    className="flex-1 py-3 border border-white bg-white text-black hover:bg-white/90 transition-colors text-sm font-bold disabled:opacity-50"
                                    disabled={jsonBusy}
                                >
                                    {jsonBusy ? t('import.btn_importing') : t('import.btn_import')}
                                </button>
                            </div>
                        </div>

                        <div className="bg-surface border border-border p-6">
                            <FieldLabel>{t('import.preview_title')}</FieldLabel>
                            <div className="mt-3 text-xs font-mono text-muted-fg">
                                {t('import.preview_hint')}
                            </div>

                            {jsonPreview && (
                                <div className="mt-4 border border-border bg-black/30 p-4">
                                    <div className="flex justify-between text-xs font-mono">
                                        <span className="text-muted-fg">{t('import.preview_exams')}</span>
                                        <span className="text-white font-bold">{jsonPreview.examCount}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-mono mt-2">
                                        <span className="text-muted-fg">{t('import.preview_subjects')}</span>
                                        <span className="text-white font-bold">{jsonPreview.subjectsTotal}</span>
                                    </div>
                                    <div className="mt-4 border-t border-border pt-3 space-y-2">
                                        {jsonPreview.exams.slice(0, 6).map((e, i) => (
                                            <div key={i} className="flex justify-between text-xs font-mono">
                                                <span className="text-white">{e.name}</span>
                                                <span className="text-muted-fg">{e.scores.length} {t('import.preview_subject_unit')}</span>
                                            </div>
                                        ))}
                                        {jsonPreview.exams.length > 6 && (
                                            <div className="text-[10px] text-muted-fg font-mono">
                                                {t('import.preview_more', { count: jsonPreview.exams.length - 6 })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {jsonResult && (
                                <div className="mt-4 border border-border bg-black/30 p-4">
                                    <div className="text-xs font-mono text-white font-bold">
                                        {t('import.result_ok', { count: jsonResult.created })}
                                    </div>
                                    <div className="text-[10px] font-mono text-muted-fg mt-2">
                                        {t('import.result_hint')}
                                    </div>
                                </div>
                            )}

                            {!jsonPreview && !jsonResult && (
                                <div className="mt-4 border border-border bg-black/30 p-4 text-xs font-mono text-muted-fg">
                                    {t('import.preview_empty')}
                                </div>
                            )}
                        </div>
                    </div>
                </AnimatedSection>
            )}

            {mode === 'manual' && (
                <AnimatedSection>
                    <div className="bg-surface border border-border p-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <FieldLabel>{t('import.manual_title')}</FieldLabel>
                                <div className="text-xs font-mono text-muted-fg mt-2">
                                    {t('import.manual_hint')}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setTemplate(DISCOVERY_TEMPLATE)}
                                    className="px-3 py-2 border border-border text-muted-fg hover:text-white hover:border-white transition-colors text-xs font-bold"
                                >
                                    {t('import.btn_template_discovery')}
                                </button>
                                <button
                                    onClick={() => setTemplate(FOCUS_TEMPLATE)}
                                    className="px-3 py-2 border border-border text-muted-fg hover:text-white hover:border-white transition-colors text-xs font-bold"
                                >
                                    {t('import.btn_template_focus')}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <div>
                                <FieldLabel>{t('import.f_exam_name')}</FieldLabel>
                                <TextInput
                                    value={exam.name}
                                    onChange={(e) => setExam(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder={t('import.exam_name_placeholder')}
                                />
                            </div>
                            <div>
                                <FieldLabel>{t('import.f_exam_date')}</FieldLabel>
                                <TextInput
                                    type="date"
                                    value={exam.date}
                                    onChange={(e) => setExam(prev => ({ ...prev, date: e.target.value }))}
                                />
                            </div>
                            <div>
                                <FieldLabel>{t('import.f_exam_type')}</FieldLabel>
                                <SelectInput
                                    value={exam.type}
                                    onChange={(e) => setExam(prev => ({ ...prev, type: e.target.value }))}
                                >
                                    <option value="Mock">{t('import.exam_type_mock')}</option>
                                    <option value="Midterm">{t('import.exam_type_midterm')}</option>
                                    <option value="Final">{t('import.exam_type_final')}</option>
                                    <option value="Custom">{t('import.exam_type_custom')}</option>
                                </SelectInput>
                            </div>
                            <div>
                                <FieldLabel>{t('import.f_exam_total')}</FieldLabel>
                                <NumberInput
                                    type="number"
                                    value={exam.totalScore}
                                    onChange={(e) => setExam(prev => ({ ...prev, totalScore: e.target.value }))}
                                    placeholder={String(manualComputedTotal)}
                                />
                                <div className="text-[10px] font-mono text-muted-fg mt-1">
                                    {t('import.f_exam_total_hint', { total: manualComputedTotal })}
                                </div>
                            </div>
                            <div>
                                <FieldLabel>{t('import.f_exam_class_rank')}</FieldLabel>
                                <NumberInput
                                    type="number"
                                    value={exam.classRank}
                                    onChange={(e) => setExam(prev => ({ ...prev, classRank: e.target.value }))}
                                    placeholder={t('import.optional')}
                                />
                            </div>
                            <div>
                                <FieldLabel>{t('import.f_exam_grade_rank')}</FieldLabel>
                                <NumberInput
                                    type="number"
                                    value={exam.gradeRank}
                                    onChange={(e) => setExam(prev => ({ ...prev, gradeRank: e.target.value }))}
                                    placeholder={t('import.optional')}
                                />
                            </div>
                        </div>

                        <div className="mt-8 border-t border-border pt-6">
                            <div className="flex items-center justify-between">
                                <FieldLabel>{t('import.f_scores')}</FieldLabel>
                                <button
                                    onClick={addScoreRow}
                                    className="text-xs font-mono text-muted-fg hover:text-white transition-colors"
                                >
                                    {t('import.btn_add_row')}
                                </button>
                            </div>

                            <div className="mt-4 border border-border overflow-hidden">
                                <table className="w-full text-left text-xs font-mono">
                                    <thead className="bg-white/5 text-white">
                                        <tr>
                                            <th className="p-3 w-[30%]">{t('import.col_subject')}</th>
                                            <th className="p-3 w-[20%]">{t('import.col_score')}</th>
                                            <th className="p-3 w-[20%]">{t('import.col_max')}</th>
                                            <th className="p-3 w-[20%]">{t('import.col_avg')}</th>
                                            <th className="p-3 w-[10%] text-right">{t('import.col_ops')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {exam.scores.map((s, idx) => (
                                            <tr key={idx} className="border-t border-border hover:bg-white/5 transition-colors">
                                                <td className="p-2 border-r border-border">
                                                    <SelectInput
                                                        value={s.subject}
                                                        onChange={(e) => setScoreRow(idx, { subject: e.target.value })}
                                                        className="text-xs"
                                                    >
                                                        <option value="">{t('import.opt_subject')}</option>
                                                        {SUBJECT_PRESETS.map(opt => (
                                                            <option key={opt.subject} value={opt.subject}>
                                                                {t(`subjects.${opt.subject}`, { defaultValue: opt.subject })}
                                                            </option>
                                                        ))}
                                                    </SelectInput>
                                                </td>
                                                <td className="p-2 border-r border-border">
                                                    <NumberInput
                                                        type="number"
                                                        value={s.score}
                                                        onChange={(e) => setScoreRow(idx, { score: e.target.value })}
                                                        className="text-xs"
                                                    />
                                                </td>
                                                <td className="p-2 border-r border-border">
                                                    <NumberInput
                                                        type="number"
                                                        value={s.maxScore}
                                                        onChange={(e) => setScoreRow(idx, { maxScore: e.target.value })}
                                                        className="text-xs"
                                                    />
                                                </td>
                                                <td className="p-2 border-r border-border">
                                                    <NumberInput
                                                        type="number"
                                                        value={s.gradeAvgScore}
                                                        onChange={(e) => setScoreRow(idx, { gradeAvgScore: e.target.value })}
                                                        className="text-xs"
                                                    />
                                                </td>
                                                <td className="p-2 text-right">
                                                    <button
                                                        onClick={() => removeScoreRow(idx)}
                                                        className="text-xs font-mono text-muted-fg hover:text-white transition-colors"
                                                        title={t('import.btn_remove_row')}
                                                    >
                                                        X
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {manualError && (
                                <div className="mt-4 border border-red-900/50 bg-red-900/10 p-3 text-xs font-mono text-red-400">
                                    {manualError}
                                </div>
                            )}

                            {manualResult && (
                                <div className="mt-4 border border-border bg-black/30 p-4">
                                    <div className="text-xs font-mono text-white font-bold">
                                        {t('import.manual_ok', { name: manualResult.name || '-' })}
                                    </div>
                                    <div className="text-[10px] font-mono text-muted-fg mt-2">
                                        {t('import.result_hint')}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={submitManual}
                                    className="flex-1 py-3 border border-white bg-white text-black hover:bg-white/90 transition-colors text-sm font-bold disabled:opacity-50"
                                    disabled={manualBusy}
                                >
                                    {manualBusy ? t('import.btn_saving') : t('import.btn_save')}
                                </button>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>
            )}
        </div>
    );
};

export default ImportPage;
