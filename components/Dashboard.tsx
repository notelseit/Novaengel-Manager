
import React from 'react';
import { Terminal, ShieldCheck, Download, RefreshCcw, Database, HardDrive, AlertCircle, Cpu, FileWarning, Loader2, CheckCircle } from 'lucide-react';

interface Props {
  setActiveTab: (tab: 'dashboard' | 'php' | 'preview') => void;
  tokenStatus: 'active' | 'refreshing' | 'expired';
  lastRefresh: Date;
}

const Dashboard: React.FC<Props> = ({ setActiveTab, tokenStatus, lastRefresh }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center mb-4">
            <div className={`${tokenStatus === 'refreshing' ? 'bg-indigo-100' : 'bg-emerald-100'} p-2 rounded-lg mr-3 transition-colors`}>
              {tokenStatus === 'refreshing' ? (
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              )}
            </div>
            <h3 className="font-semibold text-slate-800">API Authentication</h3>
          </div>
          <p className="text-slate-500 text-sm mb-4">
            {tokenStatus === 'refreshing' 
              ? 'Rigenerazione token in corso...' 
              : `Token attivo. Ultimo aggiornamento: ${lastRefresh.toLocaleTimeString()}`
            }
          </p>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center text-[10px] font-bold uppercase px-2 py-1 rounded transition-colors ${
              tokenStatus === 'active' ? 'text-emerald-600 bg-emerald-50' : 
              tokenStatus === 'refreshing' ? 'text-indigo-600 bg-indigo-50' : 'text-rose-600 bg-rose-50'
            }`}>
              {tokenStatus === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
              {tokenStatus}
            </div>
            <span className="text-[10px] text-slate-400">Prossimo refresh tra ~5m</span>
          </div>
          {tokenStatus === 'refreshing' && (
            <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 animate-pulse w-full"></div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-100 p-2 rounded-lg mr-3">
              <Database className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-slate-800">Sync Status</h3>
          </div>
          <p className="text-slate-500 text-sm mb-4">Last full product export performed: <span className="text-slate-800 font-medium">Never</span></p>
          <button 
            onClick={() => setActiveTab('preview')}
            className="text-xs text-indigo-600 hover:underline font-medium"
          >
            Check mapped data structure →
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="bg-orange-100 p-2 rounded-lg mr-3">
              <HardDrive className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-slate-800">Storage Usage</h3>
          </div>
          <p className="text-slate-500 text-sm mb-4">Images are mapped as <strong>ID.jpg</strong> in the specified production directory.</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2">
            <div className="bg-orange-400 h-1.5 rounded-full w-[12%]"></div>
          </div>
          <div className="text-[10px] text-slate-400">12% disk space utilized in /images/</div>
        </div>
      </div>

      <div className="bg-rose-50 rounded-2xl border border-rose-100 p-6 flex items-start gap-4">
        <div className="bg-rose-100 p-3 rounded-xl flex-shrink-0">
          <AlertCircle className="w-6 h-6 text-rose-600" />
        </div>
        <div>
          <h3 className="font-bold text-rose-900 mb-2">Fixing "Undefined constant" & PHP Errors</h3>
          <p className="text-rose-800 text-sm mb-4">
            If you see errors like <code>Fatal error: Uncaught Error: Undefined constant "API_BASE_URL"</code>, follow these steps:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white/50 p-3 rounded-lg border border-rose-200">
              <p className="text-[11px] font-bold text-rose-900 uppercase mb-1 flex items-center">
                <FileWarning className="w-3 h-3 mr-1" /> Comment Bug
              </p>
              <p className="text-xs text-rose-700">Check <code>config.php</code>. If <code>//</code> is on the same line as <code>define</code>, PHP skips it. Use separate lines!</p>
            </div>
            <div className="bg-white/50 p-3 rounded-lg border border-rose-200">
              <p className="text-[11px] font-bold text-rose-900 uppercase mb-1 flex items-center">
                <Cpu className="w-3 h-3 mr-1" /> Version Mismatch
              </p>
              <p className="text-xs text-rose-700">Your server uses PHP 8.0 but tries to load 8.3 modules. Use the specific PHP binary: <br/><code className="bg-rose-100 px-1 rounded">/www/server/php/80/bin/php export.php</code></p>
            </div>
            <div className="bg-white/50 p-3 rounded-lg border border-rose-200">
              <p className="text-[11px] font-bold text-rose-900 uppercase mb-1 flex items-center">
                <Terminal className="w-3 h-3 mr-1" /> Path Issue
              </p>
              <p className="text-xs text-rose-700">Always run the script from its own folder or use absolute paths for the config file in the PHP code.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">Technical Implementation</h2>
          <p className="text-slate-400 mb-6 max-w-2xl">
            The solution includes a multi-page scraper that fetches authentication tokens, iterates through the product catalog, downloads high-resolution images, and formats the output to your exact CSV/JSON specification.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setActiveTab('php')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center shadow-lg shadow-indigo-500/20"
            >
              <Terminal className="w-4 h-4 mr-2" />
              Get PHP Code
            </button>
            <button 
              onClick={() => window.alert('Export logic runs via terminal on the server.')}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center border border-white/20"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Trigger Remote Export
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Download className="w-48 h-48" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">System Configuration Guide</h3>
        <ul className="space-y-4">
          <li className="flex items-start">
            <div className="flex-shrink-0 bg-slate-100 text-slate-600 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mt-0.5">1</div>
            <div className="ml-3">
              <p className="text-sm font-semibold text-slate-800">Setup config.php</p>
              <p className="text-sm text-slate-500 italic">Ensure you have the API credentials defined in the root directory.</p>
            </div>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0 bg-slate-100 text-slate-600 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mt-0.5">2</div>
            <div className="ml-3">
              <p className="text-sm font-semibold text-slate-800">Check Permissions</p>
              <p className="text-sm text-slate-500">The script requires write permissions for the `/images/` and `/output/` directories.</p>
            </div>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0 bg-slate-100 text-slate-600 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mt-0.5">3</div>
            <div className="ml-3">
              <p className="text-sm font-semibold text-slate-800">Scheduling (CRON)</p>
              <p className="text-sm text-slate-500">To handle the 5-minute token rotation automatically, schedule the export script via a cron job every 5-10 minutes.</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
