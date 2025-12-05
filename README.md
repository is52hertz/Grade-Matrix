***This proj is all created by Gemini 3 pro***

# GRADE MATRIX [SYSTEM_V1.0]

```text
   ______               __        __  ___      __       _
  / ____/________ _____/ /__     /  |/  /___ _/ /______(_)  __
 / / __/ ___/ __ `/ __  / _ \   / /|_/ / __ `/ __/ ___/ / |/_/
/ /_/ / /  / /_/ / /_/ /  __/  / /  / / /_/ / /_/ /  / />  <
\____/_/   \__,_/\__,_/\___/  /_/  /_/\__,_/\__/_/  /_/_/|_|

>> INITIALIZING ACADEMIC ANALYTICS KERNEL...
>> STATUS: ONLINE
```

[![License: MIT](https://img.shields.io/badge/License-MIT-white.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Tech: React](https://img.shields.io/badge/CORE-REACT_V18-black?style=flat-square&logo=react)](https://react.dev/)
[![Tech: Node](https://img.shields.io/badge/SERVER-NODE_V22-black?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![Style: Tailwind](https://img.shields.io/badge/UI-TAILWIND-black?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

---

## 🟢 [EN] SYSTEM MANIFEST

### // 01. INTRODUCTION
**Grade Matrix** is a high-fidelity, monochromatic academic performance analysis system designed for the modern student. It abandons traditional, colorful, and cluttered educational interfaces in favor of a **terminal-inspired, data-driven dashboard**.

It treats your grades not just as numbers, but as **telemetry data**, offering deep insights through volatility analysis, competency radar, and linear regression projections.

### // 02. CORE MODULES
*   **Immersive UI**: Pure monochrome aesthetics with WebGL particle background and `Framer Motion` entry sequences.
*   **Analysis Engine**:
    *   **Main Sequence**: Dual-axis timeline correlating absolute scores with relative rankings.
    *   **Short Stave Detector**: Identifies the "wooden bucket effect" (weakest subjects) against grade averages.
    *   **Volatility Index**: Calculates standard deviation to measure performance stability.
*   **Async Resource Loader**: Custom-built font loader with fallback strategies and real-time progress bar (Sarasa Gothic / LXGW Mono).
*   **Dual Phase Logic**: Automatically adapts analytics for **Grade 10 (Discovery Phase)** and **Grade 11/12 (Focus Phase)**.
*   **Privacy & Config**: One-click privacy mask (`***`) and performance mode toggles.

### // 03. TECH STACK (THE ARSENAL)
*   **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Recharts, Three.js (R3F).
*   **Backend**: Node.js, Express, Prisma ORM.
*   **Database**: SQLite (Zero-config, file-based persistence).
*   **I18n**: Full bilingual support (English / Simplified Chinese) with auto-detection.

---

## ⚡ [EN] PROTOCOL: INITIATE

### PREREQUISITES
*   **Node.js**: v18.0.0 or higher (v22+ recommended).
*   **Package Manager**: npm / yarn / pnpm.

### INSTALLATION
Clone the repository and inject dependencies:

```bash
# 1. Clone repository
git clone https://github.com/is52hertz/Grade-Matrix.git
cd Grade-Matrix

# 2. Install dependencies (Root, Client, and Server)
npm run install-all
```

### DATABASE SETUP
Initialize the Prisma SQLite database and inject simulation data:

```bash
cd server
npx prisma generate
npx prisma db push
npm run seed  # <--- CRITICAL: Generates mock exams for visualization
cd ..
```

### LAUNCH SEQUENCE
Start both the Frontend and Backend servers concurrently:

```bash
# Run from root directory
npm run dev
```

*   **Console Access**: `http://localhost:5173`
*   **API Endpoint**: `http://localhost:5000`

---

## 🛠 [EN] CONFIGURATION

### FONT CUSTOMIZATION
The system uses an asynchronous font loader. You can configure the font source in:
`client/src/fontConfig.js`

```javascript
// Example: Using a custom GitHub release
export const PRIMARY_FONT_URL = "https://cdn.statically.io/gh/User/Repo/font.ttf";
```

### ENVIRONMENT VARIABLES
Create a `.env` file in `./server` if you need custom port configurations (Default: 5000).

---

## 🤝 [EN] CONTRIBUTING
**Pull Requests are welcome.**
1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

<br>
<br>

---

## 🔴 [CN] 系统概览

### // 01. 项目简介
**Grade Matrix** 是一个为现代学生打造的高保真、单色调学业成绩分析系统。它摒弃了传统教育软件色彩斑斓且杂乱的界面，转而采用**终端风格（Terminal-inspired）的数据仪表盘**。

系统将你的成绩视为**遥测数据（Telemetry）**，通过波动率分析、能力雷达和线性回归预测，提供深度的学业洞察。

### // 02. 核心模块
*   **沉浸式 UI**: 纯黑白灰极客美学，搭载 WebGL 粒子背景与 `Framer Motion` 序列动画。
*   **分析引擎**:
    *   **核心趋势 (Main Sequence)**: 双轴图表，同时追踪绝对分值与相对排名。
    *   **木桶效应 (Short Stave)**: 自动识别学科短板，计算与年级平均分的离差。
    *   **稳定性指数 (Volatility)**: 基于标准差计算考试发挥的稳定性。
*   **异步资源加载**: 独创的字体加载器，支持 CDN 容灾、断点重试与实时进度条（适配更纱黑体/霞鹜文楷）。
*   **双阶段逻辑**: 自动适配 **高一（探索期）** 与 **高二/三（聚焦期）** 的不同分析模型。
*   **隐私与配置**: 支持一键隐私遮罩（`***`）与性能模式切换。

### // 03. 技术栈 ~~(军火库)~~
*   **前端**: React (Vite), Tailwind CSS, Framer Motion, Recharts, Three.js (R3F).
*   **后端**: Node.js, Express, Prisma ORM.
*   **数据库**: SQLite (零配置，文件级持久化).
*   **国际化**: 全双语支持（中/英），支持自动探测与热切换。

---

## ⚡ [CN] 启动协议

### 环境要求
*   **Node.js**: v18.0.0 或更高 (推荐 v22 LTS).
*   **包管理器**: npm / yarn / pnpm.

### 安装步骤
克隆仓库并注入依赖：

```bash
# 1. 克隆代码
git clone https://github.com/is52hertz/Grade-Matrix.git
cd Grade-Matrix

# 2. 一键安装前后端依赖
npm run install-all
```

### 数据库初始化
初始化 Prisma SQLite 数据库并注入模拟数据：

```bash
cd server
npx prisma generate  # 生成类型定义
npx prisma db push   # 同步数据库结构
npm run seed         # <--- 关键：生成用于展示的模拟考试数据
cd ..
```

### 发射序列 ~~(启动)~~
同时启动前端与后端服务器：

```bash
# 在根目录运行
npm run dev
```

*   **控制台入口**: `http://localhost:5173`
*   **API 端口**: `http://localhost:5000`

---

## 🛠 [CN] 高级配置

### 字体源配置
系统内置了异步字体加载器。你可以在以下文件中修改下载源（支持 GitHub 直链或 CDN）：
`client/src/fontConfig.js`

### 故障排除
如果字体下载失败或进度条卡住，请在 **系统配置 (Config)** 页面点击 `[DEBUG] Force Re-download` 按钮，或检查控制台的 CORS 报错。

---

## ⚖️ LICENSE
Distributed under the MIT License. See `LICENSE` for more information.

> *"Talk is cheap. Show me the code."*

---
Copyright © 2023 Grade Matrix Project. All Systems Nominal.
