import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ParticleBackground from './background/ParticleBackground';
import { useConfig } from '../context/ConfigContext';
import { useFontLoader } from '../hooks/useFontLoader';

const Layout = ({ children, currentPage, onNavigate }) => {
    const { t } = useTranslation();
    const { perfMode } = useConfig(); // 获取性能模式
    const [widthPercent, setWidthPercent] = useState(60);
    const isDragging = useRef(false);

    // 激活字体加载逻辑
    useFontLoader();

    // --- 拖拽逻辑开始 ---
    const handleMouseDown = (e) => {
        isDragging.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current) return;
        const screenCenter = window.innerWidth / 2;
        const mouseX = e.clientX;
        if (mouseX > screenCenter) {
            const distFromCenter = mouseX - screenCenter;
            const newWidthPx = distFromCenter * 2;
            const newWidthPercent = (newWidthPx / window.innerWidth) * 100;
            if (newWidthPercent > 30 && newWidthPercent < 98) {
                setWidthPercent(newWidthPercent);
            }
        }
    };

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);
    // --- 拖拽逻辑结束 ---

    const navClass = (page) =>
        `cursor-pointer transition-colors ${currentPage === page ? 'text-white font-bold' : 'hover:text-white'}`;

    return (
        <div className="w-screen h-screen overflow-hidden relative bg-background font-mono selection:bg-white selection:text-black flex justify-center items-center">

            {/* Layer 0: 3D 粒子背景 (受性能模式控制) */}
            {!perfMode && (
                <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                    <ParticleBackground />
                </div>
            )}

            {/* Layer 1: 可调节宽度的居中容器 */}
            <motion.div
                className="relative z-10 flex flex-col h-full bg-black/80 backdrop-blur-md border-x border-border shadow-2xl"
                style={{ width: `${widthPercent}%` }}
                layout={false}
            >

                {/* Header */}
                <header className="flex-none border-b border-border h-16 flex items-center px-6 justify-between bg-black/50 select-none">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"/>
                        <div className="text-lg font-bold tracking-tighter">GRADE_MATRIX</div>
                    </div>
                    <div className="flex gap-4 text-xs font-bold text-muted-fg">
             <span className={navClass('dashboard')} onClick={() => onNavigate('dashboard')}>
               {t('nav.dashboard')}
             </span>
                        <span className={navClass('import')} onClick={() => onNavigate('import')}>
               {t('nav.import')}
             </span>
                        <span className={navClass('config')} onClick={() => onNavigate('config')}>
               {t('nav.config')}
             </span>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto custom-scrollbar p-8 relative">
                    {children}
                </main>

                {/* Drag Handle */}
                <div
                    className="absolute top-0 right-[-6px] w-[12px] h-full cursor-col-resize z-50 group flex items-center justify-center hover:bg-white/5 transition-colors"
                    onMouseDown={handleMouseDown}
                    onDoubleClick={() => setWidthPercent(60)}
                    title="Drag to Resize"
                >
                    <div className="h-12 w-1 bg-white/20 group-hover:bg-white rounded-full transition-colors shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                </div>

            </motion.div>
        </div>
    );
};

export default Layout;