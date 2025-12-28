
import React, { useState, useMemo } from 'react';
import { AppConfig } from '../App';
import { Download, FileJson, FileSpreadsheet, ShoppingCart, Zap, Loader2, CheckCircle2, AlertCircle, ExternalLink, History, FileText } from 'lucide-react';

// Sincronizzato con PreviewTable e EXPORT_FIELDS
const generateMockProducts = (count: number) => {
  const brands = ["Adolfo Dominguez", "Clinique", "Lancome", "Shiseido", "L'Oreal", "Hugo Boss", "Estee Lauder", "Carolina Herrera", "Maybelline", "Biotherm", "Giorgio Armani", "Paco Rabanne", "Versace", "Prada", "Guerlain", "Clarins"];
  const categories = ["Perfumes", "Skincare", "Cosmetics", "Haircare", "Hygiene", "Solar"];
  const subcategories = ["Fragrance", "Moisturizer", "Serum", "Mascara", "Lipstick", "EDP", "EDT", "Sunscreen"];
  const genders = ["Male", "Female", "Unisex", "Kids"];

  return Array.from({ length: count }, (_, i) => {
    const brand = brands[i % brands.length];
    const cat = categories[i % categories.length];
    const sub = subcategories[i % subcategories.length];
    const gender = genders[i % genders.length];
    const id = (10000 + i).toString();
    
    return {
      "Id": id,
      "EANs": [`8410${id}000000`.slice(0, 13)],
      "Description": `${brand} ${sub} Advanced Formula #${i + 1}`,
      "SetContent": i % 10 === 0 ? "3x100ml Set" : "N/A",
      "Price": 25 + (i % 250),
      "PVR": 40 + (i % 300),
      "Stock": (i * 17) % 2000,
      "BrandId": (100 + (i % 50)).toString(),
      "BrandName": brand,
      "LineaId": `L-${i}`,
      "LineaName": "Professional Series",
      "Gender": gender,
      "Families": [cat, gender],
      "IVA": 21.0,
      "Kgs": 0.05 + (i % 30) / 10,
      "Ancho": 50,
      "Alto": 120,
      "Fondo": 50,
      "Fecha": "2024-06-01",
      "Contenido": "100 ml",
      "Gama": "Collection 2025",
      "ItemId": `ITEM-${id}`,
      "Properties": ["Long Lasting", "Premium Quality"],
      "Tags": ["Trending", "Limited Edition"],
      "CompleteFamilies": [cat, sub, gender],
      "Novedad": i % 8 === 0,
      "EsOferta": i % 12 === 0,
      "FechaFinalOferta": i % 12 === 0 ? "2025-12-31" : "N/A",
      "PaisFabricacion": "Spain",
      "Ingredientes": "Aqua, Alcohol Denat, Fragrance...",
      "NombreColor": "Natural",
      "CompleteDescription": `Full clinical description for ${brand} ${sub}. This product is designed for ${gender} and belongs to the ${cat} family.`,
      "Image": `https://notelseit.beauty/novaengel/product/images/${id}.jpg`,
      "_raw_families": [cat, gender],
      "_raw_subfamilies": [sub]
    };
  });
};

const ALL_MOCK_PRODUCTS = generateMockProducts(1000);

interface Props {
  config: AppConfig;
}

const DownloadView: React.FC<Props> = ({ config }) => {
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [recentDownloads, setRecentDownloads] = useState<{name: string, type: string, date: string, url: string}[]>([]);

  const finalProductsForExport = useMemo(() => {
    let filtered = ALL_MOCK_PRODUCTS.filter(p => {
      if (config.filterBrands.length > 0 && !config.filterBrands.includes(p.BrandName)) return false;
      if (config.filterGenders.length > 0 && !config.filterGenders.includes(p.Gender)) return false;
      if (p.Stock < config.filterMinStock) return false;
      
      if (config.filterCategories.length > 0) {
        const hasCat = p._raw_families.some(f => config.filterCategories.includes(f));
        if (!hasCat) return false;
      }
      
      return true;
    });

    if (!config.ignoreLimit && config.productLimit > 0) {
      filtered = filtered.slice(0, config.productLimit);
    }
    return filtered;
  }, [config.filterBrands, config.filterGenders, config.filterMinStock, config.filterCategories, config.productLimit, config.ignoreLimit]);

  const triggerDownload = async (type: 'json' | 'csv' | 'woo' | 'presta') => {
    setIsDownloading(type);
    await new Promise(r => setTimeout(r, 1200));

    let content = "";
    let mimeType = "text/csv";
    let finalFilename = "";

    // Mappatura basata sui campi selezionati nel config
    const dataToExport = finalProductsForExport.map(p => {
        const filtered: any = {};
        config.selectedFields.forEach(f => {
            filtered[f] = (p as any)[f] !== undefined ? (p as any)[f] : "N/A";
        });
        return filtered;
    });

    if (type === 'json') {
      content = JSON.stringify(dataToExport, null, 2);
      mimeType = "application/json";
      finalFilename = config.jsonFilename || "products_export.json";
    } else if (type === 'woo') {
      const headers = ["SKU", "Name", "Description", "Price", "Stock", "Images"];
      const rows = dataToExport.map(p => [
          p.Id, `${p.BrandName} ${p.Description}`, p.CompleteDescription || p.Description, p.Price, p.Stock, p.Image
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(config.csvDelimiter));
      content = headers.join(config.csvDelimiter) + "\n" + rows.join("\n");
      finalFilename = config.wooFilename;
    } else if (type === 'presta') {
      const headers = ["ID", "Name", "Reference", "Price", "Quantity", "Image URL"];
      const rows = dataToExport.map(p => [
          p.Id, `${p.BrandName} ${p.Description}`, p.ItemId || p.Id, p.Price, p.Stock, p.Image
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(config.csvDelimiter));
      content = headers.join(config.csvDelimiter) + "\n" + rows.join("\n");
      finalFilename = config.prestaFilename;
    } else {
      const headers = config.selectedFields.join(config.csvDelimiter);
      const rows = dataToExport.map(item => 
          config.selectedFields.map(f => {
            const val = String(item[f]);
            return `"${val.replace(/"/g, '""')}"`;
          }).join(config.csvDelimiter)
      ).join("\n");
      content = config.showCsvHeaders ? headers + "\n" + rows : rows;
      finalFilename = config.csvFilename;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setRecentDownloads(prev => [
      { name: finalFilename, type: type.toUpperCase(), date: new Date().toLocaleTimeString(), url },
      ...prev.slice(0, 5)
    ]);
    
    setIsDownloading(null);
  };

  const enabledExportsCount = [config.exportJson, config.exportCsv, config.exportWoo, config.exportPresta].filter(Boolean).length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Centro Download</h2>
          <p className="text-slate-500 text-sm">Scarica i file simulati basati su {finalProductsForExport.length} prodotti selezionati.</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Stato Esportazione UI</span>
          <div className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-colors ${
            finalProductsForExport.length > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm shadow-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-200'
          }`}>
            {finalProductsForExport.length} record pronti
          </div>
        </div>
      </div>

      {enabledExportsCount === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 flex flex-col items-center text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-bold text-amber-900">Nessun export abilitato</h3>
            <p className="text-amber-700 max-w-md">Abilita i formati desiderati nella pagina <strong>Configurazione</strong>.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {config.exportJson && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all">
                <div className="bg-slate-100 p-4 rounded-full mb-4">
                    <FileJson className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="font-bold text-slate-800 mb-1">JSON Export</h3>
                <p className="text-xs text-slate-400 mb-6">{finalProductsForExport.length} record mappati</p>
                <button 
                  onClick={() => triggerDownload('json')} 
                  disabled={!!isDownloading}
                  className="w-full bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center transition-all shadow-lg shadow-slate-200"
                >
                  {isDownloading === 'json' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Download className="w-4 h-4 mr-2" /> Scarica JSON</>}
                </button>
            </div>
          )}

          {config.exportCsv && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all">
                <div className="bg-emerald-100 p-4 rounded-full mb-4">
                    <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-800 mb-1">CSV Generale</h3>
                <p className="text-xs text-slate-400 mb-6">Delimiter: "{config.csvDelimiter}"</p>
                <button 
                  onClick={() => triggerDownload('csv')} 
                  disabled={!!isDownloading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center transition-all shadow-lg shadow-emerald-100"
                >
                  {isDownloading === 'csv' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Download className="w-4 h-4 mr-2" /> Scarica CSV</>}
                </button>
            </div>
          )}

          {config.exportWoo && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all">
                <div className="bg-indigo-100 p-4 rounded-full mb-4">
                    <ShoppingCart className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="font-bold text-slate-800 mb-1">WooCommerce</h3>
                <p className="text-xs text-slate-400 mb-6">Mappatura automatica</p>
                <button 
                  onClick={() => triggerDownload('woo')} 
                  disabled={!!isDownloading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center transition-all shadow-lg shadow-indigo-100"
                >
                  {isDownloading === 'woo' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Download className="w-4 h-4 mr-2" /> Scarica Woo</>}
                </button>
            </div>
          )}

          {config.exportPresta && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all">
                <div className="bg-pink-100 p-4 rounded-full mb-4">
                    <Zap className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="font-bold text-slate-800 mb-1">PrestaShop</h3>
                <p className="text-xs text-slate-400 mb-6">Pronto per l'import</p>
                <button 
                  onClick={() => triggerDownload('presta')} 
                  disabled={!!isDownloading}
                  className="w-full bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center transition-all shadow-lg shadow-pink-100"
                >
                  {isDownloading === 'presta' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Download className="w-4 h-4 mr-2" /> Scarica Presta</>}
                </button>
            </div>
          )}
        </div>
      )}

      {recentDownloads.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
                <History className="w-5 h-5 text-slate-400 mr-2" />
                <h3 className="font-bold text-slate-800">Ultimi File Generati</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono italic">Link diretti (sessione corrente)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentDownloads.map((file, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-indigo-200 transition-colors">
                <div className="flex items-center min-w-0">
                  <div className="bg-white p-2 rounded-lg border border-slate-200 mr-3 shrink-0">
                    <FileText className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-slate-700 truncate block">{file.name}</span>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{file.type} • {file.date}</div>
                  </div>
                </div>
                <a 
                    href={file.url} 
                    download={file.name}
                    className="flex items-center text-indigo-600 text-[10px] font-bold uppercase tracking-wider bg-white border border-indigo-100 px-2.5 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1" /> Re-Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex items-start">
              <div className="bg-indigo-100 p-3 rounded-xl mr-4 shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                  <h4 className="font-bold text-indigo-900">Validazione Configurazione</h4>
                  <ul className="mt-2 space-y-1">
                    <li className="text-[11px] text-indigo-700 flex items-center">
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${config.ignoreLimit ? 'bg-amber-400' : 'bg-indigo-400'}`}></span>
                        Full Catalog (Ignore Limit): <strong>{config.ignoreLimit ? 'ATTIVO (Ignora Limiti)' : 'Disattivo'}</strong>
                    </li>
                    <li className="text-[11px] text-indigo-700 flex items-center">
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2"></span>
                        Filtri Attivi: <strong>{config.filterBrands.length + config.filterCategories.length + config.filterGenders.length} criteri</strong>
                    </li>
                  </ul>
              </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-center">
              <p className="text-xs text-slate-500 italic mb-2">
                  "L'anteprima JSON riflette ora la struttura finale basata sulla Mappatura Campi. Se un campo è 'N/A' nell'export, significa che non era presente nei dati simulati."
              </p>
              <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <span className="w-2 h-2 bg-slate-300 rounded-full mr-2 animate-pulse"></span> Sistema Pronto
              </div>
          </div>
      </div>
    </div>
  );
};

export default DownloadView;
