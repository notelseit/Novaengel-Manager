
import React, { useState, useEffect } from 'react';
import { Box } from 'lucide-react';
import Dashboard from './components/Dashboard';
import PhpScriptView from './components/PhpScriptView';
import PreviewTable from './components/PreviewTable';
import ConfigView from './components/ConfigView';
import DownloadView from './components/DownloadView';
import FiltersView from './components/FiltersView';
import OrdersView from './components/OrdersView';

export interface ExportProfile {
  id: string;
  name: string;
  fields: string[];
}

export interface AppConfig {
  apiUser: string;
  apiPass: string;
  apiBaseUrl: string;
  proxyUrl: string; // URL dello script PHP che funge da proxy
  saveDir: string;
  imgDownloadPath: string;
  outputPath: string;
  baseImageUrl: string;
  exportJson: boolean;
  exportCsv: boolean;
  exportWoo: boolean;
  exportPresta: boolean;
  jsonFilename: string;
  csvFilename: string;
  wooFilename: string;
  prestaFilename: string;
  exportLanguage: string;
  csvDelimiter: string;
  showCsvHeaders: boolean;
  rateLimitDelay: number;
  productLimit: number;
  ignoreLimit: boolean;
  filterMinStock: number;
  selectedFields: string[];
  filterBrands: string[];
  filterCategories: string[];
  filterGenders: string[];
  filterSubcategories: string[];
  customProfiles: ExportProfile[];
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'config' | 'filters' | 'preview' | 'php' | 'download' | 'orders'>('dashboard');
  const [tokenStatus, setTokenStatus] = useState<'active' | 'refreshing' | 'expired'>('active');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Simulate token lifecycle
  useEffect(() => {
    const interval = setInterval(() => {
      setTokenStatus('refreshing');
      setTimeout(() => {
        setTokenStatus('active');
        setLastRefresh(new Date());
      }, 2000);
    }, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('nova_config');
    const baseConfig = {
      apiUser: "info@notelseit.beauty",
      apiPass: "F@nculo2025!?",
      apiBaseUrl: "https://drop.novaengel.com/api",
      proxyUrl: "", // Vuoto di default, da compilare in Configurazione
      saveDir: "/www/wwwroot/notelseit.beauty/novaengel/order/",
      imgDownloadPath: "/www/wwwroot/notelseit.beauty/novaengel/product/images/",
      outputPath: "/www/wwwroot/notelseit.beauty/novaengel/product/output/",
      baseImageUrl: "https://notelseit.beauty/novaengel/product/images/",
      exportJson: true,
      exportCsv: true,
      exportWoo: true,
      exportPresta: true,
      jsonFilename: "products_export.json",
      csvFilename: "products_export.csv",
      wooFilename: "export_woocommerce.csv",
      prestaFilename: "export_prestashop.csv",
      exportLanguage: "en",
      csvDelimiter: ",",
      showCsvHeaders: true,
      rateLimitDelay: 0.2,
      productLimit: 500,
      ignoreLimit: false,
      filterMinStock: 0,
      selectedFields: [
        "Id", "EANs", "Description", "Price", "Stock", "BrandName", "Gender", "Families", "IVA", "Image"
      ],
      filterBrands: [],
      filterCategories: [],
      filterGenders: [],
      filterSubcategories: [],
      customProfiles: []
    };
    return saved ? JSON.parse(saved) : baseConfig;
  });

  useEffect(() => {
    localStorage.setItem('nova_config', JSON.stringify(config));
  }, [config]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="bg-indigo-600 p-2 rounded-lg mr-3 shadow-indigo-200 shadow-lg">
                <Box className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                NovaEngel Manager
              </span>
            </div>
            
            <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-indigo-600'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('config')}
                className={`px-3 py-2 rounded-md text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'config' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-indigo-600'}`}
              >
                Configurazione
              </button>
              <button 
                onClick={() => setActiveTab('filters')}
                className={`px-3 py-2 rounded-md text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'filters' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-indigo-600'}`}
              >
                Filtri
              </button>
              <button 
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-2 rounded-md text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'preview' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-indigo-600'}`}
              >
                Preview
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`px-3 py-2 rounded-md text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'orders' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-indigo-600'}`}
              >
                Ordini
              </button>
              <button 
                onClick={() => setActiveTab('php')}
                className={`px-3 py-2 rounded-md text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'php' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-indigo-600'}`}
              >
                Script PHP
              </button>
              <button 
                onClick={() => setActiveTab('download')}
                className={`px-3 py-2 rounded-md text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'download' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-indigo-600'}`}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} tokenStatus={tokenStatus} lastRefresh={lastRefresh} />}
        {activeTab === 'config' && <ConfigView config={config} setConfig={setConfig} />}
        {activeTab === 'filters' && <FiltersView config={config} setConfig={setConfig} />}
        {activeTab === 'php' && <PhpScriptView config={config} setConfig={setConfig} />}
        {activeTab === 'preview' && <PreviewTable config={config} />}
        {activeTab === 'download' && <DownloadView config={config} />}
        {activeTab === 'orders' && <OrdersView config={config} />}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          © {new Date().getFullYear()} NovaEngel DropShipping Integration • Built with Senior Engineering Standards
        </div>
      </footer>
    </div>
  );
};

export default App;
