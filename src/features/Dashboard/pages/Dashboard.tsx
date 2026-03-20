import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import { entityService } from '../../../database/entityService';
import { folderService } from '../../../database/folderService';
import { Entidad } from '../../../database/types';
import GlassPanel from '../../../components/common/GlassPanel';

const Dashboard: React.FC = () => {
 const { projectId } = useOutletContext<{ projectId: number }>();
 const [stats, setStats] = useState({
 entityCount: 0,
 folderCount: 0,
 entitiesByType: [] as any[],
 recentActivity: [] as Entidad[]
 });

 useEffect(() => {
 if (projectId) {
 loadStats();
 }
 }, [projectId]);

 const loadStats = async () => {
 try {
 const entities = await entityService.getAllByProject(projectId);
 const folders = await folderService.getByProject(projectId);
 
 // Group by type
 const typeMap: Record<string, number> = {};
 entities.forEach(e => {
 const type = e.tipo || 'Sin tipo';
 typeMap[type] = (typeMap[type] || 0) + 1;
 });

 const entitiesByType = Object.entries(typeMap).map(([id, value]) => ({
 id,
 label: id,
 value,
 color: `hsl(${Math.random() * 360}, 70%, 50%)`
 }));

 setStats({
 entityCount: entities.length,
 folderCount: folders.length,
 entitiesByType,
 recentActivity: entities.slice(0, 5)
 });
 } catch (err) {
 console.error("Error loading dashboard stats", err);
 }
 };

 return (
 <div className="flex-1 flex flex-col h-full bg-[#0a0a0c] overflow-y-auto custom-scrollbar p-8">
 <header className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
 <h1 className="text-4xl font-black text-foreground tracking-tight mb-2 uppercase">Centro de Mando</h1>
 <p className="text-foreground/60 font-serif italic text-lg opacity-80">Panorama analítico de tu universo creativo.</p>
 </header>

 {/* Quick Stats Grid */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
 <StatCard title="Entidades Totales" value={stats.entityCount} icon="inventory_2" color="text-indigo-400" />
 <StatCard title="Carpetas" value={stats.folderCount} icon="folder" color="text-emerald-400" />
 <StatCard title="Relaciones" value={12} icon="hub" color="text-purple-400" />
 <StatCard title="Sistemas Lingüísticos" value={2} icon="translate" color="text-rose-400" />
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
 {/* Pie Chart: Distribution by Type */}
 <GlassPanel className="h-[400px] p-6 flex flex-col">
 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60 mb-6 px-2">Distribución de Entidades</h3>
 <div className="flex-1 min-h-0">
 {stats.entitiesByType.length > 0 ? (
 <ResponsivePie
 data={stats.entitiesByType}
 margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
 innerRadius={0.6}
 padAngle={2}
 cornerRadius={8}
 colors={{ scheme: 'nivo' }}
 borderWidth={0}
 enableArcLinkLabels={true}
 arcLinkLabelsTextColor="#94a3b8"
 arcLinkLabelsThickness={2}
 arcLabelsSkipAngle={10}
 theme={{
 tooltip: { container: { background: '#1e1e26', color: '#fff', fontSize: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' } },
 labels: { text: { fontSize: 10, fontWeight: 800, fill: '#fff' } }
 }}
 />
 ) : (
 <div className="h-full flex items-center justify-center text-foreground/60 text-xs italic">No hay datos suficientes</div>
 )}
 </div>
 </GlassPanel>

 {/* Bar Chart: Simplified Activity Placeholder */}
 <GlassPanel className="h-[400px] p-6 flex flex-col">
 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60 mb-6 px-2">Densidad Geográfica (Zonas)</h3>
 <div className="flex-1 min-h-0">
 <ResponsiveBar
 data={[
 { zone: 'Norte', count: 12 },
 { zone: 'Sur', count: 45 },
 { zone: 'Este', count: 23 },
 { zone: 'Oeste', count: 31 },
 ]}
 keys={['count']}
 indexBy="zone"
 margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
 padding={0.4}
 valueScale={{ type: 'linear' }}
 indexScale={{ type: 'band', round: true }}
 colors="#6366f1"
 borderRadius={6}
 axisBottom={{
 tickSize: 0,
 tickPadding: 15,
 legend: '',
 legendPosition: 'middle',
 legendOffset: 32
 }}
 theme={{
 axis: {
 ticks: { text: { fill: '#64748b', fontSize: 10, fontWeight: 600 } },
 domain: { line: { stroke: 'rgba(255,255,255,0.05)' } }
 },
 grid: { line: { stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 } },
 tooltip: { container: { background: '#1e1e26', color: '#fff', fontSize: '10px', borderRadius: '8px' } }
 }}
 />
 </div>
 </GlassPanel>
 </div>

 {/* Recent Activity List */}
 <GlassPanel className="p-8">
 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60 mb-8">Cronología de Cambios Recientes</h3>
 <div className="space-y-4">
 {stats.recentActivity.map((e, idx) => (
 <div key={e.id} className="flex items-center justify-between p-4 rounded-none bg-white/[0.02] border border-foreground/10 hover:border-foreground/40 transition-all group">
 <div className="flex items-center gap-4">
 <div className="size-10 rounded-none bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
 <span className="material-symbols-outlined text-sm">edit_document</span>
 </div>
 <div>
 <h4 className="text-sm font-bold text-foreground mb-0.5">{e.nombre}</h4>
 <p className="text-[10px] text-foreground/60 font-medium">Modificado en {new Date(e.fecha_creacion).toLocaleDateString()}</p>
 </div>
 </div>
 <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 px-3 py-1 rounded bg-indigo-400/10">{e.tipo}</span>
 </div>
 ))}
 {stats.recentActivity.length === 0 && <p className="text-xs text-foreground/60 italic text-center py-8">Aún no hay actividad registrada.</p>}
 </div>
 </GlassPanel>
 </div>
 );
};

const StatCard: React.FC<{ title: string; value: number | string; icon: string; color: string }> = ({ title, value, icon, color }) => (
 <GlassPanel className="p-6 flex items-center gap-5 hover:border-foreground/40 transition-all cursor-default">
 <div className={`size-12 rounded-none bg-white/[0.03] flex items-center justify-center ${color} shadow-lg`}>
 <span className="material-symbols-outlined text-2xl">{icon}</span>
 </div>
 <div>
 <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1">{title}</p>
 <p className="text-2xl font-black text-foreground">{value}</p>
 </div>
 </GlassPanel>
);

export default Dashboard;
