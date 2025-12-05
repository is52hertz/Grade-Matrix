import * as ss from 'simple-statistics';

const SUBJECT_LABELS = {
    Chinese: '语文', Math: '数学', English: '英语',
    Physics: '物理', Chemistry: '化学', Biology: '生物',
    Politics: '政治', History: '历史', Geography: '地理'
};

// 选科组合枚举
const COMBINATIONS = [
    { name: '物化生 (Pure Science)', subs: ['Physics', 'Chemistry', 'Biology'] },
    { name: '物化地 (Broad Scope)', subs: ['Physics', 'Chemistry', 'Geography'] },
    { name: '史政地 (Humanities)', subs: ['History', 'Politics', 'Geography'] },
    { name: '物生政 (Civil Service)', subs: ['Physics', 'Biology', 'Politics'] }
];

export const analyzePerformance = (exams, userSelectedSubjectsRaw) => {
    if (!exams || exams.length === 0) return null;

    // 1. 安全解析用户选科
    let selectedSubjects = [];
    try {
        if (typeof userSelectedSubjectsRaw === 'string') {
            selectedSubjects = JSON.parse(userSelectedSubjectsRaw);
        } else if (Array.isArray(userSelectedSubjectsRaw)) {
            selectedSubjects = userSelectedSubjectsRaw;
        }
    } catch (e) { selectedSubjects = []; }

    // 排序
    const sortedExams = [...exams].sort((a, b) => new Date(a.date) - new Date(b.date));
    const latestExam = sortedExams[sortedExams.length - 1];

    // 2. 阶段判断 (Discovery vs Focus)
    // 如果最新考试科目 > 6，说明还在高一全科阶段
    const isDiscoveryPhase = latestExam.scores.length > 6;

    // 确定核心科目列表 (Focus模式下只看语数外+选科)
    const coreSubjects = selectedSubjects.length === 3
        ? ['Chinese', 'Math', 'English', ...selectedSubjects]
        : [];

    // --- 模块 A: Performance Timeline (含回溯投影) ---
    const mainSequenceData = sortedExams.map(e => {
        let displayTotal = e.totalScore;
        let isVirtual = false;

        // 如果处于Focus阶段，且我们要看高一的历史数据，则进行"投影"计算
        if (coreSubjects.length === 6 && e.scores.length > 6) {
            const coreScores = e.scores.filter(s => coreSubjects.includes(s.subject));
            displayTotal = coreScores.reduce((acc, cur) => acc + cur.score, 0);
            isVirtual = true;
        }

        return {
            name: e.name,
            date: e.date.toISOString().split('T')[0],
            totalScore: displayTotal,
            gradeRank: e.gradeRank,
            isVirtual: isVirtual // 用于前端画虚线
        };
    });

    // --- 模块 B: Short Stave (木桶效应) ---
    // 始终计算，Focus阶段只展示核心科目
    const relevantScoresForAnalysis = latestExam.scores.filter(s =>
        isDiscoveryPhase ? true : coreSubjects.includes(s.subject)
    );

    const shortStaveData = relevantScoresForAnalysis.map(s => ({
        subject: SUBJECT_LABELS[s.subject] || s.subject,
        score: s.score,
        gap: s.score - (s.gradeAvgScore || 0),
        isWeak: s.score < (s.gradeAvgScore || 0)
    })).sort((a, b) => a.gap - b.gap);

    // --- 模块 C: Radar (雷达图) ---
    const radarData = relevantScoresForAnalysis.map(s => ({
        subject: SUBJECT_LABELS[s.subject] || s.subject,
        value: Math.round((s.score / s.maxScore) * 100),
        fullMark: 100
    }));

    // --- 模块 D: Volatility (稳定性) ---
    // 无论何时都计算稳定性，这很重要
    const subjectStats = {};
    sortedExams.forEach(e => {
        e.scores.forEach(s => {
            // Focus阶段过滤非核心科目
            if (!isDiscoveryPhase && !coreSubjects.includes(s.subject)) return;

            if (!subjectStats[s.subject]) subjectStats[s.subject] = [];
            subjectStats[s.subject].push(s.score / s.maxScore * 100);
        });
    });

    const volatilityData = Object.keys(subjectStats).map(subj => {
        const scores = subjectStats[subj];
        return {
            subject: SUBJECT_LABELS[subj] || subj,
            mean: Math.round(ss.mean(scores)),
            stdDev: scores.length > 1 ? parseFloat(ss.standardDeviation(scores).toFixed(1)) : 0,
            min: Math.round(ss.min(scores)),
            max: Math.round(ss.max(scores))
        };
    }).sort((a, b) => a.stdDev - b.stdDev);

    // --- 模块 E: Selection Recommendations (仅 Discovery) ---
    let suggestions = [];
    if (isDiscoveryPhase) {
        const currentScores = {};
        latestExam.scores.forEach(s => currentScores[s.subject] = s.score);

        suggestions = COMBINATIONS.map(combo => {
            const main3 = (currentScores['Chinese'] || 0) + (currentScores['Math'] || 0) + (currentScores['English'] || 0);
            const sub3 = combo.subs.reduce((acc, sub) => acc + (currentScores[sub] || 0), 0);
            return {
                name: combo.name,
                total: main3 + sub3,
                subjects: combo.subs.map(s => SUBJECT_LABELS[s])
            };
        }).sort((a, b) => b.total - a.total).slice(0, 3);
    }

    return {
        overview: {
            phase: isDiscoveryPhase ? 'DISCOVERY (G10)' : 'FOCUS (G11/12)',
            examCount: exams.length,
            latestTotal: latestExam.totalScore,
            maxPossible: isDiscoveryPhase ? 1050 : 750,
            bestSubject: volatilityData.find(d => d.mean === Math.max(...volatilityData.map(v=>v.mean)))?.subject,
            mostUnstable: volatilityData[volatilityData.length - 1]?.subject
        },
        charts: {
            mainSequence: mainSequenceData,
            shortStave: shortStaveData,
            radar: radarData,
            volatility: volatilityData,
            suggestions: suggestions
        }
    };
};