import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../js/services/api';

const Login = () => {
    const navigate = useNavigate();
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegister) {
                await api.post('/auth/register', formData);
                // alert('Account created! Please log in.'); // Removed as per request
                setError('Account created! Please log in.'); // Using error field as status message for now
                setIsRegister(false);
            } else {
                const response = await api.post('/auth/login', {
                    username: formData.username,
                    password: formData.password
                });
                if (response.success) {
                    localStorage.setItem('user', JSON.stringify(response));
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background-dark">
            {/* Background FX */}
            <div className="absolute inset-0 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuBXRuAnm4TWmeLokpiWualeQMnfpbzAWwF1z7vP_aEtaINpspl5kJGo3vfJJyZhtvNxfrZ83zjJ0RfQwomOQ8WLBjwNCkUbgECBD7apfwZ62QdXEtdLvKV2ZKpX0lqdRpUrytD5F2IoLbbFMnPhcua5NQFjVDCnI8Ptur2mDMgA3f0FJ6HvnU-F5PC4UrNB7UP9Ws-b_47IqoB-uuDQxqe-FZTZb2y0JW5F3ytTFp8uz9yLFPQXhRfXZDw0wkO1eT2pfujN32SWARc')] bg-cover opacity-20"></div>
            <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px]"></div>

            <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-md p-8 glass-panel rounded-2xl border-t border-t-primary/50 shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="size-16 bg-background-dark rounded-2xl flex items-center justify-center mb-4 border border-glass-border shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-4xl text-primary">public</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Chronos Atlas</h1>
                    <p className="text-slate-400 mt-2">{isRegister ? 'Join the architect\'s guild.' : 'Enter the architect\'s vault.'}</p>
                </div>

                <div className="space-y-4">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-bold">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Identity</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full bg-background-dark/50 border border-glass-border rounded-lg px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            placeholder="Architect name"
                            required
                        />
                    </div>

                    {isRegister && (
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Communication</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-background-dark/50 border border-glass-border rounded-lg px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                placeholder="robert@chronos.net"
                                required
                            />
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cipher Key</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full bg-background-dark/50 border border-glass-border rounded-lg px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-primary/25 transition-all mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined">{loading ? 'sync' : isRegister ? 'person_add' : 'lock_open'}</span>
                        {loading ? 'Processing...' : isRegister ? 'Register & Initialize' : 'Decrypt & Enter'}
                    </button>

                    <div className="flex justify-between items-center px-1">
                        <button
                            type="button"
                            onClick={() => setIsRegister(!isRegister)}
                            className="text-xs text-primary hover:text-white transition-colors"
                        >
                            {isRegister ? 'Already an architect?' : 'New traveler? Create ID'}
                        </button>
                        <a href="#" className="text-xs text-slate-500 hover:text-white transition-colors">Lost your key?</a>
                    </div>
                </div>

                <div className="mt-6 text-center text-xs text-slate-500">
                    Atlas Vault System v2.5.0
                </div>
            </form>
        </div>
    );
};

export default Login;

