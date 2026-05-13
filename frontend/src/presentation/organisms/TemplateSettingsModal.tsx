import React, { useState } from 'react';
import { Plantilla } from '@domain/models/database';
import { templateService } from '@repositories/templateService';
import '@assets/attributes.css';

interface TemplateSettingsModalProps {
  template: Plantilla;
  onClose: () => void;
  onSave: () => void;
}

const TemplateSettingsModal: React.FC<TemplateSettingsModalProps> = ({ template, onClose, onSave }) => {
  const [nombre, setNombre] = useState(template.nombre);
  const [tipo, setTipo] = useState(template.tipo);
  
  // Parsear opciones actuales de los metadatos JSON
  const initialMeta = typeof template.metadata === 'string' 
    ? JSON.parse(template.metadata || '{"options":[]}') 
    : (template.metadata || { options: [] });
    
  const [options, setOptions] = useState<string[]>(initialMeta.options || []);
  const [newOption, setNewOption] = useState('');

  const handleAddOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const handleRemoveOption = (opt: string) => {
    setOptions(options.filter(o => o !== opt));
  };

  const handleSave = async () => {
    const updatedMeta = { ...initialMeta, options };
    await templateService.update(template.id, {
      nombre,
      tipo: tipo as unknown as Plantilla['tipo'],
      metadata: JSON.stringify(updatedMeta)
    });
    onSave();
  };

  return (
    <div className="attr-modal-overlay" onClick={onClose}>
      <div className="attr-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="attr-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="material-symbols-outlined text-primary">settings_suggest</span>
            <h2 style={{ fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Configurar Atributo</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ color: 'hsla(var(--foreground), 0.4)' }}>close</span>
          </button>
        </div>

        {/* Body */}
        <div className="attr-modal-body">
          {/* Nombre */}
          <div className="attr-modal-section">
            <label className="attr-label-wrapper" style={{ color: 'hsla(var(--foreground), 0.4)' }}>Nombre del Atributo</label>
            <input 
              type="text" 
              className="attr-modal-input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          {/* Tipo de Selector */}
          <div className="attr-modal-section">
            <label className="attr-label-wrapper" style={{ color: 'hsla(var(--foreground), 0.4)' }}>Tipo de Selector</label>
            <div className="attr-modal-btn-group">
              <button 
                onClick={() => setTipo('select')}
                className={`attr-modal-type-btn ${tipo === 'select' ? 'active' : ''}`}
              >
                Único
              </button>
              <button 
                onClick={() => setTipo('multi_select')}
                className={`attr-modal-type-btn ${tipo === 'multi_select' ? 'active' : ''}`}
              >
                Múltiple
              </button>
            </div>
          </div>

          {/* Gestión de Opciones */}
          {(tipo === 'select' || tipo === 'multi_select') && (
            <div className="attr-modal-section">
              <label className="attr-label-wrapper" style={{ color: 'hsla(var(--foreground), 0.4)' }}>Opciones del Desplegable</label>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <input 
                  type="text" 
                  className="attr-modal-input"
                  style={{ flex: 1 }}
                  placeholder="Nueva opción..."
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddOption()}
                />
                <button 
                  onClick={handleAddOption}
                  className="attr-btn-primary"
                  style={{ flex: 'none', padding: '0 1rem' }}
                >
                  Add
                </button>
              </div>

              <div className="attr-modal-options-container custom-scrollbar">
                {options.map((opt, i) => (
                  <div key={i} className="attr-modal-option-row">
                    <span style={{ fontSize: '0.75rem' }}>{opt}</span>
                    <button 
                      onClick={() => handleRemoveOption(opt)} 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsla(var(--foreground), 0.2)' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>delete</span>
                    </button>
                  </div>
                ))}
                {options.length === 0 && (
                  <div style={{ fontSize: '0.625rem', fontStyle: 'italic', opacity: 0.3, textAlign: 'center', padding: '1rem 0' }}>
                    No hay opciones definidas aún
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="attr-modal-footer">
          <button 
            onClick={onClose}
            className="attr-btn-secondary"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            className="attr-btn-primary"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateSettingsModal;
