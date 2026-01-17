import React, { createContext, useState, useContext, useEffect } from 'react';

const ConfigContext = createContext();

export const useConfig = () => useContext(ConfigContext);

const DEFAULT_DASHBOARD_MODULES = {
    overview: true,
    mainSequence: true,
    shortStave: true,
    radar: true,
    selectionAI: true,
    volatilityIndex: true,
    dataMatrix: true,
};

const loadDashboardModules = () => {
    try {
        const raw = localStorage.getItem('cfg_dash_modules');
        if (!raw) return DEFAULT_DASHBOARD_MODULES;
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_DASHBOARD_MODULES, ...parsed };
    } catch {
        return DEFAULT_DASHBOARD_MODULES;
    }
};

export const ConfigProvider = ({ children }) => {
    // 1. 隐私模式: 默认关闭
    const [privacyMode, setPrivacyMode] = useState(() => {
        return localStorage.getItem('cfg_privacy') === 'true';
    });

    // 2. 性能模式: 默认关闭 (即开启3D)
    const [perfMode, setPerfMode] = useState(() => {
        return localStorage.getItem('cfg_perf') === 'true';
    });

    // 3. Dashboard 组件显示: 默认全部开启
    const [dashboardModules, setDashboardModules] = useState(loadDashboardModules);

    // 持久化监听
    useEffect(() => { localStorage.setItem('cfg_privacy', privacyMode); }, [privacyMode]);
    useEffect(() => { localStorage.setItem('cfg_perf', perfMode); }, [perfMode]);
    useEffect(() => { localStorage.setItem('cfg_dash_modules', JSON.stringify(dashboardModules)); }, [dashboardModules]);

    const togglePrivacy = () => setPrivacyMode(!privacyMode);
    const togglePerf = () => setPerfMode(!perfMode);
    const toggleDashboardModule = (key) => setDashboardModules(prev => ({ ...prev, [key]: !prev[key] }));

    return (
        <ConfigContext.Provider value={{ privacyMode, togglePrivacy, perfMode, togglePerf, dashboardModules, toggleDashboardModule }}>
            {children}
        </ConfigContext.Provider>
    );
};
