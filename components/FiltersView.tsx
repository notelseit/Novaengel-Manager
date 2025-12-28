
import React, { useState, useMemo } from 'react';
import { AppConfig } from '../App';
import { Filter, Tag, LayoutGrid, Users, CheckSquare, Square, ListOrdered, ToggleRight, ToggleLeft, Search } from 'lucide-react';

interface Props {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}

const AVAILABLE_BRANDS = [
  "Adolfo Dominguez", "Biotherm", "Carolina Herrera", "Clinique", "Estee Lauder", 
  "Hugo Boss", "Lancome", "L'Oreal", "Maybelline", "Shiseido", "Giorgio Armani", 
  "Paco Rabanne", "Yves Saint Laurent", "Calvin Klein", "Dolce & Gabbana", 
  "Bvlgari", "Hermes", "Prada", "Mugler", "Jean Paul Gaultier", "Versace", 
  "Narciso Rodriguez", "Elie Saab", "Issey Miyake", "Chloe", "Burberry", 
  "Coach", "Jimmy Choo", "Montblanc", "Michael Kors", "Guerlain", "Clarins"
].sort();

const AVAILABLE_CATEGORIES = [
  "Perfumes", "Skincare", "Cosmetics", "Haircare", "Hygiene", "Solar", 
  "Accessories", "Men", "Women", "Unisex", "Kids", "Professional", 
  "Treatment", "Face", "Eyes", "Anti-aging", "Serum"
].sort();

const AVAILABLE_GENDERS = ["Male", "Female", "Unisex", "Kids"];

const AVAILABLE_SUBCATEGORIES = [
  "Fragrance", "Moisturizer", "Serum", "Face Cream", "Mask", "Cleanser", 
  "Toner", "Eye Contour", "Sunscreen", "After Sun", "Shampoo", "Conditioner", 
  "Foundation", "Mascara", "Lipstick", "Eyeliner", "Blush", "Powder", 
  "Nail Polish", "Premium Fragrance", "EDT", "EDP"
].sort();

const FiltersView: React.FC<Props> = ({ config, setConfig }) => {
  const [brandSearch, setBrandSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [subcategorySearch, setSubcategorySearch] = useState("");

  const filteredBrands = useMemo(() => {
    return AVAILABLE_BRANDS.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()));
  }, [brandSearch]);

  const filteredCategories = useMemo(() => {
    return AVAILABLE_CATEGORIES.filter(c => c.toLowerCase().includes(categorySearch.toLowerCase()));
  }, [categorySearch]);

  const filteredSubcategories = useMemo(() => {
    return AVAILABLE_SUBCATEGORIES.filter(s => s.toLowerCase().includes(subcategorySearch.toLowerCase()));
  }, [subcategorySearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : (type === 'number' ? parseFloat(value) : value)
    }));
  };

  const toggleMultiFilter = (key: 'filterBrands' | 'filterCategories' | 'filterGenders' | 'filterSubcategories', value: string) => {
    setConfig(prev => {
      const current = prev[key] as string[];
      if (current.includes(value)) {
        return { ...prev, [key]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [key]: [...current, value] };
      }
    });
  };

  const clearFilter = (key: 'filterBrands' | 'filterCategories' | 'filterGenders' | 'filterSubcategories') => {
    setConfig(prev => ({ ...prev, [key]: [] }));
  };

  const toggleIgnoreLimit = () => {
    setConfig(prev => ({ ...prev, ignoreLimit: !prev.ignoreLimit }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Filtri & Performance</h2>
          <p className="text-slate-500 text-sm">Personalizza i criteri di selezione e ottimizza il volume dell'export.</p>
        </div>
        <button 
          onClick={toggleIgnoreLimit}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl border transition-all ${
            config.ignoreLimit 
              ? 'bg-indigo-600 border-indigo-700 text-white shadow-lg shadow-indigo-100' 
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          {config.ignoreLimit ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
          <span className="text-xs font-bold uppercase tracking-wider">Ignora Limiti (Catalogo Completo)</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center mb-8">
          <div className="bg-orange-100 p-2.5 rounded-xl mr-4 shadow-sm">
            <Filter className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg leading-none mb-1">Parametri di Generazione</h3>
            <p className="text-xs text-slate-400 font-medium italic">Configura il volume di dati processati dallo script PHP.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className={`${config.ignoreLimit ? 'opacity-40 grayscale pointer-events-none' : ''} transition-all`}>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider flex items-center">
              <ListOrdered className="w-3.5 h-3.5 mr-1.5" /> Limite Prodotti Manuale
            </label>
            <input 
              type="number" 
              name="productLimit" 
              value={config.productLimit} 
              onChange={handleChange} 
              placeholder="0 = Tutti"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/20 font-medium" 
            />
            <p className="text-[10px] text-slate-400 mt-2 italic font-medium">Ignorato se "Catalogo Completo" è attivo.</p>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">Scorte Minime (Stock)</label>
            <input type="number" name="filterMinStock" value={config.filterMinStock} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/20 font-medium" />
            <p className="text-[10px] text-slate-400 mt-2 italic font-medium">Esporta solo prodotti con stock ≥ valore.</p>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">Performance (Rate Limit Delay)</label>
            <input type="number" step="0.1" name="rateLimitDelay" value={config.rateLimitDelay} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/20 font-medium" />
            <p className="text-[10px] text-slate-400 mt-2 italic font-medium">Ritardo in secondi tra chiamate API.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Brands Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center">
                  <Tag className="w-3.5 h-3.5 mr-1.5" /> Brand Disponibili ({config.filterBrands.length} selezionati)
                </label>
                {config.filterBrands.length > 0 && (
                  <button onClick={() => clearFilter('filterBrands')} className="text-[10px] text-rose-500 font-bold hover:underline">Resetta</button>
                )}
              </div>
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-orange-500" />
                <input 
                  type="text" 
                  placeholder="Cerca brand..." 
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5 max-h-64 overflow-y-auto p-3 bg-slate-50 rounded-2xl border border-slate-100 custom-scrollbar">
                {filteredBrands.length > 0 ? filteredBrands.map(brand => (
                  <button key={brand} onClick={() => toggleMultiFilter('filterBrands', brand)} className={`flex items-center px-3 py-2.5 rounded-xl text-[11px] transition-all border ${config.filterBrands.includes(brand) ? 'bg-orange-50 border-orange-200 text-orange-700 font-bold ring-1 ring-orange-200' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}>
                    {config.filterBrands.includes(brand) ? <CheckSquare className="w-3.5 h-3.5 mr-2.5" /> : <Square className="w-3.5 h-3.5 mr-2.5" />}
                    {brand}
                  </button>
                )) : (
                  <div className="col-span-2 py-8 text-center text-slate-400 text-xs italic">Nessun brand trovato</div>
                )}
              </div>
            </div>

            {/* Categories Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center">
                  <LayoutGrid className="w-3.5 h-3.5 mr-1.5" /> Categorie Disponibili ({config.filterCategories.length} selezionate)
                </label>
                {config.filterCategories.length > 0 && (
                  <button onClick={() => clearFilter('filterCategories')} className="text-[10px] text-rose-500 font-bold hover:underline">Resetta</button>
                )}
              </div>
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-orange-500" />
                <input 
                  type="text" 
                  placeholder="Cerca categoria..." 
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5 max-h-64 overflow-y-auto p-3 bg-slate-50 rounded-2xl border border-slate-100 custom-scrollbar">
                {filteredCategories.length > 0 ? filteredCategories.map(cat => (
                  <button key={cat} onClick={() => toggleMultiFilter('filterCategories', cat)} className={`flex items-center px-3 py-2.5 rounded-xl text-[11px] transition-all border ${config.filterCategories.includes(cat) ? 'bg-orange-50 border-orange-200 text-orange-700 font-bold ring-1 ring-orange-200' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}>
                    {config.filterCategories.includes(cat) ? <CheckSquare className="w-3.5 h-3.5 mr-2.5" /> : <Square className="w-3.5 h-3.5 mr-2.5" />}
                    {cat}
                  </button>
                )) : (
                  <div className="col-span-2 py-8 text-center text-slate-400 text-xs italic">Nessuna categoria trovata</div>
                )}
              </div>
            </div>

            {/* Gender Selection */}
            <div className="space-y-4">
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center">
                <Users className="w-3.5 h-3.5 mr-1.5" /> Filtro Genere
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                {AVAILABLE_GENDERS.map(gen => (
                  <button key={gen} onClick={() => toggleMultiFilter('filterGenders', gen)} className={`flex items-center px-3 py-2.5 rounded-xl text-[11px] transition-all border ${config.filterGenders.includes(gen) ? 'bg-orange-50 border-orange-200 text-orange-700 font-bold ring-1 ring-orange-200' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}>
                    {config.filterGenders.includes(gen) ? <CheckSquare className="w-3.5 h-3.5 mr-2.5" /> : <Square className="w-3.5 h-3.5 mr-2.5" />}
                    {gen}
                  </button>
                ))}
              </div>
            </div>

            {/* Subcategories Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center">
                  <LayoutGrid className="w-3.5 h-3.5 mr-1.5" /> Sottocategorie Disponibili ({config.filterSubcategories.length} selezionate)
                </label>
                {config.filterSubcategories.length > 0 && (
                  <button onClick={() => clearFilter('filterSubcategories')} className="text-[10px] text-rose-500 font-bold hover:underline">Resetta</button>
                )}
              </div>
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-orange-500" />
                <input 
                  type="text" 
                  placeholder="Cerca sottocategoria..." 
                  value={subcategorySearch}
                  onChange={(e) => setSubcategorySearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5 max-h-64 overflow-y-auto p-3 bg-slate-50 rounded-2xl border border-slate-100 custom-scrollbar">
                {filteredSubcategories.length > 0 ? filteredSubcategories.map(sub => (
                  <button key={sub} onClick={() => toggleMultiFilter('filterSubcategories', sub)} className={`flex items-center px-3 py-2.5 rounded-xl text-[11px] transition-all border ${config.filterSubcategories.includes(sub) ? 'bg-orange-50 border-orange-200 text-orange-700 font-bold ring-1 ring-orange-200' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}>
                    {config.filterSubcategories.includes(sub) ? <CheckSquare className="w-3.5 h-3.5 mr-2.5" /> : <Square className="w-3.5 h-3.5 mr-2.5" />}
                    {sub}
                  </button>
                )) : (
                  <div className="col-span-2 py-8 text-center text-slate-400 text-xs italic">Nessuna sottocategoria trovata</div>
                )}
              </div>
            </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default FiltersView;
