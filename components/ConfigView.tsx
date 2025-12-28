
import React, { useState } from 'react';
import { AppConfig, ExportProfile } from '../App';
import { 
  ShieldCheck, ShoppingCart, Zap, Globe, User, Lock, 
  Folder, CheckCircle2, FileCode, 
  Star, FileEdit, Settings2, ToggleRight,
  FileType, Layout, List, HardDrive, Share2
} from 'lucide-react';

interface Props {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}

const EXPORT_FIELDS = [
  { id: "Id", label: "Id", desc: "ID univoco prodotto" },
  { id: "EANs", label: "EANs", desc: "Codici EAN" },
  { id: "Description", label: "Description", desc: "Nome/Descrizione breve" },
  { id: "SetContent", label: "SetContent", desc: "Contenuto del set" },
  { id: "Price", label: "Price", desc: "Prezzo acquisto" },
  { id: "PVR", label: "PVR", desc: "Prezzo consigliato (RRP)" },
  { id: "Stock", label: "Stock", desc: "Giacenza totale" },
  { id: "BrandId", label: "BrandId", desc: "ID del Marchio" },
  { id: "BrandName", label: "BrandName", desc: "Nome del Marchio" },
  { id: "LineaId", label: "LineaId", desc: "ID della Linea" },
  { id: "LineaName", label: "LineaName", desc: "Nome della Linea" },
  { id: "Gender", label: "Gender", desc: "Genere prodotto" },
  { id: "Families", label: "Families", desc: "Categorie principali" },
  { id: "IVA", label: "IVA", desc: "Aliquota IVA" },
  { id: "Kgs", label: "Kgs", desc: "Peso in Kg" },
  { id: "Ancho", label: "Ancho", desc: "Larghezza (mm)" },
  { id: "Alto", label: "Alto", desc: "Altezza (mm)" },
  { id: "Fondo", label: "Fondo", desc: "Profondità (mm)" },
  { id: "Fecha", label: "Fecha", desc: "Data creazione" },
  { id: "Contenido", label: "Contenido", desc: "Capacità (ml/oz)" },
  { id: "Gama", label: "Gama", desc: "Gamma prodotto" },
  { id: "ItemId", label: "ItemId", desc: "ID Item interno" },
  { id: "Properties", label: "Properties", desc: "Proprietà tecniche" },
  { id: "Tags", label: "Tags", desc: "Tag marketing" },
  { id: "CompleteFamilies", label: "CompleteFamilies", desc: "Albero categorie completo" },
  { id: "Novedad", label: "Novedad", desc: "Flag Novità (Boolean)" },
  { id: "EsOferta", label: "EsOferta", desc: "Flag Offerta" },
  { id: "FechaFinalOferta", label: "FechaFinalOferta", desc: "Fine promozione" },
  { id: "PaisFabricacion", label: "PaisFabricacion", desc: "Paese produzione" },
  { id: "Ingredientes", label: "Ingredientes", desc: "INCI / Ingredienti" },
  { id: "NombreColor", label: "NombreColor", desc: "Variante Colore" },
  { id: "CompleteDescription", label: "CompleteDescription", desc: "Descrizione estesa" },
  { id: "Image", label: "Image", desc: "URL Immagine mappata" }
];

const PRESET_PROFILES: ExportProfile[] = [
  { id: 'std', name: 'Sync Standard', fields: ['Id', 'EANs', 'Description', 'Price', 'Stock', 'BrandName', 'Image'] },
  { id: 'market', name: 'Marketing Full', fields: ['Id', 'EANs', 'Description', 'CompleteDescription', 'BrandName', 'Ingredientes', 'Image', 'Tags'] },
  { id: 'full', name: 'Tutti i 33 Campi', fields: EXPORT_FIELDS.map(f => f.id) }
];

const ConfigView: React.FC<Props> = ({ config, setConfig }) => {
  const [profileName, setProfileName] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : (type === 'number' ? parseFloat(value) : value)
    }));
  };

  const toggleField = (fieldId: string) => {
    setConfig(prev => {
      const selected = prev.selectedFields.includes(fieldId)
        ? prev.selectedFields.filter(f => f !== fieldId)
        : [...prev.selectedFields, fieldId];
      return { ...prev, selectedFields: selected };
    });
  };

  const applyProfile = (fields: string[]) => {
    setConfig(prev => ({ ...prev, selectedFields: fields }));
  };

  const saveProfile = () => {
    if (!profileName.trim()) return;
    const newProfile: ExportProfile = { id: Date.now().toString(), name: profileName, fields: [...config.selectedFields] };
    setConfig(prev => ({ ...prev, customProfiles: [newProfile, ...prev.customProfiles] }));
    setProfileName("");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Impostazioni Avanzate</h2>
        <p className="text-slate-500 text-sm">Configura abilitazioni, percorsi e mappatura completa dei 33 campi API.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* API & Percorsi */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center mb-6">
              <div className="bg-emerald-100 p-2 rounded-lg mr-3"><ShieldCheck className="w-5 h-5 text-emerald-600" /></div>
              <h3 className="font-bold text-slate-800">Credenziali & Proxy</h3>
            </div>
            <div className="space-y-4">
              <input type="text" name="apiBaseUrl" value={config.apiBaseUrl} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs" placeholder="API Base URL" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="apiUser" value={config.apiUser} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs" placeholder="User" />
                <input type="password" name="apiPass" value={config.apiPass} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs" placeholder="Password" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Proxy Script URL (bypass CORS)</label>
                <input type="text" name="proxyUrl" value={config.proxyUrl} onChange={handleChange} className="w-full bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 text-xs text-indigo-700 font-mono" placeholder="https://tuosito.it/nova/export.php" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 p-2 rounded-lg mr-3"><Folder className="w-5 h-5 text-blue-600" /></div>
              <h3 className="font-bold text-slate-800">Percorsi Remoti (Server)</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Directory Principale (Root)</label>
                <input type="text" name="saveDir" value={config.saveDir} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-mono" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Cartella Esportazioni (Output)</label>
                <input type="text" name="outputPath" value={config.outputPath} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-mono" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Cartella Immagini Locali</label>
                <input type="text" name="imgDownloadPath" value={config.imgDownloadPath} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-mono" />
              </div>
            </div>
          </div>
        </div>

        {/* Abilitazioni & File Names */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center mb-6">
              <div className="bg-amber-100 p-2 rounded-lg mr-3"><ToggleRight className="w-5 h-5 text-amber-600" /></div>
              <h3 className="font-bold text-slate-800">Abilitazione Export</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'exportJson', label: 'JSON Catalog' }, { id: 'exportCsv', label: 'CSV Generic' },
                { id: 'exportWoo', label: 'WordPress / Woo' }, { id: 'exportPresta', label: 'PrestaShop' }
              ].map(item => (
                <label key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:border-amber-200 transition-colors">
                  <span className="text-xs font-semibold">{item.label}</span>
                  <input type="checkbox" name={item.id} checked={(config as any)[item.id]} onChange={handleChange} className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500" />
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center mb-6">
              <div className="bg-violet-100 p-2 rounded-lg mr-3"><FileEdit className="w-5 h-5 text-violet-600" /></div>
              <h3 className="font-bold text-slate-800">Nomi File Personalizzati</h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-16 text-[10px] font-bold text-slate-400 uppercase tracking-wider">JSON</div>
                <input type="text" name="jsonFilename" value={config.jsonFilename} onChange={handleChange} className="flex-grow bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-16 text-[10px] font-bold text-slate-400 uppercase tracking-wider">CSV</div>
                <input type="text" name="csvFilename" value={config.csvFilename} onChange={handleChange} className="flex-grow bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-16 text-[10px] font-bold text-slate-400 uppercase tracking-wider">WOO</div>
                <input type="text" name="wooFilename" value={config.wooFilename} onChange={handleChange} className="flex-grow bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-16 text-[10px] font-bold text-slate-400 uppercase tracking-wider">PRESTA</div>
                <input type="text" name="prestaFilename" value={config.prestaFilename} onChange={handleChange} className="flex-grow bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center mb-6">
              <div className="bg-indigo-100 p-2 rounded-lg mr-3"><FileType className="w-5 h-5 text-indigo-600" /></div>
              <h3 className="font-bold text-slate-800">Configurazione Formato</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <label className="text-xs font-semibold text-slate-700">Delimitatore CSV</label>
                <input type="text" name="csvDelimiter" value={config.csvDelimiter} onChange={handleChange} className="w-12 text-center bg-white border border-slate-200 rounded-lg py-1 text-xs font-bold" />
              </div>
              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer">
                <span className="text-xs font-semibold text-slate-700">Intestazioni CSV</span>
                <input type="checkbox" name="showCsvHeaders" checked={config.showCsvHeaders} onChange={handleChange} className="w-4 h-4 rounded text-indigo-600" />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Mappatura Campi Export - 33 Fields */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-xl mr-4 shadow-sm"><Settings2 className="w-6 h-6 text-orange-600" /></div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Mappatura Campi Export (33 Campi Disponibili)</h3>
              <p className="text-xs text-slate-400 font-medium">Seleziona quali parametri dell'API NovaEngel includere nei file generati.</p>
            </div>
          </div>
          <div className="flex gap-2">
            {PRESET_PROFILES.map(p => (
              <button key={p.id} onClick={() => applyProfile(p.fields)} className="text-[10px] font-bold uppercase px-4 py-2 bg-slate-100 hover:bg-orange-600 hover:text-white rounded-xl transition-all shadow-sm">
                {p.name}
              </button>
            ))}
            <button onClick={() => applyProfile([])} className="text-[10px] font-bold uppercase px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all border border-rose-100">Pulisci</button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {EXPORT_FIELDS.map(f => {
            const isSelected = config.selectedFields.includes(f.id);
            return (
              <button
                key={f.id}
                onClick={() => toggleField(f.id)}
                className={`group flex flex-col items-start p-3 rounded-xl border transition-all text-left relative overflow-hidden ${
                  isSelected ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-100' : 'bg-white border-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-indigo-700' : 'text-slate-400'}`}>{f.label}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                </div>
                <span className="text-[9px] text-slate-400 leading-tight line-clamp-1">{f.desc}</span>
                {isSelected && <div className="absolute top-0 right-0 w-2 h-full bg-indigo-500/10"></div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ConfigView;
