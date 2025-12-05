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

// 安全与基础中间件
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173', // 前端开发端口
    credentials: true
}));

// Session 配置
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

// --- API 路由 ---

// 1. 获取仪表盘数据
app.get('/api/dashboard', async (req, res) => {
    // 模拟当前用户 (实际应从 req.session.userId 获取)
    // 为了演示，这里硬编码取第一个用户
    const user = await prisma.user.findFirst();
    if(!user) return res.status(401).json({ error: "No user found" });

    const exams = await prisma.exam.findMany({
        where: { userId: user.id },
        include: { scores: true },
        orderBy: { date: 'desc' }
    });

    const analysis = analyzePerformance(exams, user.selectedSubjects);

    res.json({
        exams,
        analysis
    });
});

// 2. 录入成绩
app.post('/api/exam', async (req, res) => {
    const { name, date, type, scores } = req.body; // scores: [{ subject, score, maxScore }]
    const user = await prisma.user.findFirst();

    try {
        const newExam = await prisma.exam.create({
            data: {
                name,
                date: new Date(date),
                type,
                userId: user.id,
                scores: {
                    create: scores
                }
            }
        });
        res.json(newExam);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 3. 数据重置/清空 (便于演示)
app.post('/api/reset', async (req, res) => {
    // 安全起见，仅限演示
    await prisma.score.deleteMany();
    await prisma.exam.deleteMany();
    res.json({ msg: "Data reset" });
});

app.listen(PORT, () => {
    console.log(`[SERVER] Running on http://localhost:${PORT}`);
});