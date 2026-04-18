import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { entityService } from '@repositories/entityService';
import { relationshipService } from '@repositories/relationshipService';
import { Entidad } from '@domain/models/database';
import Button from '@atoms/Button';
import GlassPanel from '@atoms/GlassPanel';
import Avatar from '@atoms/Avatar';

interface CharacterExtras {
  imagenUrl?: string;
  estado?: string;
  apellidos?: string;
  origen?: string;
  comportamiento?: string;
  appearance?: string;
  notes?: string;
}

interface CharacterRelationship {
  entidadDestino?: {
    nombre?: string;
  };
  tipoRelacion?: string;
}

interface CharacterData extends Entidad, CharacterExtras {
  relaciones?: CharacterRelationship[]; 
}

interface CharacterViewProps {
  id: string | number;
}

const CharacterView: React.FC<CharacterViewProps> = ({ id }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [entity, setEntity] = useState<Entidad | null>(null);
  const [character, setCharacter] = useState<CharacterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadCharacter();
  }, [id]);

  const loadCharacter = async () => {
    setLoading(true);
    try {
      const data = await entityService.getById(Number(id));
      if (data) {
        setEntity(data);
        const extra = typeof data.contenido_json === 'string'
          ? JSON.parse(data.contenido_json)
          : (data.contenido_json || {});
        
        // Fetch relationships for this character
        const relations = await relationshipService.getByEntity(data.id);
        
        setCharacter({
          ...data,
          ...extra,
          relaciones: relations
        });
      }
    } catch (err) {
      console.error("Error loading character:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!entity || !character) return;
    try {
      const { nombre, tipo, descripcion, ...rest } = character;
      const extra: Record<string, any> = { ...rest };
      // We don't save relationships back as part of entity update
      delete extra.relaciones;

      await entityService.update(entity.id, {
        nombre,
        tipo,
        descripcion,
        contenido_json: JSON.stringify(extra)
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving:", err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Move this character to the Trash Bin?")) return;
    try {
      if (entity) await entityService.delete(entity.id);
      navigate(-1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (field: keyof CharacterData, value: unknown) => {
    setCharacter(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

 if (loading) return <div className="p-20 text-center text-foreground/60 animate-pulse">Summoning entity...</div>;
 if (!character) return <div className="p-20 text-center text-destructive">Character not found in the archives.</div>;

 return (
 <div className="flex h-full">
 {/* Main Content */}
 <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-8 gap-6">

 {/* Header */}
 <div className="flex items-start gap-6">
 <div className="relative">
 <Avatar
 url={character.imagenUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop"}
 size="xl"
 className="rounded-none border-2 border-primary shadow-[0_0_30px_rgba(99,102,242,0.3)]"
 />
 </div>

 <div className="flex-1">
 <div className="flex items-center gap-3 mb-1">
 <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">{character.estado || 'ACTIVE'}</span>
 <span className="text-xs font-bold text-foreground/60 sunken-panel px-2 py-0.5 rounded border border-foreground/10">{character.tipo || 'Unknown'}</span>
 </div>
 <h1 className="text-4xl font-bold text-foreground mb-2">{character.nombre} {character.apellidos}</h1>
 <p className="text-lg text-foreground/60">{character.origen || 'Traveling the void'}</p>
 </div>

 <div className="flex gap-2">
 {!isEditing && (
 <Button className="border-red-500/30 text-red-400 hover:bg-red-500/10" icon="delete" onClick={handleDelete}>
 Delete
 </Button>
 )}
 <Button variant="secondary" icon={isEditing ? 'close' : 'edit'} onClick={() => setIsEditing(!isEditing)}>
 {isEditing ? 'Cancel' : 'Edit Profile'}
 </Button>
 {isEditing && <Button variant="primary" icon="save" onClick={handleSave}>Save Changes</Button>}
 </div>
 </div>

 {/* Tabs */}
 <div className="border-b border-foreground/10 flex gap-6">
 {['Overview', 'Biography', 'Attributes & Stats', 'Relationships'].map(tab => (
 <button
 key={tab}
 onClick={() => setActiveTab(tab.toLowerCase())}
 className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === tab.toLowerCase() ? 'text-primary border-primary' : 'text-foreground/60 border-transparent hover:text-foreground'}`}
 >
 {tab}
 </button>
 ))}
 </div>

 {/* Content Grid */}
 <div className="grid grid-cols-3 gap-6">
 {/* Left Col */}
 <div className="col-span-1 space-y-6">
 <GlassPanel className="p-4">
 <h3 className="text-xs font-bold text-foreground/60 uppercase tracking-wider mb-4 flex items-center gap-2">
 <span className="material-symbols-outlined text-sm">fingerprint</span> Identity
 </h3>
 <div className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-xs text-foreground/60 block mb-1">Name</label>
 <input type="text" value={character.nombre} onChange={(e) => handleChange('nombre', e.target.value)} className="w-full sunken-panel border border-foreground/40 rounded px-3 py-2 text-foreground text-sm" readOnly={!isEditing} />
 </div>
 <div>
 <label className="text-xs text-foreground/60 block mb-1">Surnames</label>
 <input type="text" value={character.apellidos || ''} onChange={(e) => handleChange('apellidos', e.target.value)} className="w-full sunken-panel border border-foreground/40 rounded px-3 py-2 text-foreground text-sm" readOnly={!isEditing} />
 </div>
 </div>
 <div>
 <label className="text-xs text-foreground/60 block mb-1">Type / Species</label>
 <input type="text" value={character.tipo || ''} onChange={(e) => handleChange('tipo', e.target.value)} className="w-full sunken-panel border border-foreground/40 rounded px-3 py-2 text-foreground text-sm" readOnly={!isEditing} />
 </div>
 <div>
 <label className="text-xs text-foreground/60 block mb-1">Origin</label>
 <input type="text" value={character.origen || ''} onChange={(e) => handleChange('origen', e.target.value)} className="w-full sunken-panel border border-foreground/40 rounded px-3 py-2 text-foreground text-sm" readOnly={!isEditing} />
 </div>
 </div>
 </GlassPanel>


 </div>

 {/* Center/Right Col: Unified Narrative & Relations */}
 <div className="col-span-2 space-y-6">
 <GlassPanel className="p-6 relative overflow-hidden group">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-xs font-bold text-foreground/60 uppercase tracking-wider flex items-center gap-2">
 <span className="material-symbols-outlined text-sm">auto_stories</span> Narrative & Connections
 </h3>
 {!isEditing && <span className="text-[10px] text-foreground/60 bg-foreground/5 px-2 py-1 rounded">Read Only</span>}
 </div>

 {/* Backstory Section */}
 <div className="mb-8">
 <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 opacity-80">Biography</h4>
 <textarea
 value={character.descripcion || ''}
 onChange={(e) => handleChange('descripcion', e.target.value)}
 readOnly={!isEditing}
 className={`w-full bg-transparent border-none outline-none text-foreground/60 text-sm leading-relaxed resize-none custom-scrollbar ${isEditing ? 'min-h-[150px] placeholder-white/20' : 'h-auto overflow-hidden'}`}
 placeholder="Write the history of this person..."
 />

 <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mt-6 mb-3 opacity-80">Behavior & Personality</h4>
 <textarea
 value={character.comportamiento || ''}
 onChange={(e) => handleChange('comportamiento', e.target.value)}
 readOnly={!isEditing}
 className={`w-full bg-transparent border-none outline-none text-foreground/60 text-sm leading-relaxed resize-none custom-scrollbar ${isEditing ? 'min-h-[100px]' : 'h-auto overflow-hidden'}`}
 placeholder="How does this person act?"
 />
 </div>

 {/* Relations Section (Merged) */}
 <div className="pt-6 border-t border-foreground/10">
 <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2 opacity-80">
 <span className="material-symbols-outlined text-sm">hub</span> Established Connections
 </h4>

 {character.relaciones && character.relaciones.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {character.relaciones.map((rel: CharacterRelationship, i: number) => (
 <div key={i} className="flex items-center gap-3 p-3 bg-foreground/5 rounded-none border border-foreground/10 hover:border-primary/30 transition-colors">
 <div className="size-8 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-bold">
 {rel.entidadDestino?.nombre?.charAt(0) || '?'}
 </div>
 <div className="flex-1 min-w-0">
 <div className="text-sm font-bold text-foreground truncate">{rel.entidadDestino?.nombre || 'Unknown'}</div>
 <div className="text-[10px] text-primary truncate">{rel.tipoRelacion || 'Connected'}</div>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="p-6 text-center bg-foreground/5 rounded-none border border-dashed border-foreground/40">
 <p className="text-xs text-foreground/60 italic">No relationships recorded yet.</p>
 </div>
 )}
 </div>
 </GlassPanel>
 </div>
 </div>
 </div>

 {/* Right Sidebar (Split View Placeholder) */}
 <div className="w-80 border-l border-foreground/10 monolithic-panel/50 hidden xl:flex flex-col">
 <div className="p-4 border-b border-foreground/10 flex justify-between items-center">
 <span className="text-xs font-bold text-foreground/60">QUICK NOTES</span>
 <button className="text-foreground/60 hover:text-foreground"><span className="material-symbols-outlined text-sm">open_in_new</span></button>
 </div>
 <div className="p-4 flex-1">
 <textarea className="w-full h-full bg-transparent border-none outline-none text-sm text-foreground/60 placeholder-slate-600 resize-none" placeholder="Draft a quick scene or jot down notes for Elara here..."></textarea>
 </div>
 <div className="p-2 border-t border-foreground/10 text-right text-[10px] text-foreground/60">
 0 words
 </div>
 </div>
 </div>
 );
};

export default CharacterView;
