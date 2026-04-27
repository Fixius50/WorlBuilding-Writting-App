import React, { useState } from 'react';
import Button from '@atoms/Button';
import GlassPanel from '@atoms/GlassPanel';
import { useLanguage } from '@context/LanguageContext';

const AdvancedLinguistics: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'conjugation' | 'phonetics'>('conjugation');
  const [inputText, setInputText] = useState('');
  const [rule, setRule] = useState('-[e]s');
  const [result, setResult] = useState<string[]>([]);

  const handleGenerate = () => {
    if (activeTab === 'conjugation') {
        const words = inputText.split(',').map(w => w.trim());
        const suffix = rule.startsWith('-') ? rule.substring(1) : rule;
        
        const generated = words.map(w => {
            if (suffix.startsWith('[') && suffix.includes(']')) {
                const char = suffix.match(/\[(.*?)\]/)?.[1];
                const rest = suffix.split(']')[1];
                return w.endsWith(char!) ? w + rest : w + char + rest;
            }
            return w + suffix;
        });
        setResult(generated);
    } else {
        // Simple Phonetic Evolution (Placeholder logic)
        const evolved = inputText.split(',').map(w => w.trim().replace(/p/g, 'b').replace(/t/g, 'd').replace(/k/g, 'g'));
        setResult(evolved);
    }
  };

  return (
    <div className="h-full w-full p-8 bg-background overflow-y-auto no-scrollbar">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground">
            Motor Lingüístico Avanzado
          </h1>
          <div className="flex gap-4 mt-6">
            <button 
              onClick={() => setActiveTab('conjugation')}
              className={`pb-2 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'conjugation' ? 'text-primary border-b-2 border-primary' : 'text-foreground/40 hover:text-foreground'}`}
            >
              Conjugador Pro
            </button>
            <button 
              onClick={() => setActiveTab('phonetics')}
              className={`pb-2 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'phonetics' ? 'text-primary border-b-2 border-primary' : 'text-foreground/40 hover:text-foreground'}`}
            >
              Evolución Fonética
            </button>
          </div>
        </header>

        <GlassPanel className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Entrada (Separado por comas)</label>
              <textarea 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="ama, corre, vive..."
                className="w-full h-32 bg-foreground/5 border border-foreground/10 p-4 text-sm outline-none focus:border-primary/50"
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                {activeTab === 'conjugation' ? 'Regla de Sufijo (ej: -[e]s)' : 'Reglas de Cambio (Proximamente)'}
              </label>
              {activeTab === 'conjugation' ? (
                  <input 
                    type="text" 
                    value={rule}
                    onChange={(e) => setRule(e.target.value)}
                    className="w-full bg-foreground/5 border border-foreground/10 p-4 text-sm outline-none focus:border-primary/50"
                  />
              ) : (
                  <div className="p-4 border border-dashed border-foreground/20 text-[10px] text-foreground/40 italic">
                      Las reglas de evolución (ej: p {'>'} b) se configurarán en la interfaz de matrices fonéticas.
                  </div>
              )}
              <Button variant="primary" className="w-full !py-4" onClick={handleGenerate}>
                Procesar Transformación
              </Button>
            </div>
          </div>

          {result.length > 0 && (
              <div className="pt-8 border-t border-foreground/5">
                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 block mb-4">Resultado Generado</label>
                <div className="flex flex-wrap gap-2">
                    {result.map((r, i) => (
                        <span key={i} className="px-4 py-2 bg-primary/10 border border-primary/20 text-primary font-bold text-sm">
                            {r}
                        </span>
                    ))}
                </div>
              </div>
          )}
        </GlassPanel>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassPanel className="p-6 border-l-4 border-emerald-500/50">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-2">Tip de Conjugación</h4>
                <p className="text-[11px] text-foreground/40 leading-relaxed italic">
                    Usa corchetes para opcionales: <code className="text-primary/60">-[e]r</code> añadirá 'er' si la palabra no termina en 'e', o solo 'r' si ya la tiene.
                </p>
            </GlassPanel>
            <GlassPanel className="p-6 border-l-4 border-amber-500/50">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-2">Evolución Diacrónica</h4>
                <p className="text-[11px] text-foreground/40 leading-relaxed italic">
                    Esta herramienta permite proyectar cómo cambiarían tus palabras a lo largo de los siglos (Lenición, Palatalización, etc).
                </p>
            </GlassPanel>
        </section>

        <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground/40">Matriz Fonética de Referencia</h3>
            <div className="grid grid-cols-6 gap-px bg-foreground/10 border border-foreground/10">
                {['Bilabial', 'Labiodental', 'Dental', 'Alveolar', 'Palatal', 'Velar'].map(h => (
                    <div key={h} className="bg-background/80 p-2 text-[8px] font-black uppercase text-primary/60 text-center">{h}</div>
                ))}
                {Array.from({ length: 18 }).map((_, i) => (
                    <div key={i} className="bg-background/40 p-4 h-12 flex items-center justify-center text-xs font-serif text-foreground/20 hover:bg-primary/5 transition-colors cursor-crosshair">
                        ?
                    </div>
                ))}
            </div>
        </section>
      </div>
    </div>
  );
};

export default AdvancedLinguistics;
