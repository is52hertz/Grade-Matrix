import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Config from './pages/Config';
import { ResourceProvider } from './context/ResourceContext';
import { ConfigProvider } from './context/ConfigContext';
import DownloadWidget from './components/ui/DownloadWidget';

function AppContent() {
    // 简单的页面路由状态
    const [currentPage, setCurrentPage] = useState('dashboard');

    return (
        <>
            <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
                {currentPage === 'dashboard' && <Dashboard />}
                {currentPage === 'config' && <Config />}
                {currentPage === 'import' && <div className="p-10 text-center text-muted-fg font-mono">[IMPORT MODULE PLACEHOLDER]</div>}
            </Layout>
            <DownloadWidget />
        </>
    );
}

function App() {
    return (
        <ConfigProvider>      {/* Layer 1: 配置状态 (隐私/性能) */}
            <ResourceProvider>  {/* Layer 2: 资源下载状态 */}
                <AppContent />
            </ResourceProvider>
        </ConfigProvider>
    );
}

export default App;