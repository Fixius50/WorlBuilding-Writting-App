import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@store/useAppStore';

const Login = () => {
  const navigate = useNavigate();
  const user = useAppStore(state => state.user);
  const setUser = useAppStore(state => state.setUser);
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simulated local authentication for Local-First architecture
      await new Promise(resolve => setTimeout(resolve, 800)); // Aesthetic delay
      
      const userData = {
        username: formData.username || 'Architect',
        displayName: formData.username || 'Architect',
        success: true,
        localMode: true
      };

      await setUser(userData);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 setFormData({ ...formData, [e.target.name]: e.target.value });
 };

 return (
 <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#050508]">
 {/* Background FX */}
 <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]"></div>
 <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px]"></div>

 <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-md p-8 bg-foreground/5 rounded-[2.5rem] border border-foreground/40 shadow-2xl">
 <div className="flex flex-col items-center mb-8">
 <div className="size-16 bg-[#0a0a0c] rounded-none flex items-center justify-center mb-4 border border-foreground/10 shadow-lg shadow-indigo-500/20">
 <span className="material-symbols-outlined text-4xl text-indigo-400">public</span>
 </div>
 <h1 className="text-3xl font-black text-foreground tracking-tighter">Chronos Atlas</h1>
 <p className="text-foreground/60 mt-2 font-medium">{isRegister ? 'Join the architect\'s guild.' : 'Enter the architect\'s vault.'}</p>
 </div>

 <div className="space-y-4">
 {error && (
 <div className="p-3 rounded-none bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-bold">
 {error}
 </div>
 )}

 <div className="space-y-2">
 <label className="text-[10px] font-black text-foreground/60 uppercase tracking-widest ml-1">Identity</label>
 <input
 type="text"
 name="username"
 value={formData.username}
 onChange={handleChange}
 className="w-full monolithic-panel rounded-none px-4 py-3 text-foreground focus:border-indigo-500 outline-none transition-all placeholder:text-foreground/60"
 placeholder="Architect name"
 required
 />
 </div>

 <div className="space-y-2">
 <label className="text-[10px] font-black text-foreground/60 uppercase tracking-widest ml-1">Cipher Key</label>
 <input
 type="password"
 name="password"
 value={formData.password}
 onChange={handleChange}
 className="w-full monolithic-panel rounded-none px-4 py-3 text-foreground focus:border-indigo-500 outline-none transition-all placeholder:text-foreground/60"
 placeholder="••••••••"
 required
 />
 </div>

 <button
 type="submit"
 disabled={loading}
 className="w-full h-14 bg-indigo-500 hover:bg-indigo-400 text-foreground font-black uppercase tracking-widest rounded-none shadow-lg shadow-indigo-500/20 transition-all mt-6 flex items-center justify-center gap-3 disabled:opacity-50"
 >
 {loading ? (
 <span className="material-symbols-outlined animate-spin text-xl">refresh</span>
 ) : (
 <>
 <span className="material-symbols-outlined text-xl">{isRegister ? 'person_add' : 'lock_open'}</span>
 <span>{isRegister ? 'Initialize' : 'Decrypt'}</span>
 </>
 )}
 </button>

 <div className="flex justify-between items-center px-1 pt-4">
 <button
 type="button"
 onClick={() => setIsRegister(!isRegister)}
 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-foreground transition-colors"
 >
 {isRegister ? 'Already an architect?' : 'New traveler? Create ID'}
 </button>
 </div>
 </div>

 <div className="mt-8 text-center text-[9px] font-bold text-foreground/60 uppercase tracking-[0.3em]">
 Local-First Engine v4.0.0
 </div>
 </form>
 </div>
 );
};

export default Login;
