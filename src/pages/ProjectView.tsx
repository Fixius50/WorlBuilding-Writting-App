import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';

interface ActionCardProps {
    icon: string;
    title: string;
    desc: string;
    color: string;
    onClick: () => void;
    t: (key: string) => string;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon, title, desc, color, onClick, t }) => (
    <div
        onClick={onClick}
        className="group relative p-8 rounded-[32px] bg-background border border-white/5 hover:border-white/10 transition-all cursor-pointer flex flex-col h-full gap-6 hover:shadow-2xl hover:shadow-black/40"
    >
        <div className={`size-14 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-all duration-500`}>
            <span className="material-symbols-outlined text-3xl">{icon}</span>
        </div>
        <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white tracking-tight">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
        </div>
        <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">
            <span>{t('project.explore_tool')}</span>
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </div>
    </div>
);

const ProjectView: React.FC = () => {
    // projectName comes from the Outlet context in ArchitectLayout
    const { projectName, projectId } = useOutletContext<{ projectName: string; projectId: number | null }>();
    const navigate = useNavigate();
    const { username } = useParams<{ username: string }>();
    const { t } = useLanguage();

    const baseUrl = `/${username}/${projectName}`;
    const [user, setUser] = React.useState<any>(null);

    React.useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== "undefined") {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
            }
        }
    }, []);

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
            {/* Header */}
            <div className="h-20 border-b border-white/5 flex items-center justify-between px-12 bg-background/20 backdrop-blur-xl shrink-0">
                <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10">
                        <span className="material-symbols-outlined">auto_stories</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight uppercase">{projectName}</h1>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('project.dashboard_desc')}</p>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-7xl mx-auto p-12 space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">

                    {/* Welcome Section */}
                    <div className="space-y-4 max-w-2xl">
                        <h2 className="text-4xl font-black text-white tracking-tighter leading-tight">
                            {t('project.welcome')} <span className="text-indigo-400">{user?.displayName || t('common.architect')}</span>.
                        </h2>
                        <p className="text-slate-400 text-lg font-serif italic leading-relaxed opacity-80">
                            {t('project.welcome_desc')}
                        </p>
                    </div>

                    {/* Quick Access Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ActionCard
                            icon="menu_book"
                            title={t('project.codex_title')}
                            desc={t('project.codex_desc')}
                            color="bg-indigo-600 shadow-indigo-500/20"
                            onClick={() => navigate(`${baseUrl}/bible`)}
                            t={t}
                        />
                        <ActionCard
                            icon="map"
                            title={t('project.atlas_title')}
                            desc={t('project.atlas_desc')}
                            color="bg-emerald-600 shadow-emerald-500/20"
                            onClick={() => navigate(`${baseUrl}/map`)}
                            t={t}
                        />
                        <ActionCard
                            icon="edit_note"
                            title={t('project.chronicles_title')}
                            desc={t('project.chronicles_desc')}
                            color="bg-amber-600 shadow-amber-500/20"
                            onClick={() => navigate(`${baseUrl}/writing`)}
                            t={t}
                        />
                        <ActionCard
                            icon="hub"
                            title={t('project.graph_title')}
                            desc={t('project.graph_desc')}
                            color="bg-purple-600 shadow-purple-500/20"
                            onClick={() => navigate(`${baseUrl}/graph`)}
                            t={t}
                        />
                        <ActionCard
                            icon="calendar_month"
                            title={t('project.timeline_title')}
                            desc={t('project.timeline_desc')}
                            color="bg-rose-600 shadow-rose-500/20"
                            onClick={() => navigate(`${baseUrl}/timeline`)}
                            t={t}
                        />
                        <ActionCard
                            icon="translate"
                            title={t('project.linguistics_title')}
                            desc={t('project.linguistics_desc')}
                            color="bg-blue-600 shadow-blue-500/20"
                            onClick={() => navigate(`${baseUrl}/linguistics`)}
                            t={t}
                        />
                        <ActionCard
                            icon="analytics"
                            title={t('project.analytics_title')}
                            desc={t('project.analytics_desc')}
                            color="bg-cyan-600 shadow-cyan-500/20"
                            onClick={() => navigate(`${baseUrl}/dashboard`)}
                            t={t}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectView;
