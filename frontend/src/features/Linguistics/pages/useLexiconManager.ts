import { useState, useEffect, useCallback } from 'react';
import { EntityUseCase } from '@features/Entities';
import { TemplateUseCase } from '@features/Settings';
import { Entidad, Word } from '@domain/database';
import { GrammarRule } from '../components/LinguisticsSidebar';

export const useLexiconManager = (projectParam: string | undefined) => {
  const [lexicon, setLexicon] = useState<Word[]>([]);
  const [rules, setRules] = useState<GrammarRule[]>([]);
  const [activeLangId, setActiveLangId] = useState<number | null>(null);
  const [langName, setLangName] = useState('...');
  const [stats, setStats] = useState({ words: 0, rules: 0, glyphs: 0 });
  const [foundryGlyphs, setFoundryGlyphs] = useState<Word[]>([]);

  const loadRules = useCallback(async (langId: number, allEntities: Entidad[]) => {
    const langRules: GrammarRule[] = allEntities
      .filter(e => (e.tipo === 'Rule' || e.tipo === 'Regla') && e.carpeta_id === langId)
      .map(r => {
        const data = JSON.parse(r.contenido_json || '{}');
        return {
          id: r.id,
          titulo: data.titulo || r.nombre || 'Sin tÃ­tulo',
          descripcion: data.contenido || r.descripcion || '',
          status: data.status || 'draft'
        };
      });
    setRules(langRules);
  }, []);

  const loadLexicon = useCallback(async (langId: number, allEntities: Entidad[]) => {
    const langWords = allEntities.filter(e => 
      (e.tipo === 'Word' || e.tipo === 'Palabra') && e.carpeta_id === langId
    ).map(w => ({ ...w, ...JSON.parse(w.contenido_json || '{}') }));
    
    setLexicon(langWords);
    setFoundryGlyphs(langWords.filter((item: Word) =>
      ['GLYPH', 'GLYFO', 'GLIFO'].includes(item.categoriaGramatical) ||
      (item.svgPathData && item.lema?.length === 1)
    ));
  }, []);

  const loadData = useCallback(async () => {
    try {
      const entities = await EntityUseCase.getAllByProject(Number(projectParam ?? '0') || 0);
      const langs = entities.filter(e => e.tipo === 'Conlang');
      if (langs.length > 0) {
        const active = langs[0];
        setActiveLangId(active.id);
        setLangName(active.nombre);
        
        const children = await EntityUseCase.getByFolder(active.id);
        loadLexicon(active.id, children);
        loadRules(active.id, children);
        
        const words = children.filter(e => e.tipo === 'Word');
        setStats({ 
          words: words.length, 
          rules: 0, 
          glyphs: words.filter(e => {
            const data = JSON.parse(e.contenido_json ?? '{}');
            return data.svgPathData;
          }).length 
        });
      }
    } catch (err) {
      // [LOG REMOVED]
    }
  }, [projectParam, loadLexicon, loadRules]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveWord = async (updatedData: Word & { isNew?: boolean }, editingWordId?: number | string) => {
    if (!activeLangId) return;
    
    const entityData: Omit<Entidad, 'id' | 'fecha_creacion'> = {
      nombre: updatedData.lema,
      tipo: 'Word',
      project_id: Number(projectParam) || 0,
      carpeta_id: activeLangId,
      descripcion: updatedData.definicion || '',
      contenido_json: JSON.stringify(updatedData),
      slug: '',
      folder_slug: null,
      imagen_url: null,
      fecha_actualizacion: new Date().toISOString(),
      borrado: 0
    };

    if (updatedData.isNew) {
      await EntityUseCase.create(entityData);
    } else if (editingWordId) {
      await EntityUseCase.update(Number(editingWordId), entityData);
    }
    
    await loadData();
  };

  const deleteWord = async (id: number | string) => {
    await EntityUseCase.delete(Number(id));
    await loadData();
  };

  return {
    lexicon,
    rules,
    activeLangId,
    langName,
    stats,
    foundryGlyphs,
    loadData,
    saveWord,
    deleteWord
  };
};

