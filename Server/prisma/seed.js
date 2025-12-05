import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 1. 分数配置 (Strict 150/100 Rule)
const SUBJECT_CONFIG = {
    // Main 3
    Chinese: { max: 150, base: 110, label: '语文' },
    Math: { max: 150, base: 120, label: '数学' },
    English: { max: 150, base: 115, label: '外语' },
    // Sciences
    Physics: { max: 100, base: 80, label: '物理' },
    Chemistry: { max: 100, base: 75, label: '化学' },
    Biology: { max: 100, base: 70, label: '生物' },
    // Humanities
    History: { max: 100, base: 60, label: '历史' },
    Politics: { max: 100, base: 65, label: '政治' },
    Geography: { max: 100, base: 70, label: '地理' },
};

// 选科方向 (高二开始生效)
const FINAL_SELECTION = ["Physics", "Chemistry", "Biology"];

async function main() {
    await prisma.score.deleteMany();
    await prisma.exam.deleteMany();
    await prisma.user.deleteMany();

    // 创建用户 (已选科状态)
    const user = await prisma.user.create({
        data: {
            username: "student_evolution",
            password: "hashed_password",
            selectedSubjects: JSON.stringify(FINAL_SELECTION)
        }
    });

    console.log("Generating timeline data...");

    // 模拟 8 次考试：前 3 次是高一(9科)，后 5 次是高二(6科)
    const exams = [
        { name: "高一上期中 (Grade 10)", phase: 1 },
        { name: "高一上期末 (Grade 10)", phase: 1 },
        { name: "高一下摸底 (Grade 10)", phase: 1 }, // 此时面临选科
        { name: "高二上月考 (Post-Select)", phase: 2 },
        { name: "高二期中考 (Post-Select)", phase: 2 },
        { name: "高二期末考 (Post-Select)", phase: 2 },
        { name: "高三一模 (Gaokao Prep)", phase: 3 },
        { name: "高三二模 (Gaokao Prep)", phase: 3 },
    ];

    for (let i = 0; i < exams.length; i++) {
        const examMeta = exams[i];
        const isGrade10 = examMeta.phase === 1;

        // 决定本次考试考哪些科目
        // 高一考 9 门，高二考 3+3 门
        const subjectsToExam = isGrade10
            ? Object.keys(SUBJECT_CONFIG)
            : ['Chinese', 'Math', 'English', ...FINAL_SELECTION];

        let currentTotal = 0;
        const scoresData = [];

        for (const sub of subjectsToExam) {
            const config = SUBJECT_CONFIG[sub];

            // 模拟成长：每过一次考试，能力值微调
            // 加上随机波动 (Math.random)
            let scoreVal = config.base + (i * 1.2) + (Math.random() * 10 - 5);

            // 限制分数范围
            scoreVal = Math.min(config.max, Math.max(0, Math.round(scoreVal)));

            scoresData.push({
                subject: sub,
                score: scoreVal,
                maxScore: config.max,
                // 简单模拟平均分：假设平均分是满分的 65%
                gradeAvgScore: Math.round(config.max * 0.65),
                gradeRank: 0, // 稍后计算
                classRank: 0
            });
            currentTotal += scoreVal;
        }

        // 计算模拟排名 (分越高排名越前)
        // 高一满分 1050，高二满分 750
        const maxPossible = isGrade10 ? 1050 : 750;
        const gradeRank = Math.floor(1 + (maxPossible - currentTotal) * 0.5);

        await prisma.exam.create({
            data: {
                name: examMeta.name,
                date: new Date(2023, i, 15),
                type: isGrade10 ? 'Grade10' : 'Senior',
                userId: user.id,
                totalScore: currentTotal,
                gradeRank: Math.max(1, gradeRank),
                scores: { create: scoresData }
            }
        });
    }

    console.log("Timeline data injected.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());