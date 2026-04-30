import React, { useState, useMemo, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { Entidad, Carpeta } from '@domain/models/database';
import { entityService } from '@repositories/entityService';
// import { folderService } from '@repositories/folderService';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { useLanguage } from '@context/LanguageContext';

interface TableViewProps {
  projectId: number;
  allFolders: Carpeta[];
  searchTerm: string;
}

const columnHelper = createColumnHelper<Entidad>();

const BibleTableView: React.FC<TableViewProps> = ({ projectId, allFolders, searchTerm }) => {
  const { t } = useLanguage();
  const { username, projectName } = useParams();
  const [entities, setEntities] = useState<Entidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [rowSelection, setRowSelection] = useState({});

  // Consumir el contexto centralizado del ArchitectLayout para el panel derecho
  const { setRightPanelContent, setRightOpen } = useOutletContext<any>();

  // Fila de creación rápida
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('PERSONAJE');
  const [newFolderId, setNewFolderId] = useState<number | string>('null');

  const loadEntities = async () => {
    setLoading(true);
    const data = await entityService.getAllByProject(projectId);
    setEntities(data);
    setLoading(false);
  };

  useEffect(() => {
    loadEntities();
  }, [projectId]);

  const handleCreateQuick = async () => {
    if (!newName.trim()) return;
    const names = newName.split(',').map(n => n.trim()).filter(n => n.length > 0);
    const folderId = newFolderId === 'null' ? null : Number(newFolderId);

    try {
      await Promise.all(names.map(name => 
        entityService.create({
          nombre: name,
          tipo: newType,
          project_id: projectId,
          carpeta_id: folderId,
          descripcion: '',
          contenido_json: null,
          slug: '',
          folder_slug: null,
          imagen_url: null
        })
      ));
      setNewName('');
      loadEntities();
    } catch (err) {
      console.error('Error creating entities:', err);
    }
  };

  const handleBulkDelete = async () => {
    const selectedIds = Object.keys(rowSelection).map(idx => entities[Number(idx)].id);
    if (!selectedIds.length) return;
    
    if (confirm(`¿Eliminar ${selectedIds.length} entidades de forma permanente?`)) {
      try {
        await Promise.all(selectedIds.map(id => entityService.delete(id!)));
        setRowSelection({});
        loadEntities();
      } catch (err) {
        console.error('Error in bulk delete:', err);
      }
    }
  };

  const handleBulkAssignFolder = async (folderId: number | null) => {
    const selectedIds = Object.keys(rowSelection).map(idx => entities[Number(idx)].id);
    if (!selectedIds.length) return;

    try {
      await Promise.all(selectedIds.map(id => entityService.update(id!, { carpeta_id: folderId })));
      setRowSelection({});
      loadEntities();
    } catch (err) {
      console.error('Error in bulk assign:', err);
    }
  };

  const selectedCount = Object.keys(rowSelection).length;

  // Inyectar acciones masivas en el panel lateral
  useEffect(() => {
    if (selectedCount > 0) {
      setRightOpen(true);
      setRightPanelContent(
        <div className="p-6 space-y-8 animate-in fade-in slide-in-from-right-4">
          <header className="border-b border-white/10 pb-4">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Operación Masiva</div>
            <h2 className="text-xl font-bold text-foreground">{selectedCount} Seleccionados</h2>
          </header>

          <section className="space-y-4">
            <div className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Organización</div>
            <div className="space-y-2">
              <label className="text-[10px] text-foreground/60 block px-1">Mover a carpeta:</label>
              <select
                onChange={(e) => handleBulkAssignFolder(e.target.value === 'null' ? null : Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 p-3 rounded text-xs font-bold uppercase outline-none focus:border-primary/50 transition-colors"
              >
                <option value="">Seleccionar destino...</option>
                <option value="null">Raíz del Proyecto</option>
                {allFolders.map(f => (
                  <option key={f.id} value={f.id}>{f.nombre}</option>
                ))}
              </select>
            </div>
          </section>

          <section className="space-y-4 pt-8 border-t border-white/5">
            <div className="text-[10px] font-bold text-red-500/40 uppercase tracking-widest">Zona de Peligro</div>
            <button 
              onClick={handleBulkDelete}
              className="w-full flex items-center justify-center gap-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 p-4 rounded border border-red-500/20 transition-all text-xs font-black uppercase tracking-widest"
            >
              <span className="material-symbols-outlined text-sm">delete_forever</span>
              Eliminar Permanentemente
            </button>
          </section>
        </div>
      );
    } else {
      setRightPanelContent(null);
    }

    return () => setRightPanelContent(null);
  }, [selectedCount, rowSelection, allFolders]);

  const columns = useMemo(() => [
    {
      id: 'select',
      header: ({ table }: any) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="accent-primary"
        />
      ),
      cell: ({ row }: any) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="accent-primary"
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    columnHelper.accessor('nombre', {
      header: () => <span className="uppercase tracking-widest text-[10px] font-black">{t('common.name')}</span>,
      cell: info => (
        <Link 
          to={`/${username || 'local'}/${projectName}/bible/entity/${info.row.original.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-primary hover:text-primary-light font-bold transition-colors"
        >
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor('tipo', {
      header: () => <span className="uppercase tracking-widest text-[10px] font-black">{t('common.type')}</span>,
      cell: info => (
        <span className="px-2 py-1 bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-tighter rounded">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('carpeta_id', {
      header: () => <span className="uppercase tracking-widest text-[10px] font-black">{t('common.folder')}</span>,
      cell: info => {
        const folderId = info.getValue();
        const folder = allFolders.find(f => f.id === folderId);
        return (
          <span className="text-foreground/40 text-xs italic">
            {folder ? folder.nombre : 'Raíz'}
          </span>
        );
      },
    }),
    columnHelper.accessor('fecha_creacion', {
      header: () => <span className="uppercase tracking-widest text-[10px] font-black">{t('common.created_at')}</span>,
      cell: info => (
        <span className="text-[10px] text-foreground/30 font-mono">
          {new Date(info.getValue() as string).toLocaleDateString()}
        </span>
      ),
    }),
  ], [allFolders, t, username, projectName]);

  const table = useReactTable({
    data: entities,
    columns,
    state: {
      globalFilter: searchTerm,
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
  });

  if (loading) return <div className="p-10 text-center animate-pulse italic opacity-50">Sincronizando registros...</div>;

  return (
    <div className="flex-1 flex flex-col p-8 pt-0 overflow-hidden relative">
      <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col monolithic-panel border border-white/5 bg-black/20 overflow-hidden">
        <div className="overflow-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#0a0a0a] z-10">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-white/10">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="p-4 bg-white/[0.02]">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              <tr className="border-b border-primary/20 bg-primary/5 group">
                <td className="p-4"></td>
                <td className="p-4">
                  <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreateQuick()}
                    placeholder="Nombres (separados por coma)..."
                    className="w-full bg-transparent border-none outline-none text-sm placeholder:text-primary/30 text-primary font-bold italic"
                  />
                </td>
                <td className="p-4">
                  <select 
                    value={newType}
                    onChange={e => setNewType(e.target.value)}
                    className="bg-black/40 border border-white/10 p-1 rounded text-[10px] font-bold uppercase tracking-widest outline-none focus:border-primary/50"
                  >
                    <option value="ENTIDADINDIVIDUAL">Entidad Individual</option>
                    <option value="PERSONAJE">Personaje</option>
                    <option value="LUGAR">Lugar</option>
                    <option value="ORGANIZACION">Facción</option>
                    <option value="OBJETO">Objeto</option>
                    <option value="EVENTO">Evento</option>
                    <option value="MAP">Mapa</option>
                  </select>
                </td>
                <td className="p-4">
                  <select
                    value={newFolderId}
                    onChange={e => setNewFolderId(e.target.value)}
                    className="bg-black/40 border border-white/10 p-1 rounded text-[10px] font-bold uppercase tracking-widest outline-none focus:border-primary/50 w-full"
                  >
                    <option value="null">Raíz</option>
                    {allFolders.map(f => (
                      <option key={f.id} value={f.id}>{f.nombre}</option>
                    ))}
                  </select>
                </td>
                <td className="p-4">
                   <button 
                    onClick={(e) => { e.stopPropagation(); handleCreateQuick(); }}
                    disabled={!newName.trim()}
                    className="text-primary hover:text-white transition-colors p-2"
                  >
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                  </button>
                </td>
              </tr>

              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group ${row.getIsSelected() ? 'bg-primary/10' : ''}`}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="p-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BibleTableView;
