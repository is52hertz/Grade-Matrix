import React, { createContext, useState, useContext, useCallback } from 'react';
import axios from 'axios';

const ResourceContext = createContext();

export const useResource = () => useContext(ResourceContext);

export const ResourceProvider = ({ children }) => {
    const [downloads, setDownloads] = useState({});
    const [isAutoDetect, setIsAutoDetect] = useState(() => {
        return localStorage.getItem('config_auto_lang') !== 'false';
    });

    const registerDownload = useCallback(async (id, url, name) => {
        if (downloads[id] && downloads[id].status === 'downloading') return null;
        if (downloads[id] && downloads[id].status === 'completed') return null;

        let startTime = Date.now();
        let prevLoaded = 0;

        setDownloads(prev => ({
            ...prev,
            [id]: { id, name, progress: 0, loaded: 0, total: 0, speed: 'connecting', status: 'downloading' }
        }));

        try {
            console.log(`[Resource] Fetching: ${url}`);

            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                onDownloadProgress: (progressEvent) => {
                    const { loaded, total } = progressEvent;

                    // 修正：如果服务器没给 content-length (total=0)，或者压缩导致 total < loaded
                    // 我们给一个较大的预估值 (25MB)，适合字体文件
                    let validTotal = total && total > 0 ? total : 25 * 1024 * 1024;

                    // 动态修正：如果下载量超过了预估总量，说明预估小了，动态扩容 total
                    if (loaded > validTotal) {
                        validTotal = loaded + (1 * 1024 * 1024); // 假设还有 1MB
                    }

                    const percent = Math.round((loaded * 100) / validTotal);

                    // 计算速度
                    const now = Date.now();
                    const timeDiff = (now - startTime) / 1000;
                    let speedStr = 'calculating';

                    if (timeDiff > 0.5) {
                        const speed = (loaded - prevLoaded) / timeDiff;
                        speedStr = speed > 1024 * 1024
                            ? `${(speed / 1024 / 1024).toFixed(1)} MB/s`
                            : `${(speed / 1024).toFixed(0)} KB/s`;
                        startTime = now;
                        prevLoaded = loaded;
                    }

                    setDownloads(prev => ({
                        ...prev,
                        [id]: {
                            ...prev[id],
                            progress: percent > 99 ? 99 : percent, // 没完成前卡在 99%
                            loaded,
                            total: validTotal,
                            speed: speedStr,
                            status: 'downloading'
                        }
                    }));
                }
            });

            // 只有 Axios 成功返回 200，才设置 100% DONE
            setDownloads(prev => ({
                ...prev,
                [id]: { ...prev[id], progress: 100, status: 'completed', speed: 'done' }
            }));

            setTimeout(() => {
                setDownloads(prev => {
                    const newState = { ...prev };
                    delete newState[id];
                    return newState;
                });
            }, 3000);

            return response.data;

        } catch (error) {
            console.error(`[Resource] Error ${id}:`, error);
            setDownloads(prev => ({
                ...prev,
                [id]: { ...prev[id], status: 'error', speed: 'failed', progress: 0 }
            }));
            return null;
        }
    }, [downloads]);

    const toggleAutoDetect = () => {
        const newVal = !isAutoDetect;
        setIsAutoDetect(newVal);
        localStorage.setItem('config_auto_lang', newVal);
    };

    return (
        <ResourceContext.Provider value={{ downloads, registerDownload, isAutoDetect, toggleAutoDetect }}>
            {children}
        </ResourceContext.Provider>
    );
};
