import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const ProjectCard = ({ title, desc, type, updated, image }) => (
    <Link to="/project/1" className="group relative h-64 rounded-2xl overflow-hidden border border-glass-border hover:border-primary/50 transition-all cursor-pointer shadow-lg hover:shadow-primary/10">
        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url('${image}')` }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6 w-full">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">{type}</span>
                <span className="text-xs text-slate-400">{updated}</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-sm text-slate-300 line-clamp-1">{desc}</p>
        </div>
    </Link>
);

const Dashboard = () => {
    return (
        <div className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Chronicles</h1>
                    <p className="text-slate-400">Select a world to begin building.</p>
                </div>
                <Button icon="add_circle" variant="primary">New World</Button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ProjectCard
                    title="Kingdom of Aethelgard"
                    desc="A realm divided by ancient magic and forgotten tech."
                    type="Fantasy"
                    updated="Updated 2h ago"
                    image="https://lh3.googleusercontent.com/aida-public/AB6AXuBjZD3W0wgoLUU8QBGI9cDQSvtddbyvQxPQFs4ZO3ongKxfVCLye41Zid6ZVos779xwVspRP6A0JkWO5o6VruPPusPZw-bPf6HaUFWWM3jNFyHR6RuuGDssk_cd73dm_4YlRQgyrZKYojvJyAHr0iaMiUE3Qq3SrkHxvd5eSWgQ89GeiZTdVGVG4OmkPF6oR8ZM86V8hOLH2pMpRepEelvC8Eg95blntg2Ojb-H6c-tZCYxD-Si6ohaa-rNqu4pWskIBt4lMNMA6xI"
                />

                <div className="group relative h-64 rounded-2xl overflow-hidden border border-glass-border hover:border-white/20 transition-all cursor-pointer bg-surface-light">
                    <div className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBRspeuw4lkscE1DbD-BvZVdXcireukW_pLnO2L0w-Mov2gACmWejq0Er3-FQX_F4JOemBNACdO3gw1ohUqB4_BfVM9vr4m4TMr2N2da5_FdK-QmwmvyXfTMWKesW8Kg7RASfXmQkl_tKa9b095qHseMa3CfQ2P1xLJFGl6DwIrXeIvCxpeE15xd5kTLDxPuGgnancn0DbdlSuJbhXX7dEYLIqzoWifeo8VBVQ9OEfjIKzD-PKr2ghBhWZYRk6ZfSlZF9ufiVaBHic')" }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6">
                        <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20 mb-2 inline-block">Sci-Fi</span>
                        <h3 className="text-xl font-bold text-white">Neo-Tokyo 2099</h3>
                    </div>
                </div>

                <div className="group relative h-64 rounded-2xl border-2 border-dashed border-slate-700 hover:border-primary hover:bg-primary/5 flex flex-col items-center justify-center cursor-pointer transition-all">
                    <div className="size-16 rounded-full bg-surface-light flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-primary">add</span>
                    </div>
                    <span className="text-sm font-bold text-slate-400 group-hover:text-primary">Create New Project</span>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
