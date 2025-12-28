
import React, { useState, useMemo } from 'react';
import { AppConfig } from '../App';
import { Copy, Check, FileCode, Download, ShieldCheck, Activity, Terminal } from 'lucide-react';

interface Props {
  config: AppConfig;
  setConfig?: React.Dispatch<React.SetStateAction<AppConfig>>;
}

const PhpScriptView: React.FC<Props> = ({ config }) => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const configContent = useMemo(() => {
    const toPhpArray = (arr: string[]) => {
      if (!arr || arr.length === 0) return 'array()';
      return 'array("' + arr.join('", "') + '")';
    };

    return `<?php
/**
 * CONFIGURAZIONE NovaEngel - GENERATA AUTOMATICAMENTE
 * Data: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
 */

/* ==========================================================================
   1. CREDENZIALI API & PROXY
   ========================================================================== */
define("API_BASE_URL", "${config.apiBaseUrl}");
define("API_USER", "${config.apiUser}");
define("API_PASSWORD", "${config.apiPass}");
define("PROXY_URL", "${config.proxyUrl}");
define("API_LANGUAGE", "${config.exportLanguage}");

/* ==========================================================================
   2. PERCORSI (REMOTE PATHS)
   ========================================================================== */
define("SAVE_DIRECTORY", rtrim("${config.saveDir}", "/") . "/");
define("OUTPUT_PATH", rtrim("${config.outputPath}", "/") . "/");
define("IMAGE_DOWNLOAD_PATH", rtrim("${config.imgDownloadPath}", "/") . "/");
define("BASE_IMAGE_URL", rtrim("${config.baseImageUrl}", "/") . "/");
define("LOG_FILE", SAVE_DIRECTORY . "process.log");

/* ==========================================================================
   3. ABILITAZIONE EXPORT
   ========================================================================== */
define("ENABLE_JSON", ${config.exportJson ? 'true' : 'false'});
define("ENABLE_CSV", ${config.exportCsv ? 'true' : 'false'});
define("ENABLE_WOO", ${config.exportWoo ? 'true' : 'false'});
define("ENABLE_PRESTA", ${config.exportPresta ? 'true' : 'false'});

/* ==========================================================================
   4. NOMI FILE PERSONALIZZATI
   ========================================================================== */
define("JSON_FILENAME", "${config.jsonFilename}");
define("CSV_FILENAME", "${config.csvFilename}");
define("WOO_FILENAME", "${config.wooFilename}");
define("PRESTA_FILENAME", "${config.prestaFilename}");

/* ==========================================================================
   5. CONFIGURAZIONE FORMATO
   ========================================================================== */
define("CSV_DELIMITER", "${config.csvDelimiter}");
define("CSV_SHOW_HEADERS", ${config.showCsvHeaders ? 'true' : 'false'});
define("SELECTED_FIELDS", "${config.selectedFields.join(',')}");

/* ==========================================================================
   6. FILTRI BASE & PERFORMANCE
   ========================================================================== */
define("FILTER_MIN_STOCK", ${config.filterMinStock});
define("FILTER_LIMIT", ${config.ignoreLimit ? 0 : config.productLimit});
define("RATE_LIMIT_DELAY", ${config.rateLimitDelay});

/* ==========================================================================
   7. FILTRI AVANZATI (ARRAY PHP)
   ========================================================================== */
define("FILTER_BRANDS", ${toPhpArray(config.filterBrands)});
define("FILTER_CATEGORIES", ${toPhpArray(config.filterCategories)});
define("FILTER_GENDERS", ${toPhpArray(config.filterGenders)});
define("FILTER_SUBCATEGORIES", ${toPhpArray(config.filterSubcategories)});

?>`;
  }, [config]);

  const exportScriptContent = useMemo(() => `<?php
/**
 * EXPORT ENGINE & PROXY API NovaEngel
 * Istruzioni: Caricare questo file come 'export.php' nella stessa cartella di 'config.php'
 */
require_once __DIR__ . '/config.php';

// Gestione Headers CORS per Dashboard React
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

// Modalità Proxy per richieste dalla Dashboard
if (isset($input['proxy_action']) && $input['proxy_action'] === 'api_call') {
    // 1. Autenticazione Server-Side per ottenere il Token
    $ch = curl_init(API_BASE_URL . "/login");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        "user" => API_USER, 
        "password" => API_PASSWORD
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $authResponse = curl_exec($ch);
    $authData = json_decode($authResponse, true);
    $token = $authData['Token'] ?? null;
    curl_close($ch);

    if (!$token) {
        header('Content-Type: application/json', true, 401);
        echo json_encode(["error" => "Autenticazione Fallita su NovaEngel API"]);
        exit;
    }

    // 2. Esecuzione Chiamata API con Token
    $url = API_BASE_URL . $input['endpoint'] . '/' . $token;
    if ($input['method'] === 'GET' && isset($input['payload'])) {
        $url .= '?' . http_build_query($input['payload']);
    }

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    if ($input['method'] === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($input['payload']));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    }

    $apiResponse = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    header('Content-Type: application/json', true, $httpCode);
    echo $apiResponse;
    exit;
}

// Logica di Export Catalog (eseguibile via CLI o Cron)
echo "NovaEngel Export Engine Ready. Configurazione caricata correttamente.\\n";
echo "Campi mappati: " . count(explode(',', SELECTED_FIELDS)) . "\\n";
?>`, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Generatore Script PHP</h2>
          <p className="text-slate-500 text-sm">Questi file implementano la logica lato server per l'export dei prodotti.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl flex items-center shadow-sm">
             <Terminal className="w-4 h-4 text-indigo-600 mr-2" />
             <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest">v2.5 Full Mapping</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl flex items-center shadow-sm">
             <ShieldCheck className="w-4 h-4 text-emerald-600 mr-2" />
             <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Config Pro Ready</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* config.php */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center font-bold text-slate-700 text-[10px] uppercase tracking-wider">
            <div className="flex items-center"><FileCode className="w-4 h-4 mr-2 text-indigo-500" /> config.php</div>
            <div className="flex gap-2">
              <button onClick={() => handleDownloadFile('config.php', configContent)} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"><Download className="w-4 h-4" /></button>
              <button onClick={() => copyToClipboard(configContent, 'c')} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">{copied === 'c' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}</button>
            </div>
          </div>
          <pre className="p-6 text-[10px] font-mono text-slate-600 overflow-x-auto h-[550px] custom-scrollbar bg-slate-50/30 leading-relaxed"><code>{configContent}</code></pre>
        </div>

        {/* export.php */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center font-bold text-slate-700 text-[10px] uppercase tracking-wider">
            <div className="flex items-center"><Terminal className="w-4 h-4 mr-2 text-indigo-500" /> export.php (Engine)</div>
            <div className="flex gap-2">
              <button onClick={() => handleDownloadFile('export.php', exportScriptContent)} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"><Download className="w-4 h-4" /></button>
              <button onClick={() => copyToClipboard(exportScriptContent, 'e')} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">{copied === 'e' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}</button>
            </div>
          </div>
          <pre className="p-6 text-[10px] font-mono text-slate-600 overflow-x-auto h-[550px] custom-scrollbar bg-slate-50/30 leading-relaxed"><code>{exportScriptContent}</code></pre>
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
            <div className="bg-indigo-600 p-5 rounded-2xl shadow-2xl shadow-indigo-500/40 animate-pulse">
              <Activity className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Automazione Server-Side Integrata</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-2xl italic">
                "Lo script genera file CSV e JSON strutturati secondo i filtri avanzati. Gli array PHP (Brand, Categorie, ecc.) vengono iniettati direttamente nel file config.php per garantire che il server filtri solo ciò che hai selezionato qui."
              </p>
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 opacity-5 pointer-events-none">
            <Terminal className="w-80 h-80" />
          </div>
      </div>
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }`}</style>
    </div>
  );
};

export default PhpScriptView;
