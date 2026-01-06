import React from 'react';

const AttributeField = ({ attribute, value, onChange, onRemove, linkableEntities = [] }) => {
    const plantilla = attribute.plantilla || attribute;

    const renderInput = () => {
        switch (plantilla.tipo) {
            case 'text':
                return (
                    <textarea
                        className="w-full bg-transparent text-white text-sm font-medium focus:outline-none resize-none no-scrollbar h-auto min-h-[100px]"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="..."
                    />
                );
            case 'short_text':
                return (
                    <input
                        type="text"
                        className="w-full bg-transparent text-white text-sm font-medium focus:outline-none"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="..."
                    />
                );
            case 'number':
                return (
                    <input
                        type="number"
                        className="w-full bg-transparent text-white text-sm font-medium focus:outline-none"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                    />
                );
            case 'boolean':
                return (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onChange(value === 'true' ? 'false' : 'true')}
                            className={`size-6 rounded-lg border flex items-center justify-center transition-all ${value === 'true' ? 'bg-primary border-primary text-white' : 'border-glass-border text-transparent hover:border-primary/50'}`}
                        >
                            <span className="material-symbols-outlined text-sm">check</span>
                        </button>
                        <span className="text-xs text-text-muted">{value === 'true' ? 'Enabled' : 'Disabled'}</span>
                    </div>
                );
            case 'select':
                let options = [];
                try {
                    const meta = JSON.parse(plantilla.metadata || '{}');
                    options = meta.options || [];
                } catch (e) { }
                return (
                    <div className="relative">
                        <select
                            className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 appearance-none cursor-pointer"
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                        >
                            <option value="">Select an option...</option>
                            {options.map((opt, i) => (
                                <option key={i} value={opt} className="bg-surface-dark text-white p-2">
                                    {opt}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                            <span className="material-symbols-outlined text-sm">unfold_more</span>
                        </div>
                    </div>
                );
            case 'multi_select':
                let multiOptions = [];
                try {
                    const meta = JSON.parse(plantilla.metadata || '{}');
                    multiOptions = meta.options || [];
                } catch (e) { }

                let selectedValues = [];
                try {
                    selectedValues = value ? JSON.parse(value) : [];
                    if (!Array.isArray(selectedValues)) selectedValues = [];
                } catch (e) {
                    console.error("Error parsing select values", e);
                }

                const toggleOption = (opt) => {
                    const newValues = selectedValues.includes(opt)
                        ? selectedValues.filter(v => v !== opt)
                        : [...selectedValues, opt];
                    onChange(JSON.stringify(newValues));
                };

                return (
                    <div className="bg-black/20 border border-white/5 rounded-xl p-2 space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                        {multiOptions.map((opt, i) => (
                            <label key={i} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer group transition-colors">
                                <div className={`size-4 rounded border flex items-center justify-center transition-all ${selectedValues.includes(opt) ? 'bg-primary border-primary' : 'border-white/10 group-hover:border-white/30'}`}>
                                    {selectedValues.includes(opt) && <span className="material-symbols-outlined text-[10px] text-white">check</span>}
                                </div>
                                <span className={`text-xs font-medium ${selectedValues.includes(opt) ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{opt}</span>
                            </label>
                        ))}
                        {multiOptions.length === 0 && <div className="text-xs text-slate-500 p-2 italic">No options defined.</div>}
                    </div>
                );
            case 'date':
                return (
                    <input
                        type="date"
                        className="w-full bg-transparent text-white text-sm font-medium focus:outline-none [color-scheme:dark]"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                    />
                );
            case 'entity_link':
                return (
                    <div className="relative">
                        <select
                            className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 appearance-none cursor-pointer"
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                        >
                            <option value="">Select an Entity Link...</option>
                            {linkableEntities.map((ent) => (
                                <option key={ent.id} value={ent.id} className="bg-surface-dark text-white p-2">
                                    {ent.nombre}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                            <span className="material-symbols-outlined text-sm">link</span>
                        </div>
                    </div>
                );
            case 'image':
                return (
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 bg-black/30 border border-white/5 rounded-xl px-4 py-2 text-xs text-text-muted focus:text-white focus:outline-none"
                                placeholder="Image URL..."
                                value={value || ''}
                                onChange={(e) => onChange(e.target.value)}
                            />
                        </div>
                        {value && (
                            <div className="w-full aspect-video rounded-xl bg-black/40 border border-white/5 overflow-hidden relative group">
                                <img src={value} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            </div>
                        )}
                        {!value && (
                            <div className="w-full h-20 rounded-xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center text-text-muted/30">
                                <span className="material-symbols-outlined">image</span>
                            </div>
                        )}
                    </div>
                );
            case 'table':
                const tableData = value || "[]";
                return (
                    <div className="space-y-2">
                        <textarea
                            className="w-full h-32 bg-black/30 border border-white/5 rounded-xl p-3 text-xs font-mono text-white/70 focus:outline-none focus:border-primary/50"
                            value={tableData}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder='[{"Item": "Sword", "Qty": 1}, ...]'
                        />
                        <div className="text-[10px] text-text-muted flex justify-between">
                            <span>JSON Format supported</span>
                            <span className="material-symbols-outlined text-xs">data_array</span>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="text-sm font-medium text-white/70 italic p-2 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-[10px] uppercase font-bold text-slate-500 mr-2">{plantilla.tipo}</span>
                        {value}
                    </div>
                );
        }
    };

    return (
        <div className="p-4 border border-white/5 rounded-2xl bg-surface-dark/50 backdrop-blur-sm relative overflow-hidden h-full flex flex-col group hover:border-primary/20 transition-all">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs opacity-50">label</span>
                    {plantilla.nombre}
                </div>
                {onRemove && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onRemove();
                        }}
                        className="text-white/20 hover:text-red-400 transition-colors"
                        title="Remove Attribute"
                    >
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                )}
            </label>

            <div className="flex-1 nodrag">
                {renderInput()}
            </div>

            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        </div>
    );
};

export default AttributeField;
