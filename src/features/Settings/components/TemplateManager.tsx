import React, { useState, useEffect } from 'react';
import { folderService } from '../../../database/folderService';
import { templateService } from '../../../database/templateService';
import { Plantilla } from '../../../database/types';
import GlassPanel from '../../../components/common/GlassPanel';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

export interface TemplateField {
  label: string;
  type: string;
  required: boolean;
  metadata: any;
}

const TemplateManager = ({ compact = false }: { compact?: boolean }) => {
 // We only need the Root Folder ID to attach the global templates to (Database requirement)
 // But logically they are global.
 const [rootFolderId, setRootFolderId] = useState<number | null>(null);
 const [templates, setTemplates] = useState<Plantilla[]>([]);
 const [loading, setLoading] = useState(false);

 // Modal State for Deletion
 const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

 useEffect(() => {
 initialize();
 }, []);

 const initialize = async () => {
 try {
 // 1. Get Root Folder for attachment (using project 1 as default for now)
 const folders = await folderService.getByProject(1);
 if (folders.length > 0) {
 setRootFolderId(folders[0].id);
 }
 // 2. Load Global Templates
 loadGlobalTemplates();
 } catch (err) {
 console.error("Init error:", err);
 }
 };

 const loadGlobalTemplates = async () => {
 setLoading(true);
 try {
 // Using 0 as convention for global project_id in templateService
 const data = await templateService.getByProject(0);
 setTemplates(data);
 } catch (err) {
 console.error("Error loading templates:", err);
 } finally {
 setLoading(false);
 }
 };

 const handleCreateTemplate = async (newField: TemplateField) => {
 try {
 // Create as Global (project_id = 0)
 await templateService.create({
 nombre: newField.label,
 tipo: newField.type,
 valor_defecto: null,
 metadata: newField.metadata ? JSON.stringify(newField.metadata) : null,
 es_obligatorio: newField.required,
 project_id: 0
 });
 loadGlobalTemplates();
 } catch (err) {
 console.error("Error creating template:", err);
 }
 };

 const confirmDeleteAction = async () => {
 if (!confirmDeleteId) return;
 try {
 await templateService.delete(confirmDeleteId);
 setTemplates(prev => prev.filter(t => t.id !== confirmDeleteId));
 } catch (err) {
 console.error("Error deleting template:", err);
 } finally {
 setConfirmDeleteId(null);
 }
 };

 return (
 <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
 <GlassPanel className={`${compact ? 'p-4 bg-transparent border-none shadow-none' : 'p-8 space-y-8'}`}>
 <header className={`flex ${compact ? 'flex-col gap-4' : 'justify-center gap-12 text-center items-center'}`}>
 <div>
 <h3 className={`${compact ? 'text-sm' : 'text-xl'} font-bold text-foreground`}>Atributos Globales</h3>
 <p className="text-xs text-foreground/60 mt-1">Define atributos disponibles para todas las entidades.</p>
 </div>
 {/* Folder Selection Removed - Global Mode */}
 </header>

 <div className="space-y-4">
 {loading ? (
 <div className="text-center p-4 text-foreground/60">Cargando plantillas...</div>
 ) : (
 templates.map((tpl, idx) => (
 <div
 key={tpl.id}
 className="flex items-center gap-4 p-4 rounded-none bg-white/[0.02] border border-foreground/10 hover:border-primary/50 hover:bg-foreground/5 transition-all cursor-grab active:cursor-grabbing group select-none"
 draggable
 onDragStart={(e) => {
 e.dataTransfer.setData('application/reactflow/type', 'attribute');
 e.dataTransfer.setData('templateId', String(tpl.id));
 e.dataTransfer.setData('templateData', JSON.stringify(tpl));
 e.dataTransfer.effectAllowed = 'copy';
 }}
 >
 <span className="text-[10px] font-black text-foreground/60 w-6 group-hover:text-primary transition-colors">0{idx + 1}</span>
 <div className="flex-1 pointer-events-none">
 <div className="text-sm font-bold text-foreground">{tpl.nombre}</div>
 <div className="text-[10px] text-foreground/60 uppercase tracking-widest">{tpl.tipo} {tpl.es_obligatorio && '• Required'}</div>
 {tpl.metadata && <div className="text-[10px] text-foreground/60 font-mono mt-1 truncate">{tpl.metadata}</div>}
 </div>
 <button
 onClick={() => setConfirmDeleteId(tpl.id)}
 className="p-1.5 text-foreground/60 hover:text-destructive hover:bg-red-500/10 rounded-none transition-colors"
 title="Eliminar Plantilla Global"
 >
 <span className="material-symbols-outlined text-sm">delete</span>
 </button>
 </div>
 ))
 )}

 <NewFieldForm onAdd={handleCreateTemplate} />
 </div>
 </GlassPanel >

 {/* Confirmation Modal */}
 < ConfirmationModal
 isOpen={!!confirmDeleteId}
 onClose={() => setConfirmDeleteId(null)}
 onConfirm={confirmDeleteAction}
 title="Eliminar Plantilla"
 message="¿Estás seguro de que quieres eliminar esta plantilla? Esta acción es irreversible."
 confirmText="Eliminar"
 type="danger"
 />
 </div >
 );
};

const NewFieldForm = ({ onAdd }: { onAdd: (field: TemplateField) => void }) => {
 const [label, setLabel] = useState('');
 const [type, setType] = useState('text');
 const [required, setRequired] = useState(false);

 // For Dropdown/MultiSelect
 const [options, setOptions] = useState(['']);

 const handleAddOption = () => setOptions([...options, '']);
 const handleRemoveOption = (idx: number) => setOptions(options.filter((_, i) => i !== idx));
 const handleOptionChange = (idx: number, val: string) => {
 const newOpts = [...options];
 newOpts[idx] = val;
 setOptions(newOpts);
 };

 const handleSubmit = () => {
 if (!label) return;

 let metadata = null;
 if (['select', 'multi_select'].includes(type)) {
 metadata = { options: options.filter(o => o.trim()) };
 }

 onAdd({ label, type, required, metadata });
 setLabel('');
 setOptions(['']);
 };

 return (
 <div className="p-4 rounded-none border-2 border-dashed border-foreground/40 bg-white/[0.01] space-y-4">
 <h4 className="text-xs font-black uppercase tracking-widest text-primary">Add New Attribute</h4>
 <div className="grid grid-cols-2 gap-4">
 <input
 placeholder="Field Name"
 value={label}
 onChange={e => setLabel(e.target.value)}
 className="monolithic-panel rounded-none px-4 py-2 text-xs text-foreground outline-none focus:border-primary/30 min-w-0"
 />
 <select
 value={type}
 onChange={e => setType(e.target.value)}
 className="monolithic-panel rounded-none px-4 py-2 text-xs text-foreground outline-none"
 >
 <option className="bg-[#1a1a20] text-foreground" value="text">Text (Long)</option>
 <option className="bg-[#1a1a20] text-foreground" value="short_text">Text (Short)</option>
 <option className="bg-[#1a1a20] text-foreground" value="number">Number</option>
 <option className="bg-[#1a1a20] text-foreground" value="date">Date</option>
 <option className="bg-[#1a1a20] text-foreground" value="select">Single Selection (Dropdown)</option>
 <option className="bg-[#1a1a20] text-foreground" value="multi_select">Multiple Selection</option>
 <option className="bg-[#1a1a20] text-foreground" value="boolean">Switch (True/False)</option>
 </select>
 </div>

 {['select', 'multi_select'].includes(type) && (
 <div className="space-y-2">
 <label className="text-[10px] font-bold text-foreground/60 uppercase">Options</label>
 <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
 {options.map((opt, idx) => (
 <div key={idx} className="flex gap-2">
 <input
 placeholder={`Option ${idx + 1}`}
 value={opt}
 onChange={e => handleOptionChange(idx, e.target.value)}
 className="flex-1 monolithic-panel rounded-none px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary/30"
 />
 <button
 onClick={() => handleRemoveOption(idx)}
 className="p-1.5 hover:bg-red-500/20 text-foreground/60 hover:text-red-400 rounded-none transition-colors"
 >
 <span className="material-symbols-outlined text-sm">close</span>
 </button>
 </div>
 ))}
 </div>
 <button
 onClick={handleAddOption}
 className="w-full py-1.5 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5 rounded-none border border-dashed border-primary/20 transition-all"
 >
 + Add Custom Option
 </button>
 </div>
 )}

 <div className="flex justify-between items-center">
 <label className="flex items-center gap-2 cursor-pointer">
 <input type="checkbox" checked={required} onChange={e => setRequired(e.target.checked)} className="size-4 rounded border-foreground/40 bg-foreground/5 accent-primary" />
 <span className="text-[10px] font-bold text-foreground/60">Required Field</span>
 </label>
 <button onClick={handleSubmit} className="px-4 py-2 bg-primary/20 text-primary rounded-none text-xs font-bold hover:bg-primary/30 transition-all">
 + Add Field
 </button>
 </div>
 </div>
 );
};

export default TemplateManager;
