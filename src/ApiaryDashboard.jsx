import React, { useState, useEffect } from 'react';
import { 
  History, ShieldCheck, Zap, Plus, Download, 
  BarChart3, RefreshCw, Trash2, UserPlus, MessageSquare, Send, Code, Target, FileJson, X
} from 'lucide-react';
import { db } from "./firebaseConfig.js";
import { 
  collection, onSnapshot, query, orderBy, limit, 
  addDoc, doc, updateDoc, deleteDoc, arrayUnion 
} from 'firebase/firestore';

// // [BEE_HOOK: BEE_DISPLAY_COMPONENT]
const BeeDisplay = ({ type, status, isWorking }) => {
  const colors = { scout: 'text-blue-400', forager: 'text-emerald-400', builder: 'text-amber-400' };
  return (
    <div className={`flex items-center gap-4 group transition-all ${isWorking ? 'scale-110' : ''}`}>
      <div className="relative flex items-center justify-center">
        <div className={`absolute -top-2 -left-1 w-4 h-2 bg-white/20 rounded-full border border-white/10 rotate-45 ${isWorking ? 'animate-ping' : 'animate-pulse'}`}></div>
        <div className={`absolute -top-2 -right-1 w-4 h-2 bg-white/20 rounded-full border border-white/10 -rotate-45 ${isWorking ? 'animate-ping' : 'animate-pulse'}`}></div>
        <div className={`${colors[type]} relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] ${isWorking ? 'animate-bounce' : ''}`}>
          <Zap size={22} className={`fill-current ${isWorking ? 'rotate-12' : 'rotate-180'}`} />
        </div>
      </div>
      <div className={`flex flex-col bg-black/80 backdrop-blur-xl border p-2 px-4 rounded-xl border-l-4 min-w-[160px] shadow-2xl transition-all ${isWorking ? 'border-white border-l-white shadow-emerald-500/10' : 'border-zinc-800 border-l-current'}`}>
        <div className="flex justify-between items-center mb-0.5">
          <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${isWorking ? 'text-white' : colors[type]}`}>{type} Bee</span>
          <div className={`w-1.5 h-1.5 rounded-full bg-current ${isWorking ? 'animate-ping' : ''}`}></div>
        </div>
        <span className="text-[10px] font-bold text-slate-200 uppercase italic tracking-tight truncate">{status}</span>
      </div>
    </div>
  );
};  

const ApiaryDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [newTicket, setNewTicket] = useState({ title: '', description: '', priority: 'Med', project: 'GreenStack' });
  const [commentText, setCommentText] = useState({});
  const [deployPath, setDeployPath] = useState({});
  const [deployAnchor, setDeployAnchor] = useState({});
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Bulk Import State
  const [showImport, setShowImport] = useState(false);
  const [importJson, setImportJson] = useState("");

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "tickets"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (snap) => {
      setIsSyncing(true);
      setTickets(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTimeout(() => setIsSyncing(false), 1200);
    });
  }, []);

  const createTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.title.trim()) return;
    await addDoc(collection(db, "tickets"), {
      ...newTicket,
      displayId: `T-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      status: 'Backlog',
      assignedAgent: 'none',
      workLog: [`Mission initialized for ${newTicket.project}`]
    });
    setNewTicket({ title: '', description: '', priority: 'Med', project: 'GreenStack' });
  };

  const handleBulkImport = async () => {
    try {
      const data = JSON.parse(importJson);
      const missions = Array.isArray(data) ? data : [data];
      for (const m of missions) {
        await addDoc(collection(db, "tickets"), {
          ...m,
          displayId: m.displayId || `T-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: new Date().toISOString(),
          status: m.status || 'Backlog',
          assignedAgent: m.assignedAgent || 'builder',
          workLog: m.workLog || ["[SYSTEM] Bulk intake pollination successful."]
        });
      }
      setShowImport(false);
      setImportJson("");
    } catch (e) {
      alert("Malformed JSON Seed Packet.");
    }
  };

  const handleDeploy = async (ticketId) => {
    const path = deployPath[ticketId];
    const anchor = deployAnchor[ticketId] || "NONE";
    const code = commentText[ticketId];
    if (!code || !path) return alert("Bee needs a filename and code to pollinate.");

    const deployString = `[DEPLOY_CODE] filename: ${path} | anchor: ${anchor} | code: ${code}`;
    
    await updateDoc(doc(db, "tickets", ticketId), {
      status: 'In Progress',
      assignedAgent: 'builder',
      workLog: arrayUnion(deployString)
    });
    setCommentText({ ...commentText, [ticketId]: '' });
  };

  const updateStatus = async (id, current) => {
    const cycle = ['Backlog', 'In Progress', 'Testing', 'Done'];
    const next = cycle[(cycle.indexOf(current) + 1) % cycle.length];
    await updateDoc(doc(db, "tickets", id), { status: next });
  };

  const deleteTicket = async (id) => {
    if (window.confirm("Purge mission from Hive?")) await deleteDoc(doc(db, "tickets", id));
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-10 font-sans selection:bg-emerald-500/30">
      <header className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-slate-800 pb-8 gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            <Zap className="text-slate-950 fill-current" size={32} />
          </div>
          <h1 className="text-5xl font-black italic text-white uppercase tracking-tighter">APIARY v5.0</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-5 py-3 rounded-2xl transition-all"
          >
            <FileJson size={18} className="text-blue-400" />
            <span className="text-xs font-black uppercase tracking-widest text-blue-400">Bulk Intake</span>
          </button>
          <div className="bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl flex items-center gap-4">
            <ShieldCheck className="text-emerald-500" size={20} />
            <span className="text-xs font-black text-emerald-400 tracking-widest uppercase">Hive Online</span>
          </div>
        </div>
      </header>

      {/* BULK IMPORT MODAL */}
      {showImport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#020617]/90 backdrop-blur-xl">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[2.5rem] p-10 shadow-3xl relative">
            <button onClick={() => setShowImport(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X /></button>
            <h2 className="text-2xl font-black text-white uppercase italic mb-2 tracking-tighter">Mission Seed Intake</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">Paste JSON Packet from Oracle</p>
            <textarea 
              value={importJson} 
              onChange={(e) => setImportJson(e.target.value)}
              placeholder='[{"title": "Sample Mission", "project": "GreenStack"}]'
              className="w-full h-64 bg-slate-950 border border-slate-800 rounded-2xl p-6 text-emerald-400 font-mono text-xs mb-6 focus:border-blue-500 outline-none shadow-inner"
            />
            <button onClick={handleBulkImport} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all">Plant Missions in Hive</button>
          </div>
        </div>
      )}

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-32">
        <section className="lg:col-span-12 space-y-8">
          {/* STANDARD INTAKE */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem]">
            <form onSubmit={createTicket} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input value={newTicket.title} onChange={(e) => setNewTicket({...newTicket, title: e.target.value})} placeholder="Mission Objective..." className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-sm text-white focus:border-blue-500 outline-none" />
                <select value={newTicket.project} onChange={(e) => setNewTicket({...newTicket, project: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-sm text-white font-black uppercase tracking-tighter cursor-pointer appearance-none">
                  <option value="GreenStack">GreenStack</option>
                  <option value="Apiary">Apiary</option>
                </select>
              </div>
              <textarea value={newTicket.description} onChange={(e) => setNewTicket({...newTicket, description: e.target.value})} placeholder="Detailed Requirements..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-sm text-white h-20 focus:border-blue-500 outline-none resize-none" />
              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest">Deploy Mission</button>
            </form>
          </div>

          {/* TICKET FEED */}
          <div className="space-y-6">
            {tickets.map(ticket => (
              <div key={ticket.id} className="bg-slate-900/80 border border-slate-700 rounded-[2.5rem] overflow-hidden hover:border-blue-500 transition-all shadow-2xl relative">
                <div className="absolute top-0 right-12 bg-blue-600 text-white text-[8px] font-black px-6 py-1.5 rounded-b-xl uppercase tracking-widest">{ticket.project || 'GreenStack'}</div>
                
                <div className="p-8 flex justify-between items-start border-b border-slate-800">
                  <div className="flex gap-6">
                    <span className="text-sm font-black text-blue-400 font-mono bg-blue-500/10 px-3 py-1 rounded h-fit">{ticket.displayId}</span>
                    <div>
                      <h3 className="text-2xl font-black text-white mb-1 uppercase tracking-tight">{ticket.title}</h3>
                      <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">{ticket.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => deleteTicket(ticket.id)} className="p-2 text-slate-700 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
                    <button onClick={() => updateStatus(ticket.id, ticket.status)} className={`px-8 py-3 rounded-xl border-2 text-xs font-black uppercase transition-all ${ticket.status === 'Done' ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20' : 'bg-slate-800 border-slate-600 text-slate-300'}`}>{ticket.status}</button>
                  </div>
                </div>

                <div className="bg-slate-950/40 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2 tracking-widest"><History size={14} /> Bee Activity Log</h4>
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 h-56 overflow-y-auto space-y-3 font-mono">
                      {ticket.workLog?.map((log, i) => (
                        <div key={i} className={`text-[11px] leading-tight p-2 rounded bg-white/5 ${log.includes('SUCCESS') ? 'text-emerald-400 border-l-2 border-emerald-400' : 'text-slate-500'}`}>{log}</div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 bg-blue-500/5 p-6 rounded-3xl border border-blue-500/10">
                    <h4 className="text-[10px] font-black uppercase text-blue-400 flex items-center gap-2 tracking-widest"><Target size={14} /> Surgical Pollination</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <input value={deployPath[ticket.id] || ''} onChange={(e) => setDeployPath({...deployPath, [ticket.id]: e.target.value})} placeholder="File Path" className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-[10px] text-white outline-none focus:border-blue-500" />
                      <input value={deployAnchor[ticket.id] || ''} onChange={(e) => setDeployAnchor({...deployAnchor, [ticket.id]: e.target.value})} placeholder="Anchor ID" className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-[10px] text-white outline-none focus:border-blue-500" />
                    </div>
                    <textarea value={commentText[ticket.id] || ''} onChange={(e) => setCommentText({...commentText, [ticket.id]: e.target.value})} placeholder="Pollen (Code)..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-xs text-emerald-400 font-mono h-24 outline-none focus:border-blue-400 shadow-inner" />
                    <button onClick={() => handleDeploy(ticket.id)} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all">
                      <Zap size={14} className="fill-current" /> Pollinate {ticket.project || 'GreenStack'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
        <BeeDisplay type="scout" status="Uplink Verified" />
        <BeeDisplay type="builder" status="Waiting for Pollen" isWorking={isSyncing} />
      </div>
    </div>
  );
};
export default ApiaryDashboard;
