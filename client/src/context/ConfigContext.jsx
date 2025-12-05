import React, { createContext, useState, useContext, useEffect } from 'react';

const ConfigContext = createContext();

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
    // 1. 隐私模式: 默认关闭
    const [privacyMode, setPrivacyMode] = useState(() => {
        return localStorage.getItem('cfg_privacy') === 'true';
    });

    // 2. 性能模式: 默认关闭 (即开启3D)
    const [perfMode, setPerfMode] = useState(() => {
        return localStorage.getItem('cfg_perf') === 'true';
    });

    // 持久化监听
    useEffect(() => { localStorage.setItem('cfg_privacy', privacyMode); }, [privacyMode]);
    useEffect(() => { localStorage.setItem('cfg_perf', perfMode); }, [perfMode]);

    const togglePrivacy = () => setPrivacyMode(!privacyMode);
    const togglePerf = () => setPerfMode(!perfMode);

    return (
        <ConfigContext.Provider value={{ privacyMode, togglePrivacy, perfMode, togglePerf }}>
            {children}
        </ConfigContext.Provider>
    );
};