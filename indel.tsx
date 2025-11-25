import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  LayoutDashboard, Users, Music, DollarSign, Settings, 
  LogOut, Upload, Youtube, Video, Search, Trash2, 
  Edit, CheckCircle, AlertCircle, Menu, X, Download, Plus,
  TrendingUp, Wallet, ArrowRight, Activity, FileSpreadsheet
} from 'lucide-react';

// --- Types ---

interface User {
  id: string;
  username: string;
  password?: string;
  role: 'admin' | 'user';
  ratio: number; // Percentage (0-100)
  createdAt: string;
}

interface Channel {
  id: string;
  userId: string;
  platform: 'youtube' | 'tiktok';
  identifier: string; // ID for YT, Username for TikTok
  name: string;
}

interface Song {
  id: string;
  title: string;
  description: string;
  tags: string[];
  uploadDate: string;
  fileSize: string;
}

interface Distribution {
  id: string;
  songId: string;
  userId: string; // The user who received the song
  distributedAt: string;
  status: 'success' | 'failed';
  views: number; // Simulated real-time views
}

interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed';
}

interface AppSettings {
  globalPricePer1k: number;
  platformFee: number; // Percentage (0-100)
}

// --- Mock Backend / Data Manager ---

// Iron Standard: Default Users
const DEFAULT_USERS: User[] = [
  { id: 'u_admin', username: 'admin', password: '123456', role: 'admin', ratio: 0, createdAt: new Date().toISOString() },
  { id: 'u_test1', username: 'test1', password: '123456', role: 'user', ratio: 75, createdAt: new Date().toISOString() },
  { id: 'u_test2', username: 'test2', password: '123456', role: 'user', ratio: 80, createdAt: new Date().toISOString() },
];

const DEFAULT_SETTINGS: AppSettings = {
  globalPricePer1k: 0.03, // Default $0.03 per 1000 views
  platformFee: 0,
};

class DataManager {
  private get<T>(key: string, defaultVal: T): T {
    const stored = localStorage.getItem(`nexus_v2_${key}`);
    return stored ? JSON.parse(stored) : defaultVal;
  }

  private set(key: string, val: any) {
    localStorage.setItem(`nexus_v2_${key}`, JSON.stringify(val));
  }

  getUsers() { return this.get<User[]>('users', DEFAULT_USERS); }
  setUsers(users: User[]) { this.set('users', users); }

  getChannels() { return this.get<Channel[]>('channels', []); }
  setChannels(channels: Channel[]) { this.set('channels', channels); }

  getSongs() { return this.get<Song[]>('songs', []); }
  setSongs(songs: Song[]) { this.set('songs', songs); }

  getDistributions() { return this.get<Distribution[]>('distributions', []); }
  setDistributions(dists: Distribution[]) { this.set('distributions', dists); }

  getWithdrawals() { return this.get<Withdrawal[]>('withdrawals', []); }
  setWithdrawals(w: Withdrawal[]) { this.set('withdrawals', w); }

  getSettings() { return this.get<AppSettings>('settings', DEFAULT_SETTINGS); }
  setSettings(s: AppSettings) { this.set('settings', s); }
  
  // Simulation: Randomly increase views to make it "Real Time"
  simulateTraffic() {
    const dists = this.getDistributions();
    if (dists.length === 0) return;
    
    // Randomly select some distributions to update
    const updated = dists.map(d => {
      if (Math.random() > 0.7) {
        return { ...d, views: d.views + Math.floor(Math.random() * 50) + 1 };
      }
      return d;
    });
    this.setDistributions(updated);
  }

  reset() {
    localStorage.clear();
    window.location.reload();
  }
}

const db = new DataManager();

// --- Components ---

// 1. Authentication (Iron Standard: Dark Gradient + Neon + Auto Redirect)
const LoginScreen = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const users = db.getUsers();
      const user = users.find(u => u.username === username && u.password === password);
      
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid Credentials. Try admin/123456');
        setLoading(false);
      }
    }, 800); // Fake network delay for effect
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050508]">
      {/* Background FX */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] opacity-80"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-nexus-neon to-transparent shadow-[0_0_10px_#00f2ff]"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-nexus-purple/20 rounded-full blur-[100px] animate-pulse-slow"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-nexus-blue/10 rounded-full blur-[80px] animate-pulse-slow"></div>

      <div className="glass-panel w-full max-w-md p-10 rounded-2xl relative z-10 border-t border-nexus-purple/30 animate-float">
        <div className="text-center mb-10">
          <div className="inline-block p-3 rounded-full bg-nexus-purple/10 border border-nexus-purple/30 mb-4 shadow-[0_0_15px_rgba(124,58,237,0.3)]">
            <Music size={32} className="text-nexus-neon" />
          </div>
          <h1 className="text-4xl font-tech font-bold text-transparent bg-clip-text bg-gradient-to-r from-nexus-neon via-white to-nexus-purple mb-2 tracking-wider">
            NEXUS MUSIC
          </h1>
          <p className="text-nexus-blue/80 text-xs tracking-[0.2em] uppercase font-bold">Revenue Distribution System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm flex items-center gap-2 animate-pulse">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          
          <div className="group">
            <label className="block text-gray-400 text-xs uppercase font-bold mb-2 ml-1 group-focus-within:text-nexus-neon transition-colors">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-3 text-white outline-none transition-all placeholder-gray-600"
              placeholder="Enter username"
            />
          </div>

          <div className="group">
            <label className="block text-gray-400 text-xs uppercase font-bold mb-2 ml-1 group-focus-within:text-nexus-neon transition-colors">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-3 text-white outline-none transition-all placeholder-gray-600"
              placeholder="Enter password"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-nexus-darkPurple to-nexus-blue hover:from-nexus-purple hover:to-nexus-neon text-white font-bold py-4 rounded-xl shadow-lg transform transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            {loading ? 'Authenticating...' : 'INITIALIZE SYSTEM'}
          </button>
        </form>
      </div>
    </div>
  );
};

// 2. Layout & Nav
const DashboardLayout = ({ user, onLogout, children }: { user: User, onLogout: () => void, children?: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
    { icon: Users, label: 'Sub-Accounts', id: 'users' },
    { icon: Upload, label: 'Distribution', id: 'distribution' },
    { icon: DollarSign, label: 'Revenue', id: 'revenue' },
    { icon: Settings, label: 'System', id: 'settings' },
  ];

  const userLinks = [
    { icon: LayoutDashboard, label: 'Overview', id: 'sub-dashboard' },
    { icon: Video, label: 'My Channels', id: 'sub-channels' },
    { icon: Music, label: 'My Music', id: 'sub-music' },
    { icon: DollarSign, label: 'Earnings', id: 'sub-revenue' },
    { icon: Settings, label: 'Settings', id: 'sub-settings' },
  ];

  const links = user.role === 'admin' ? adminLinks : userLinks;

  return (
    <div className="min-h-screen bg-nexus-bg text-white flex overflow-hidden font-sans selection:bg-nexus-neon selection:text-black">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 glass-panel border-r border-nexus-border transform transition-transform duration-300 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-20 flex items-center gap-3 px-6 border-b border-nexus-border relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-nexus-neon shadow-[0_0_10px_#00f2ff]"></div>
          <Music className="text-nexus-neon animate-pulse" size={24} />
          <span className="font-tech text-xl font-bold tracking-wide text-white">NEXUS</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                window.location.hash = link.id;
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all group relative overflow-hidden ${
                window.location.hash.replace('#', '') === link.id 
                  ? 'bg-nexus-purple/20 text-nexus-neon border border-nexus-purple/40 shadow-[0_0_10px_rgba(124,58,237,0.2)]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <link.icon size={20} className={`transition-transform group-hover:scale-110 ${window.location.hash.replace('#', '') === link.id ? 'text-nexus-neon' : ''}`} />
              <span className="font-medium tracking-wide text-sm">{link.label}</span>
              {window.location.hash.replace('#', '') === link.id && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-nexus-neon rounded-l-full shadow-[0_0_8px_#00f2ff]"></div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-nexus-border bg-black/20">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-white/5 border border-white/5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-nexus-blue to-nexus-purple flex items-center justify-center text-xs font-bold text-white shadow-lg">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate text-white">{user.username}</p>
              <p className="text-[10px] text-nexus-neon uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/10 px-4 py-3 rounded-xl text-sm transition-colors border border-transparent hover:border-red-500/20">
            <LogOut size={16} /> Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 border-b border-nexus-border flex items-center justify-between px-6 lg:px-8 bg-nexus-bg/50 backdrop-blur-md sticky top-0 z-30">
          <button className="lg:hidden text-white hover:text-nexus-neon transition-colors" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="flex-1 flex justify-end items-center gap-4">
             <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 font-mono border border-white/10 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                SYSTEM OPERATIONAL
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 relative scroll-smooth">
           {/* Ambient Glows */}
           <div className="fixed top-20 right-0 w-[600px] h-[600px] bg-nexus-purple/10 rounded-full blur-[150px] pointer-events-none -z-10"></div>
           <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-nexus-blue/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
           
           <div className="max-w-7xl mx-auto space-y-8 pb-20">
             {children}
           </div>
        </div>
      </main>
    </div>
  );
};

// --- View Components (Admin) ---

const AdminDashboard = () => {
  const users = db.getUsers().filter(u => u.role !== 'admin');
  const distributions = db.getDistributions();
  const settings = db.getSettings();

  // Stats Logic
  const totalViews = distributions.reduce((acc, d) => acc + d.views, 0);
  const totalRevenue = (totalViews / 1000) * settings.globalPricePer1k;
  const todayRevenue = totalRevenue * 0.15; // Mock daily portion
  const pendingPayout = totalRevenue * 0.8; // Mock pending

  return (
    <div className="space-y-8 animate-float-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-tech font-bold text-white tracking-wide">Command Center</h2>
        <span className="text-xs font-mono text-gray-500">{new Date().toLocaleDateString()}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-nexus-neon', bg: 'bg-nexus-neon/10', border: 'border-nexus-neon/30' },
          { label: 'Today Revenue', value: `$${todayRevenue.toFixed(2)}`, icon: TrendingUp, color: 'text-nexus-blue', bg: 'bg-nexus-blue/10', border: 'border-nexus-blue/30' },
          { label: 'Active Creators', value: users.length, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
          { label: 'Pending Payout', value: `$${pendingPayout.toFixed(2)}`, icon: Wallet, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
        ].map((stat, i) => (
          <div key={i} className={`glass-panel p-6 rounded-2xl border ${stat.border} relative overflow-hidden group hover:bg-white/5 transition-all`}>
            <div className={`absolute right-4 top-4 p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <p className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-2 mt-2">{stat.label}</p>
            <h3 className={`text-3xl font-bold ${stat.color} font-mono`}>{stat.value}</h3>
            <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent w-full opacity-50" style={{color: stat.color}}></div>
          </div>
        ))}
      </div>

      <div className="glass-panel p-8 rounded-2xl border-t border-nexus-purple/30">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
          <Activity className="text-nexus-neon" size={20} />
          Revenue Trend (7 Days)
        </h3>
        <div className="h-64 flex items-end justify-between gap-4 px-2">
          {[45, 60, 35, 80, 50, 95, 75].map((h, i) => (
            <div key={i} className="w-full relative group h-full flex items-end">
               <div 
                className="w-full bg-gradient-to-t from-nexus-darkPurple to-nexus-blue rounded-t-sm opacity-60 group-hover:opacity-100 transition-all duration-500 relative" 
                style={{ height: `${h}%` }}
               >
                 <div className="absolute top-0 left-0 w-full h-[2px] bg-nexus-neon shadow-[0_0_10px_#00f2ff]"></div>
               </div>
               <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all text-xs bg-black border border-nexus-border px-3 py-1 rounded-md text-nexus-neon font-mono z-10 whitespace-nowrap">
                 ${(h * 1.5).toFixed(2)}
               </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4 text-xs font-mono text-gray-500 uppercase border-t border-white/5 pt-4">
          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
        </div>
      </div>
    </div>
  );
};

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [csvContent, setCsvContent] = useState('');
  const [importStatus, setImportStatus] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => setUsers(db.getUsers()), []);

  const handleDelete = (id: string) => {
    if (confirm('Irreversible action. Delete user and simulated data?')) {
      const newUsers = users.filter(u => u.id !== id);
      db.setUsers(newUsers);
      setUsers(newUsers);
    }
  };

  const handleRatioChange = (id: string, newRatio: number) => {
    const newUsers = users.map(u => u.id === id ? { ...u, ratio: newRatio } : u);
    db.setUsers(newUsers);
    setUsers(newUsers); // Immediate UI update
  };

  // Iron Standard: CSV Import
  const processCSV = () => {
    try {
      const lines = csvContent.trim().split('\n');
      const startIdx = lines[0].toLowerCase().includes('username') ? 1 : 0;
      
      const newUsers: User[] = [];
      const newChannels: Channel[] = [];
      let currentUsers = [...db.getUsers()];
      
      for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Format: username,password,ratio,channel_name,channel_id
        const parts = line.split(',');
        if (parts.length < 5) throw new Error(`Line ${i+1} invalid format`);
        
        const [username, password, ratio, cName, cId] = parts.map(p => p.trim());
        
        // Check if user exists (or created in this batch)
        let user = currentUsers.find(u => u.username === username) || newUsers.find(u => u.username === username);
        
        if (!user) {
          user = {
            id: `u_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            username,
            password,
            role: 'user',
            ratio: parseFloat(ratio),
            createdAt: new Date().toISOString()
          };
          newUsers.push(user);
        }

        newChannels.push({
          id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          userId: user.id,
          platform: cId.startsWith('UC') ? 'youtube' : 'tiktok',
          identifier: cId,
          name: cName
        });
      }

      db.setUsers([...db.getUsers(), ...newUsers]);
      db.setChannels([...db.getChannels(), ...newChannels]);
      setUsers(db.getUsers());
      setImportStatus({ msg: `Successfully imported ${newUsers.length} users & ${newChannels.length} channels`, type: 'success' });
      setCsvContent('');
      setTimeout(() => setImportStatus(null), 3000);
    } catch (e: any) {
      setImportStatus({ msg: e.message || 'Error parsing CSV', type: 'error' });
    }
  };

  const filtered = users.filter(u => u.role !== 'admin' && u.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <h2 className="text-2xl font-tech font-bold text-white">User Management</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search database..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 glass-input rounded-xl text-sm w-64 text-white"
          />
        </div>
      </div>

      {/* CSV Import */}
      <div className="glass-panel p-6 rounded-2xl border-dashed border-2 border-white/10 hover:border-nexus-purple/50 transition-colors">
        <h3 className="text-sm font-bold uppercase text-nexus-blue mb-4 flex items-center gap-2">
           <FileSpreadsheet size={16} /> Batch Import (CSV)
        </h3>
        <textarea 
          value={csvContent}
          onChange={(e) => setCsvContent(e.target.value)}
          placeholder="username,password,ratio,channel_name,channel_id&#10;demo1,123456,75,MyChannel,UC12345..."
          className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-sm font-mono mb-4 h-24 focus:border-nexus-purple outline-none text-gray-300"
        />
        <div className="flex items-center gap-4">
          <button onClick={processCSV} className="bg-nexus-purple hover:bg-nexus-darkPurple text-white px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-nexus-purple/20">
            Process Import
          </button>
          {importStatus && (
            <span className={`text-xs ${importStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {importStatus.msg}
            </span>
          )}
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-gray-400 text-xs uppercase border-b border-white/10">
              <th className="p-4">User</th>
              <th className="p-4">Split Ratio (%)</th>
              <th className="p-4">Est. Revenue</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => {
              // Real-time calculation logic
              const dists = db.getDistributions().filter(d => d.userId === user.id);
              const views = dists.reduce((acc, d) => acc + d.views, 0);
              const revenue = (views / 1000) * db.getSettings().globalPricePer1k * (user.ratio / 100);

              return (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-white group-hover:text-nexus-neon transition-colors">{user.username}</span>
                      <span className="text-[10px] text-gray-500 font-mono">{user.id}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <input 
                      type="number" 
                      value={user.ratio}
                      onChange={(e) => handleRatioChange(user.id, Number(e.target.value))}
                      className="w-16 bg-black/40 border border-white/20 rounded px-2 py-1 text-sm text-center focus:border-nexus-neon outline-none text-white"
                    />
                  </td>
                  <td className="p-4 font-mono text-nexus-neon">
                    ${revenue.toFixed(2)}
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(user.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminDistribution = () => {
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState({ title: '', description: '', tags: '' });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const users = db.getUsers().filter(u => u.role !== 'admin');

  const handleDistribute = () => {
    if (!meta.title || selectedUsers.length === 0) return alert('Missing fields');
    setStatus('processing');

    setTimeout(() => {
      const newSong: Song = {
        id: `s_${Date.now()}`,
        title: meta.title,
        description: meta.description,
        tags: meta.tags.split(',').map(t => t.trim()),
        uploadDate: new Date().toISOString(),
        fileSize: file ? `${(file.size / 1024 / 1024).toFixed(2)}MB` : '0MB'
      };
      db.setSongs([...db.getSongs(), newSong]);

      const newDists = selectedUsers.map(uid => ({
        id: `d_${Date.now()}_${uid}`,
        songId: newSong.id,
        userId: uid,
        distributedAt: new Date().toISOString(),
        status: 'success' as const,
        views: Math.floor(Math.random() * 1000) // Initial traction
      }));
      db.setDistributions([...db.getDistributions(), ...newDists]);
      
      setStatus('success');
      setTimeout(() => {
        setStatus('idle');
        setMeta({ title: '', description: '', tags: '' });
        setSelectedUsers([]);
        setFile(null);
      }, 2000);
    }, 1500);
  };

  const toggleUser = (id: string) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-2xl font-tech font-bold text-white">Music Distribution</h2>
        <div className="glass-panel p-8 rounded-2xl space-y-6 border border-nexus-purple/30">
          <div className="border-2 border-dashed border-gray-700 rounded-xl p-10 text-center hover:border-nexus-neon hover:bg-nexus-neon/5 transition-all cursor-pointer relative">
            <input type="file" accept=".mp3,.wav" onChange={(e) => setFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
            <Upload className="mx-auto text-nexus-blue mb-4" size={40} />
            <p className="text-white font-bold text-lg">{file ? file.name : "Drop Audio File"}</p>
            <p className="text-xs text-gray-500 mt-2 font-mono">MP3/WAV • Max 50MB</p>
          </div>

          <div className="space-y-4">
            <input 
              className="w-full glass-input rounded-xl px-4 py-3 text-white outline-none"
              placeholder="Track Title"
              value={meta.title}
              onChange={(e) => setMeta({...meta, title: e.target.value})}
            />
            <input 
              className="w-full glass-input rounded-xl px-4 py-3 text-white outline-none"
              placeholder="Tags (comma separated)"
              value={meta.tags}
              onChange={(e) => setMeta({...meta, tags: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-300">Target Recipients</h3>
        <div className="glass-panel p-2 rounded-2xl h-[400px] overflow-y-auto">
          {users.map(u => (
            <div 
              key={u.id}
              onClick={() => toggleUser(u.id)}
              className={`flex items-center gap-3 p-3 m-2 rounded-xl cursor-pointer transition-all border ${
                selectedUsers.includes(u.id) 
                  ? 'bg-nexus-purple/20 border-nexus-purple text-white shadow-[0_0_10px_rgba(124,58,237,0.2)]' 
                  : 'hover:bg-white/5 border-transparent text-gray-400'
              }`}
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedUsers.includes(u.id) ? 'bg-nexus-purple border-transparent' : 'border-gray-600'}`}>
                {selectedUsers.includes(u.id) && <CheckCircle size={12} className="text-white" />}
              </div>
              <span className="font-medium text-sm">{u.username}</span>
            </div>
          ))}
        </div>
        <button 
          onClick={handleDistribute}
          disabled={status !== 'idle'}
          className={`w-full py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all ${
            status === 'success' ? 'bg-green-500 text-white' : 'bg-nexus-blue hover:bg-blue-600 text-white'
          }`}
        >
          {status === 'processing' ? 'Uploading...' : status === 'success' ? 'Distributed Successfully' : 'Distribute Now'}
        </button>
      </div>
    </div>
  );
};

const AdminRevenue = () => {
  const users = db.getUsers().filter(u => u.role !== 'admin');
  const dists = db.getDistributions();
  const settings = db.getSettings();

  const exportExcel = () => {
    let csv = "User,Ratio,Total Views,Gross Revenue,Platform Fee,Net Revenue\n";
    users.forEach(u => {
      const uDists = dists.filter(d => d.userId === u.id);
      const views = uDists.reduce((acc, d) => acc + d.views, 0);
      const gross = (views / 1000) * settings.globalPricePer1k;
      const net = gross * (u.ratio / 100);
      csv += `${u.username},${u.ratio}%,${views},${gross.toFixed(4)},${settings.platformFee}%,${net.toFixed(4)}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Revenue_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-tech font-bold text-white">Revenue Overview</h2>
        <button onClick={exportExcel} className="flex items-center gap-2 bg-green-600/20 text-green-400 border border-green-600/50 px-4 py-2 rounded-lg text-sm hover:bg-green-600/30 transition-colors">
          <Download size={16} /> Export Excel
        </button>
      </div>
      
      <div className="glass-panel rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 text-gray-400 text-xs uppercase">
              <th className="p-4">User</th>
              <th className="p-4">Total Views</th>
              <th className="p-4">Platform Gross</th>
              <th className="p-4">User Net</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const uDists = dists.filter(d => d.userId === u.id);
              const views = uDists.reduce((acc, d) => acc + d.views, 0);
              const gross = (views / 1000) * settings.globalPricePer1k;
              const net = gross * (u.ratio / 100);
              return (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                   <td className="p-4 font-bold">{u.username}</td>
                   <td className="p-4 font-mono text-gray-300">{views.toLocaleString()}</td>
                   <td className="p-4 font-mono text-gray-300">${gross.toFixed(2)}</td>
                   <td className="p-4 font-mono text-nexus-neon">${net.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminSettings = () => {
  const [settings, setSettings] = useState(db.getSettings());
  const [saved, setSaved] = useState(false);

  const save = () => {
    db.setSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto glass-panel p-8 rounded-2xl border-t border-nexus-purple/50">
      <h2 className="text-2xl font-tech font-bold mb-8 text-center text-white">Global Configuration</h2>
      <div className="space-y-6">
        <div>
          <label className="text-sm font-bold text-gray-400 mb-2 block uppercase">RPM (Revenue Per 1k Views)</label>
          <div className="relative group">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-purple group-focus-within:text-nexus-neon transition-colors" size={18} />
            <input 
              type="number" 
              step="0.001"
              value={settings.globalPricePer1k}
              onChange={(e) => setSettings({...settings, globalPricePer1k: parseFloat(e.target.value)})}
              className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-white outline-none font-mono text-lg"
            />
          </div>
          <p className="text-[10px] text-gray-500 mt-2">Updating this recalculates all historical data immediately.</p>
        </div>
        <button onClick={save} className="w-full bg-nexus-purple hover:bg-nexus-darkPurple text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-nexus-purple/20 flex items-center justify-center gap-2">
           {saved ? <CheckCircle size={18} /> : null} {saved ? 'System Updated' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

// --- View Components (Sub-Account) ---

const SubDashboard = ({ user }: { user: User }) => {
  const settings = db.getSettings();
  const dists = db.getDistributions().filter(d => d.userId === user.id);
  
  // Real-time Math
  const totalViews = dists.reduce((acc, d) => acc + d.views, 0);
  const revenue = (totalViews / 1000) * settings.globalPricePer1k * (user.ratio / 100);
  
  // Withdrawal Logic
  const withdrawals = db.getWithdrawals().filter(w => w.userId === user.id);
  const withdrawn = withdrawals.reduce((acc, w) => acc + w.amount, 0);
  const balance = Math.max(0, revenue - withdrawn);

  const handleWithdraw = () => {
    if (balance < 10) return alert('Minimum withdrawal is $10');
    const w: Withdrawal = {
      id: `w_${Date.now()}`,
      userId: user.id,
      amount: balance,
      date: new Date().toISOString(),
      status: 'pending'
    };
    db.setWithdrawals([...db.getWithdrawals(), w]);
    alert('Withdrawal request submitted.');
    window.location.reload(); // Quick refresh to show state
  };

  return (
    <div className="space-y-8 animate-float-in">
      <div className="flex justify-between items-end border-b border-white/5 pb-4">
        <div>
          <h2 className="text-3xl font-tech font-bold text-white mb-1">Welcome, {user.username}</h2>
          <p className="text-xs text-gray-500 font-mono">ID: {user.id} • Split: <span className="text-nexus-neon">{user.ratio}%</span></p>
        </div>
        <button onClick={handleWithdraw} disabled={balance < 10} className="bg-gradient-to-r from-nexus-purple to-nexus-blue text-white px-6 py-2 rounded-xl font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.4)]">
          Withdraw Balance
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-nexus-neon bg-gradient-to-br from-white/5 to-transparent">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Available Balance</p>
          <h3 className="text-4xl font-bold text-white font-mono">${balance.toFixed(2)}</h3>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-nexus-blue">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Total Earnings</p>
          <h3 className="text-4xl font-bold text-white font-mono">${revenue.toFixed(2)}</h3>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-nexus-purple">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Total Views</p>
          <h3 className="text-4xl font-bold text-white font-mono">{totalViews.toLocaleString()}</h3>
        </div>
      </div>

      {/* Mock "My Music" Preview */}
      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="font-bold text-white mb-4">Recent Performance</h3>
        <div className="space-y-3">
           {dists.slice(0, 3).map(d => {
             const song = db.getSongs().find(s => s.id === d.songId);
             const earn = (d.views / 1000) * settings.globalPricePer1k * (user.ratio / 100);
             return (
               <div key={d.id} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                  <span className="text-sm font-medium">{song?.title}</span>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{d.views.toLocaleString()} views</p>
                    <p className="text-sm font-mono text-nexus-neon">+${earn.toFixed(3)}</p>
                  </div>
               </div>
             )
           })}
        </div>
      </div>
    </div>
  );
};

const SubChannels = ({ user }: { user: User }) => {
  const [channels, setChannels] = useState(db.getChannels().filter(c => c.userId === user.id));
  const [form, setForm] = useState({ platform: 'youtube', identifier: '' });

  const bind = () => {
    if (!form.identifier) return;
    const name = form.platform === 'youtube' ? `YT Channel (${form.identifier})` : `@${form.identifier}`;
    const newChannel: Channel = {
      id: `c_${Date.now()}`,
      userId: user.id,
      platform: form.platform as any,
      identifier: form.identifier,
      name
    };
    db.setChannels([...db.getChannels(), newChannel]);
    setChannels([...channels, newChannel]);
    setForm({...form, identifier: ''});
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-2xl font-tech font-bold text-white">Channel Management</h2>
      
      <div className="glass-panel p-8 rounded-2xl border border-nexus-blue/30 relative overflow-hidden group">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-nexus-blue/20 rounded-full blur-[50px] group-hover:bg-nexus-blue/30 transition-colors"></div>
        <h3 className="text-lg font-bold mb-6 text-white relative z-10">Bind New Channel</h3>
        <div className="flex flex-col md:flex-row gap-4 relative z-10">
          <select 
            value={form.platform}
            onChange={(e) => setForm({...form, platform: e.target.value})}
            className="bg-[#0a0a12] border border-nexus-border rounded-xl px-4 py-3 text-white outline-none focus:border-nexus-blue"
          >
            <option value="youtube">YouTube</option>
            <option value="tiktok">TikTok</option>
          </select>
          <input 
            value={form.identifier}
            onChange={(e) => setForm({...form, identifier: e.target.value})}
            placeholder={form.platform === 'youtube' ? "Channel ID / URL" : "Username"}
            className="flex-1 glass-input rounded-xl px-4 py-3 text-white outline-none"
          />
          <button onClick={bind} className="bg-nexus-blue hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all">
            Bind Channel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {channels.map(c => (
          <div key={c.id} className="glass-panel p-4 rounded-xl flex items-center gap-4 border border-white/5 hover:border-nexus-neon/50 transition-colors">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${c.platform === 'youtube' ? 'bg-red-500/10 text-red-500' : 'bg-pink-500/10 text-pink-500'}`}>
              {c.platform === 'youtube' ? <Youtube /> : <Video />}
            </div>
            <div>
              <p className="font-bold text-white">{c.name}</p>
              <p className="text-xs text-gray-500 font-mono">{c.identifier}</p>
            </div>
            <div className="ml-auto text-green-400 text-xs bg-green-500/10 px-2 py-1 rounded border border-green-500/20">Active</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SubMusic = ({ user }: { user: User }) => {
  const dists = db.getDistributions().filter(d => d.userId === user.id);
  const settings = db.getSettings();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-tech font-bold text-white">My Music Library</h2>
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 text-gray-400 text-xs uppercase">
              <th className="p-4">Track</th>
              <th className="p-4">Status</th>
              <th className="p-4">Views</th>
              <th className="p-4">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {dists.map(d => {
              const song = db.getSongs().find(s => s.id === d.songId);
              const revenue = (d.views / 1000) * settings.globalPricePer1k * (user.ratio / 100);
              return (
                <tr key={d.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-white">{song?.title}</p>
                    <div className="flex gap-1 mt-1">{song?.tags.map(t => <span key={t} className="text-[10px] bg-white/10 px-1 rounded text-gray-400">{t}</span>)}</div>
                  </td>
                  <td className="p-4"><span className="text-nexus-neon text-xs border border-nexus-neon/30 px-2 py-1 rounded bg-nexus-neon/5">Distributed</span></td>
                  <td className="p-4 font-mono text-gray-300">{d.views.toLocaleString()}</td>
                  <td className="p-4 font-mono text-nexus-neon font-bold">${revenue.toFixed(3)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SubEarnings = ({ user }: { user: User }) => {
  const withdrawals = db.getWithdrawals().filter(w => w.userId === user.id);
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-tech font-bold text-white">Withdrawal History</h2>
      <div className="glass-panel rounded-2xl overflow-hidden">
        {withdrawals.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No withdrawal history found.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-xs uppercase">
                <th className="p-4">Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map(w => (
                <tr key={w.id} className="border-b border-white/5">
                  <td className="p-4 text-gray-300">{new Date(w.date).toLocaleDateString()}</td>
                  <td className="p-4 font-mono font-bold text-white">${w.amount.toFixed(2)}</td>
                  <td className="p-4">
                    <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-1 rounded text-xs uppercase">
                      {w.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// --- Main App Root ---

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [route, setRoute] = useState('dashboard');

  // Real-time Simulation Effect
  useEffect(() => {
    const interval = setInterval(() => {
      db.simulateTraffic();
      // Force update if needed, but the views usually re-render on nav. 
      // For instant update, we could trigger a global state update, 
      // but in this mock, navigating or interacting updates the view.
    }, 5000); // Every 5 seconds, views go up
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleHash = () => setRoute(window.location.hash.replace('#', '') || 'dashboard');
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    window.location.hash = u.role === 'admin' ? 'dashboard' : 'sub-dashboard';
  };

  const handleLogout = () => {
    setUser(null);
    window.location.hash = '';
  };

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      {user.role === 'admin' ? (
        <>
          {route === 'dashboard' && <AdminDashboard />}
          {route === 'users' && <AdminUsers />}
          {route === 'distribution' && <AdminDistribution />}
          {route === 'revenue' && <AdminRevenue />}
          {route === 'settings' && <AdminSettings />}
        </>
      ) : (
        <>
          {route === 'sub-dashboard' && <SubDashboard user={user} />}
          {route === 'sub-channels' && <SubChannels user={user} />}
          {route === 'sub-music' && <SubMusic user={user} />}
          {route === 'sub-revenue' && <SubEarnings user={user} />}
          {route === 'sub-settings' && <div className="text-center py-20 text-gray-500">Account settings module placeholder.</div>}
        </>
      )}
    </DashboardLayout>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);