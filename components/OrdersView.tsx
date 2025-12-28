
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, History, User, Package, Trash2, Loader2, 
  RefreshCcw, Calendar, ShieldCheck, AlertCircle, Terminal, 
  ExternalLink, ArrowRight, ShieldAlert, CheckCircle
} from 'lucide-react';
import { AppConfig } from '../App';

interface OrderItem { ean: string; quantity: number; }
interface OrderRecord { id: string; customerName: string; date: string; status: string; total: number; tracking?: string; }

interface Props { config: AppConfig; }

const OrdersView: React.FC<Props> = ({ config }) => {
  const [view, setView] = useState<'send' | 'history'>('history');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [logs, setLogs] = useState<{msg: string, type: 'info' | 'success' | 'error'}[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  // Form State
  const [customer, setCustomer] = useState({ name: '', surname: '', address: '', city: '', zip: '', country: 'IT', email: '', phone: '' });
  const [items, setItems] = useState<OrderItem[]>([{ ean: '', quantity: 1 }]);

  useEffect(() => { if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [logs]);
  
  // Effettua il fetch automatico solo se il proxy è configurato
  useEffect(() => { if (config.proxyUrl) fetchRealHistory(); }, []);

  const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs(prev => [...prev, { msg, type }]);
  };

  /**
   * FUNZIONE PROXY FETCH
   * Invia le richieste al tuo script PHP invece che direttamente a NovaEngel
   */
  const proxyFetch = async (endpoint: string, method: string = 'GET', body: any = null) => {
    if (!config.proxyUrl) {
      addLog("ERRORE: Proxy URL non configurato nel tab Impostazioni!", "error");
      return null;
    }

    try {
      const response = await fetch(config.proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proxy_action: 'api_call',
          endpoint: endpoint,
          method: method,
          payload: body,
          // Le credenziali sono caricate dal PHP dal config.php, ma possiamo inviarle per sicurezza
          user: config.apiUser,
          password: config.apiPass
        })
      });

      if (!response.ok) throw new Error(`Errore Server Proxy: ${response.status}`);
      const data = await response.json();
      
      if (data.error || data.Error) {
        throw new Error(data.error || data.Error || "Errore sconosciuto via Proxy");
      }
      
      return data;
    } catch (err: any) {
      addLog(`FALLIMENTO PROXY: ${err.message}`, "error");
      return null;
    }
  };

  const fetchRealHistory = async () => {
    setIsSyncing(true);
    setLogs([]);
    addLog(`Richiesta elenco ordini via Proxy Server...`, "info");
    
    const result = await proxyFetch('/orders/list', 'GET', { from: dateRange.from, to: dateRange.to });

    if (result && Array.isArray(result)) {
      const mapped: OrderRecord[] = result.map((o: any) => ({
        id: o.OrderId || o.Id,
        customerName: o.CustomerName || `${o.Name || ''} ${o.Surname || ''}`.trim(),
        date: o.Date || o.CreatedAt,
        status: o.Status || "N/D",
        total: parseFloat(o.TotalAmount || 0),
        tracking: o.TrackingNumber
      }));
      setOrders(mapped);
      addLog(`Sincronizzazione completata: ${mapped.length} ordini trovati.`, "success");
    } else {
      addLog("Impossibile recuperare lo storico. Verifica URL Proxy e credenziali.", "error");
    }
    setIsSyncing(false);
  };

  const handleSendOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    addLog("Preparazione invio ordine reale via Proxy...", "info");

    const payload = {
      Customer: { ...customer },
      Lines: items.filter(i => i.ean.trim() !== '').map(i => ({ Ean: i.ean, Qty: i.quantity }))
    };

    const result = await proxyFetch('/orders/create', 'POST', payload);

    if (result && (result.OrderId || result.Id)) {
      addLog(`ORDINE CREATO CON SUCCESSO! ID: ${result.OrderId || result.Id}`, "success");
      setCustomer({ name: '', surname: '', address: '', city: '', zip: '', country: 'IT', email: '', phone: '' });
      setItems([{ ean: '', quantity: 1 }]);
      fetchRealHistory();
    } else {
      addLog("Errore durante la creazione dell'ordine reale.", "error");
    }
    setIsSending(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Centro Ordini NovaEngel</h2>
          <p className="text-slate-500 text-sm flex items-center">
            {config.proxyUrl ? (
              <span className="text-emerald-600 font-bold flex items-center"><CheckCircle className="w-3.5 h-3.5 mr-1" /> Connesso via Proxy ({config.apiUser})</span>
            ) : (
              <span className="text-rose-500 font-bold flex items-center"><ShieldAlert className="w-3.5 h-3.5 mr-1" /> Configura Proxy URL per iniziare</span>
            )}
          </p>
        </div>
        <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
          <button onClick={() => setView('send')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'send' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>Invia Ordine</button>
          <button onClick={() => setView('history')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'history' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>Storico Reale</button>
        </div>
      </div>

      {!config.proxyUrl && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
          <div>
            <h4 className="font-bold text-amber-900 mb-1">Configurazione Proxy Richiesta</h4>
            <p className="text-xs text-amber-800">Per operare sugli ordini senza errori CORS, devi caricare lo script PHP sul tuo server e inserire l'URL nel tab <strong>Configurazione</strong>.</p>
          </div>
        </div>
      )}

      {view === 'send' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form onSubmit={handleSendOrder} className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
               <span className="font-bold text-slate-700 flex items-center"><User className="w-4 h-4 mr-2" /> Dati Cliente</span>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="Nome" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                <input required placeholder="Cognome" value={customer.surname} onChange={e => setCustomer({...customer, surname: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                <input required placeholder="Indirizzo" className="md:col-span-2 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} />
                <div className="grid grid-cols-2 gap-4 md:col-span-2">
                  <input required placeholder="Città" value={customer.city} onChange={e => setCustomer({...customer, city: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                  <input required placeholder="CAP" value={customer.zip} onChange={e => setCustomer({...customer, zip: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 border-t border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-700 flex items-center"><Package className="w-4 h-4 mr-2" /> Righe Ordine</span>
              <button type="button" onClick={() => setItems([...items, { ean: '', quantity: 1 }])} className="text-[10px] font-bold uppercase bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">Aggiungi EAN</button>
            </div>
            <div className="p-6 space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <input required placeholder="EAN Prodotto" value={item.ean} onChange={e => { const n = [...items]; n[idx].ean = e.target.value; setItems(n); }} className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm" />
                  <input required type="number" min="1" value={item.quantity} onChange={e => { const n = [...items]; n[idx].quantity = parseInt(e.target.value); setItems(n); }} className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-center" />
                  <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))} disabled={items.length === 1} className="text-slate-300 hover:text-rose-500 disabled:opacity-0 transition-colors"><Trash2 className="w-5 h-5" /></button>
                </div>
              ))}
            </div>
            <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-end">
              <button type="submit" disabled={isSending || !config.proxyUrl} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold flex items-center shadow-lg active:scale-95 transition-all">
                {isSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />} Invia Ordine Reale
              </button>
            </div>
          </form>
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 font-mono text-[11px] h-[550px] overflow-y-auto custom-scrollbar shadow-2xl">
             <div className="flex items-center text-emerald-400 mb-4 border-b border-slate-800 pb-2 uppercase tracking-widest text-[10px] font-bold"><Terminal className="w-4 h-4 mr-2" /> Proxy Monitor</div>
             {logs.length === 0 ? <div className="text-slate-600 italic">In attesa di operazioni...</div> : logs.map((log, i) => (
                <div key={i} className={`mb-1 ${log.type === 'error' ? 'text-rose-400' : log.type === 'success' ? 'text-emerald-400' : 'text-slate-400'}`}>
                  <span className="opacity-40">[{new Date().toLocaleTimeString()}]</span> {log.msg}
                </div>
             ))}
             <div ref={logEndRef} />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
                <Calendar className="w-3.5 h-3.5 text-slate-400 mr-2" />
                <div className="flex items-center gap-2">
                  <input type="date" value={dateRange.from} onChange={e => setDateRange({...dateRange, from: e.target.value})} className="text-xs font-bold text-slate-600 outline-none bg-transparent" />
                  <span className="text-slate-300">/</span>
                  <input type="date" value={dateRange.to} onChange={e => setDateRange({...dateRange, to: e.target.value})} className="text-xs font-bold text-slate-600 outline-none bg-transparent" />
                </div>
            </div>
            <button onClick={fetchRealHistory} disabled={isSyncing || !config.proxyUrl} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-indigo-700 transition-all disabled:opacity-50">
              {isSyncing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCcw className="w-4 h-4 mr-1" />} Sincronizza Storico
            </button>
          </div>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
              <thead className="bg-slate-50/80 sticky top-0 z-10 border-b border-slate-200 text-[10px] uppercase text-slate-400 font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4">ID Ordine</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Data Invio</th>
                  <th className="px-6 py-4">Stato API</th>
                  <th className="px-6 py-4">Importo</th>
                  <th className="px-6 py-4">Tracking Number</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">Nessun ordine trovato. Assicurati che il Proxy URL sia corretto.</td></tr>
                ) : orders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-600">{o.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{o.customerName}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs">{o.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${o.status.includes('Shipped') ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>{o.status}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">€{o.total.toFixed(2)}</td>
                    <td className="px-6 py-4 font-mono text-[10px] text-slate-400">{o.tracking || "In elaborazione"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }`}</style>
    </div>
  );
};

export default OrdersView;
