import express from 'express';
import session from 'express-session';
import sqlite3 from 'connect-sqlite3';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import { analyzePerformance } from './src/services/analysisEngine.js';

const app = express();
const prisma = new PrismaClient();
const SQLiteStore = sqlite3(session);
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGINS = (process.env.CLIENT_ORIGINS || 'http://localhost:3000,http://localhost:5173')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

class BadRequestError extends Error {
    constructor(message) {
        super(message);
        this.name = 'BadRequestError';
    }
}

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

const normalizeScorePayload = (raw, index) => {
    if (!raw || typeof raw !== 'object') {
        throw new BadRequestError(`scores[${index}] must be an object`);
    }

    const subject = String(raw.subject || '').trim();
    if (!subject) throw new BadRequestError(`scores[${index}].subject is required`);

    const score = toNumberOrUndef(raw.score);
    if (score === undefined) throw new BadRequestError(`scores[${index}].score must be a number`);

    const maxScore = toNumberOrUndef(raw.maxScore) ?? 100;
    if (!(maxScore > 0)) throw new BadRequestError(`scores[${index}].maxScore must be > 0`);

    return {
        subject,
        score,
        maxScore,
        classRank: toIntOrUndef(raw.classRank),
        gradeRank: toIntOrUndef(raw.gradeRank),
        gradeAvgScore: toNumberOrUndef(raw.gradeAvgScore),
    };
};

const normalizeExamPayload = (raw, indexForMsg = 0) => {
    if (!raw || typeof raw !== 'object') {
        throw new BadRequestError(`exams[${indexForMsg}] must be an object`);
    }

    const name = String(raw.name || '').trim();
    if (!name) throw new BadRequestError(`exams[${indexForMsg}].name is required`);

    const type = String(raw.type || '').trim() || 'Mock';

    const date = raw.date ? new Date(raw.date) : new Date();
    if (Number.isNaN(date.getTime())) throw new BadRequestError(`exams[${indexForMsg}].date is invalid`);

    if (!Array.isArray(raw.scores) || raw.scores.length === 0) {
        throw new BadRequestError(`exams[${indexForMsg}].scores must be a non-empty array`);
    }

    const scores = raw.scores.map((s, i) => normalizeScorePayload(s, i));

    const seen = new Set();
    for (const s of scores) {
        if (seen.has(s.subject)) throw new BadRequestError(`exams[${indexForMsg}].scores has duplicate subject: ${s.subject}`);
        seen.add(s.subject);
    }

    const computedTotal = scores.reduce((acc, cur) => acc + cur.score, 0);
    const totalScore = toNumberOrUndef(raw.totalScore) ?? computedTotal;

    return {
        name,
        date,
        type,
        totalScore,
        classRank: toIntOrUndef(raw.classRank),
        gradeRank: toIntOrUndef(raw.gradeRank),
        scores,
    };
};

const extractExamsPayload = (body) => {
    if (Array.isArray(body)) return body;
    if (!body || typeof body !== 'object') return null;
    if (Array.isArray(body.exams)) return body.exams;
    if (body.exam && typeof body.exam === 'object') return [body.exam];
    if (body.name || body.scores) return [body];
    return null;
};

// Middleware
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin(origin, callback) {
        // Allow non-browser clients (no Origin header) and allowlisted dev origins.
        if (!origin) return callback(null, true);
        if (CLIENT_ORIGINS.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
}));

app.use(session({
    store: new SQLiteStore({ db: 'sessions.db', dir: './' }),
    secret: 'your_super_secret_key_change_this',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // 本地开发设为 false，HTTPS 环境设为 true
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7天
    }
}));

// --- API Routes ---

app.get('/api/dashboard', async (req, res) => {
    const user = await prisma.user.findFirst();
    if (!user) return res.status(401).json({ error: "No user found" });

    const exams = await prisma.exam.findMany({
        where: { userId: user.id },
        include: { scores: true },
        orderBy: { date: 'desc' }
    });

    const analysis = analyzePerformance(exams, user.selectedSubjects);

    res.json({ exams, analysis });
});

// Create a single exam (manual entry path)
app.post('/api/exam', async (req, res) => {
    const user = await prisma.user.findFirst();
    if (!user) return res.status(401).json({ error: "No user found" });

    try {
        const exam = normalizeExamPayload(req.body);
        const created = await prisma.exam.create({
            data: {
                name: exam.name,
                date: exam.date,
                type: exam.type,
                userId: user.id,
                totalScore: exam.totalScore,
                classRank: exam.classRank,
                gradeRank: exam.gradeRank,
                scores: { create: exam.scores }
            }
        });
        res.json(created);
    } catch (e) {
        if (e instanceof BadRequestError) return res.status(400).json({ error: e.message });
        res.status(500).json({ error: e.message });
    }
});

// Bulk import (JSON text path)
app.post('/api/import', async (req, res) => {
    const user = await prisma.user.findFirst();
    if (!user) return res.status(401).json({ error: "No user found" });

    try {
        const examsRaw = extractExamsPayload(req.body);
        if (!examsRaw) throw new BadRequestError('Payload must be { exams: [...] } or a single exam object');
        if (examsRaw.length > 100) throw new BadRequestError('Too many exams (max 100)');

        const exams = examsRaw.map((e, i) => normalizeExamPayload(e, i));

        const created = await prisma.$transaction(
            exams.map(exam =>
                prisma.exam.create({
                    data: {
                        name: exam.name,
                        date: exam.date,
                        type: exam.type,
                        userId: user.id,
                        totalScore: exam.totalScore,
                        classRank: exam.classRank,
                        gradeRank: exam.gradeRank,
                        scores: { create: exam.scores },
                    }
                })
            )
        );

        res.json({
            created: created.length,
            exams: created.map(e => ({ id: e.id, name: e.name, date: e.date }))
        });
    } catch (e) {
        if (e instanceof BadRequestError) return res.status(400).json({ error: e.message });
        res.status(500).json({ error: e.message });
    }
});

// Demo-only reset
app.post('/api/reset', async (req, res) => {
    await prisma.score.deleteMany();
    await prisma.exam.deleteMany();
    res.json({ msg: "Data reset" });
});

app.listen(PORT, () => {
    console.log(`[SERVER] Running on http://localhost:${PORT}`);
});
