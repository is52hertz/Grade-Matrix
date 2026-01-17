import React from 'react';
import { useTranslation } from 'react-i18next';
import { useResource } from '../../context/ResourceContext';
import { motion, AnimatePresence } from 'framer-motion';

const DownloadWidget = () => {
    const { t } = useTranslation();
    const { downloads } = useResource();
    const activeDownloads = Object.values(downloads);

    if (activeDownloads.length === 0) return null;

    // 我们只显示第一个任务，避免重叠 (队列逻辑通常一次主要展示一个)
    const task = activeDownloads[0];

    // 格式化大小
    const formatSize = (bytes) => {
        if (!bytes) return '0 MB';
        return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    };

    const speedText = (speed) => {
        if (speed === 'connecting') return t('download.speed_connecting');
        if (speed === 'calculating') return t('download.speed_calculating');
        if (speed === 'done') return t('download.speed_done');
        if (speed === 'failed') return t('download.speed_failed');
        return speed;
    };

    return (
        <AnimatePresence>
            {task && (
                <>
                    {/* --- Desktop View (md:block) --- */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="hidden md:block fixed bottom-6 right-6 z-[9999] w-80 bg-black border border-white p-4 shadow-2xl font-mono"
                    >
                        <div className="flex justify-between items-start mb-2 border-b border-border pb-1">
                            <span className="text-xs font-bold text-white bg-white/20 px-1">{t('download.system_update')}</span>
                            <span className="text-xs text-muted-fg animate-pulse">{t('download.receiving')}</span>
                        </div>

                        <div className="text-sm font-bold text-white truncate mb-1">{task.name}</div>

                        <div className="flex justify-between text-[10px] text-muted-fg mb-2">
                            <span>{speedText(task.speed)}</span>
                            <span>{formatSize(task.loaded)} / {formatSize(task.total)}</span>
                        </div>

                        {/* 直角矩形进度条 */}
                        <div className="w-full h-4 border border-white p-[1px]">
                            <div
                                className="h-full bg-white transition-all duration-200 ease-linear"
                                style={{ width: `${task.progress}%` }}
                            />
                        </div>
                    </motion.div>

                    {/* --- Mobile View (md:hidden) --- */}
                    {/* 设计要求：纤细下载条，中间文字突破边框，反色显示 */}
                    <motion.div
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                        exit={{ y: 20 }}
                        className="md:hidden fixed bottom-0 left-0 right-0 z-[9999] h-6 border-t border-white bg-black font-mono"
                    >
                        {/* 1. 进度条填充层 (白色) */}
                        <div
                            className="absolute top-0 left-0 bottom-0 bg-white transition-all duration-200 ease-linear z-0"
                            style={{ width: `${task.progress}%` }}
                        />

                        {/* 2. 文字层 (使用 mix-blend-mode: difference 实现黑白反色) */}
                        <div className="absolute inset-0 z-10 flex items-center justify-center mix-blend-difference">
              <span className="text-[10px] font-bold text-white whitespace-nowrap px-2 tracking-tighter">
                 {task.progress}% - {task.name}
              </span>
                        </div>

                        {/* 3. 艺术装饰：突破边框的装饰线 (可选) */}
                        <div className="absolute top-[-4px] left-1/2 -translate-x-1/2 w-1 bg-white h-1 z-20" />

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default DownloadWidget;
