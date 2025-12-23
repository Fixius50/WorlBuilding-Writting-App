import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background-dark">
            {/* Background FX */}
            <div className="absolute inset-0 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuBXRuAnm4TWmeLokpiWualeQMnfpbzAWwF1z7vP_aEtaINpspl5kJGo3vfJJyZhtvNxfrZ83zjJ0RfQwomOQ8WLBjwNCkUbgECBD7apfwZ62QdXEtdLvKV2ZKpX0lqdRpUrytD5F2IoLbbFMnPhcua5NQFjVDCnI8Ptur2mDMgA3f0FJ6HvnU-F5PC4UrNB7UP9Ws-b_47IqoB-uuDQxqe-FZTZb2y0JW5F3ytTFp8uz9yLFPQXhRfXZDw0wkO1eT2pfujN32SWARc')] bg-cover opacity-20"></div>
            <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px]"></div>

            <form onSubmit={handleLogin} className="relative z-10 w-full max-w-md p-8 glass-panel rounded-2xl border-t border-t-primary/50 shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="size-16 bg-background-dark rounded-2xl flex items-center justify-center mb-4 border border-glass-border shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-4xl text-primary">public</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Chronos Atlas</h1>
                    <p className="text-slate-400 mt-2">Enter the architect's vault.</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Identity</label>
                        <input type="text" className="w-full bg-background-dark/50 border border-glass-border rounded-lg px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="username@chronos.net" defaultValue="architect@chronos.net" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cipher</label>
                        <input type="password" className="w-full bg-background-dark/50 border border-glass-border rounded-lg px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="••••••••" defaultValue="password" />
                    </div>

                    <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-primary/25 transition-all mt-4 flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined">lock_open</span>
                        Decrypt & Enter
                    </button>

                    <div className="text-right">
                        <a href="#" className="text-xs text-primary hover:text-white transition-colors">Lost your key?</a>
                    </div>
                </div>

                <div className="mt-6 text-center text-xs text-slate-500">
                    Local-First Architecture v2.4.0
                </div>
            </form>
        </div>
    );
};

export default Login;
