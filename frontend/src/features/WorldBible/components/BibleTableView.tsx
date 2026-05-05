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
import { useRightPanelStore } from '@store/useRightPanelStore';
import CreateMassEntitiesModal from './CreateMassEntitiesModal';

interface TableViewProps {
  projectId: number;
  allFolders: Carpeta[];
  searchTerm: string;
  handleOpenCreateModal?: (parentFolder?: any) => void;
}

const columnHelper = createColumnHelper<Entidad>();

const BibleTableView: React.FC<TableViewProps> = ({ projectId, allFolders, searchTerm, handleOpenCreateModal }) => {
  const { t } = useLanguage();
  const { username, projectName } = useParams();
  const [entities, setEntities] = useState<Entidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [rowSelection, setRowSelection] = useState({});

  // Consumir el store centralizado para el panel derecho
  const { openPanel, closePanel, isOpen: isPanelOpen } = useRightPanelStore();

  const [isMassCreateOpen, setIsMassCreateOpen] = useState(false);
  const [newEntityName, setNewEntityName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const loadEntities = async () => {
    setLoading(true);
    const data = await entityService.getAllByProject(projectId);
    setEntities(data);
    setLoading(false);
  };

  useEffect(() => {
    loadEntities();
  }, [projectId]);


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

  // Inyectar acciones masivas en el panel lateral mediante el store
  useEffect(() => {
    if (selectedCount > 0) {
      openPanel('bulk', null, `${selectedCount} Seleccionados`);
    } else if (isPanelOpen) {
      closePanel();
    }
  }, [selectedCount, openPanel, closePanel]);

  const handleGhostCreate = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newEntityName.trim() && !isCreating) {
      setIsCreating(true);
      try {
        await entityService.create({
          nombre: newEntityName.trim(),
          tipo: 'entidadindividual',
          project_id: projectId,
          carpeta_id: null,
          descripcion: '',
          slug: newEntityName.trim().toLowerCase().replace(/\s+/g, '-'),
          contenido_json: null,
          folder_slug: null,
          imagen_url: null
        });
        setNewEntityName('');
        await loadEntities();
      } catch (err) {
        console.error('Error creating entity from ghost row:', err);
      } finally {
        setIsCreating(false);
      }
    }
  };

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
        <span className="px-2 py-1 bg-foreground/[0.03] border border-foreground/10 text-[10px] font-bold uppercase tracking-tighter rounded-none">
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
        <div className="flex items-center justify-between p-6 bg-background border-b border-white/10">
          <div className="flex items-center gap-4">
             <div className="size-2 bg-primary animate-pulse" />
             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Registros de la Biblia</h3>
          </div>
          <button 
            onClick={() => setIsMassCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            Crear en Serie
          </button>
        </div>
        <div className="overflow-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#0a0a0a] z-10">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-white/10">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="p-4 bg-background">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
            <tr className="bg-background group/ghost">
              <td className="p-3 border-b border-foreground/10">
                <div className="size-4 border border-foreground/20 rounded-none bg-foreground/5 flex items-center justify-center">
                   <span className="material-symbols-outlined text-[10px] text-primary/40">add</span>
                </div>
              </td>
              <td className="p-2 border-b border-foreground/10">
                <input
                  type="text"
                  placeholder="Nombre de la nueva entidad... (Enter para crear)"
                  value={newEntityName}
                  onChange={(e) => setNewEntityName(e.target.value)}
                  onKeyDown={handleGhostCreate}
                  disabled={isCreating}
                  className="w-full bg-transparent border-none outline-none text-xs text-primary font-bold placeholder:text-foreground/20"
                  autoFocus
                />
              </td>
              <td className="p-2 border-b border-foreground/10">
                <span className="text-[9px] font-black uppercase py-1 px-2 bg-primary/10 text-primary border border-primary/20">INDIVIDUAL</span>
              </td>
              <td className="p-2 border-b border-foreground/10">
                 <span className="text-[9px] opacity-30 italic">Automático</span>
              </td>
            </tr>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className={`border-b border-foreground/[0.03] hover:bg-background transition-colors group ${row.getIsSelected() ? 'bg-primary/10' : ''}`}>
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

      <CreateMassEntitiesModal 
        isOpen={isMassCreateOpen}
        onClose={() => setIsMassCreateOpen(false)}
        onCreated={loadEntities}
        projectId={projectId}
        allFolders={allFolders}
        handleOpenCreateModal={handleOpenCreateModal}
      />
    </div>
  );
};

export default BibleTableView;
