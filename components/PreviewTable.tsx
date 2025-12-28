
import React, { useState, useMemo } from 'react';
import { Tag, Image as ImageIcon, CheckCircle2, List, Eye, AlertCircle, Zap, XCircle } from 'lucide-react';
import { AppConfig } from '../App';

// Shared mock data logic - Sincronizzato con EXPORT_FIELDS in ConfigView
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
    
    // Oggetto mappato esattamente secondo gli ID di EXPORT_FIELDS
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
      // Campi interni per i filtri della dashboard
      "_raw_families": [cat, gender],
      "_raw_subfamilies": [sub]
    };
  });
};

const ALL_MOCK_PRODUCTS = generateMockProducts(500);

interface Props {
  config: AppConfig;
}

const PreviewTable: React.FC<Props> = ({ config }) => {
  const [selectedJsonIndex, setSelectedJsonIndex] = useState(0);

  const filteredProducts = useMemo(() => {
    let list = ALL_MOCK_PRODUCTS.filter(p => {
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
      list = list.slice(0, config.productLimit);
    }
    return list;
  }, [config.filterBrands, config.filterGenders, config.filterMinStock, config.filterCategories, config.productLimit, config.ignoreLimit]);

  const selectedProduct = filteredProducts[selectedJsonIndex];

  // Validation Logic: Verifica se i campi selezionati esistono effettivamente nei dati
  const fieldValidation = useMemo(() => {
    if (!selectedProduct) return { missing: [], valid: [] };
    const missing: string[] = [];
    const valid: string[] = [];
    
    config.selectedFields.forEach(field => {
      if ((selectedProduct as any)[field] === undefined) {
        missing.push(field);
      } else {
        valid.push(field);
      }
    });
    return { missing, valid };
  }, [selectedProduct, config.selectedFields]);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Preview Export</h2>
          <p className="text-slate-500 text-sm">Visualizza i dati mappati basati su {filteredProducts.length} record trovati.</p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold border border-emerald-100 shadow-sm shadow-emerald-50">
          <CheckCircle2 className="w-4 h-4" />
          <span>{filteredProducts.length} Prodotti Trovati</span>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-12 flex flex-col items-center text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
          <h3 className="text-lg font-bold text-amber-900">Nessun prodotto corrisponde ai filtri</h3>
          <p className="text-amber-700">Modifica i filtri nella sezione "Filtri & Performance" per visualizzare i prodotti.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center font-bold text-slate-700 text-sm">
                    <List className="w-4 h-4 mr-2 text-indigo-500" /> Anteprima Listino
                </div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ispezione dati per export</div>
            </div>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider">Brand / Nome</th>
                    <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider">Prezzo</th>
                    <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-center">Stock</th>
                    <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider">Status Validazione</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p, idx) => (
                    <tr 
                        key={p.Id} 
                        onClick={() => setSelectedJsonIndex(idx)}
                        className={`group hover:bg-indigo-50/50 transition-all cursor-pointer ${selectedJsonIndex === idx ? 'bg-indigo-50' : ''}`}
                    >
                      <td className="px-6 py-4 font-mono text-slate-400 font-medium">{p.Id}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{p.BrandName}</span>
                          <span className="text-slate-500 max-w-[220px] truncate">{p.Description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">€{p.Price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-center font-mono font-bold text-[10px]">{p.Stock}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          <span className="text-[10px] font-bold uppercase">Struttura OK</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                          <Eye className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h3 className="font-bold text-slate-800">Ispezione Record JSON</h3>
                    </div>
                </div>
                {selectedProduct && (
                  <div className="bg-slate-900 rounded-xl p-6 text-indigo-300 font-mono text-[11px] leading-relaxed whitespace-pre overflow-x-auto flex-grow max-h-[500px] custom-scrollbar border border-slate-800 shadow-inner">
                    {JSON.stringify(selectedProduct, null, 2)}
                  </div>
                )}
            </div>

            <div className="space-y-6">
                <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                    <h3 className="text-lg font-bold mb-4 flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-emerald-400" />
                      Validazione Campi Export
                    </h3>
                    
                    {fieldValidation.missing.length > 0 && (
                      <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-rose-200 uppercase mb-1">Campi Mancanti nei Dati</p>
                          <p className="text-[11px] text-rose-300/80 leading-relaxed">
                            I seguenti campi sono stati selezionati per l'export ma non sono stati trovati nell'oggetto JSON del prodotto. Verificare la mappatura.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                        {config.selectedFields.map(field => {
                          const isMissing = fieldValidation.missing.includes(field);
                          return (
                            <div key={field} className={`flex items-center justify-between text-[11px] py-1 border-b ${isMissing ? 'border-rose-500/20' : 'border-white/5'}`}>
                              <span className={isMissing ? 'text-rose-400 font-bold' : 'text-slate-400'}>{field}</span>
                              <div className="flex items-center">
                                {isMissing ? (
                                  <>
                                    <AlertCircle className="w-3 h-3 text-rose-500 mr-1" />
                                    <span className="text-rose-500 font-mono font-bold">MISSING</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400 mr-1" />
                                    <span className="text-emerald-400 font-mono font-bold">VALID</span>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 text-amber-500" /> Suggerimento Engineering
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Ogni campo configurato nella **Mappatura Campi** deve avere una chiave corrispondente nel JSON dell'API. Se vedi un errore "MISSING", significa che il campo non è presente nella risposta grezza del server.
                    </p>
                </div>
            </div>
          </div>
        </>
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default PreviewTable;
