import React, { useState, useMemo, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getFilteredRowModel,
  HeaderContext,
  CellContext,
} from '@tanstack/react-table';
import { Entidad, Carpeta } from '@domain/models/database';
import { WorldBibleUseCase } from '@application/useCases/WorldBibleUseCase';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { useLanguage } from '@context/LanguageContext';
import { useRightPanelStore } from '@store/useRightPanelStore';
import ConfirmationModal from '@organisms/ConfirmationModal';
import CreateMassEntitiesModal from './CreateMassEntitiesModal';

interface TableViewProps {
  projectId: number;
  allFolders: Carpeta[];
  searchTerm: string;
  filterType?: string;
  handleOpenCreateModal?: (parentFolder?: Carpeta | null) => void;
}

const columnHelper = createColumnHelper<Entidad>();

const BibleTableView: React.FC<TableViewProps> = ({ projectId, allFolders, searchTerm, filterType = 'ALL', handleOpenCreateModal }) => {
  const { t } = useLanguage();
  const { username, projectName } = useParams();
  const [entities, setEntities] = useState<Entidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [rowSelection, setRowSelection] = useState({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Consumir el store centralizado para el panel derecho
  const { openPanel, closePanel, isOpen: isPanelOpen } = useRightPanelStore();

  const [isMassCreateOpen, setIsMassCreateOpen] = useState(false);
  const [newEntityName, setNewEntityName] = useState('');
  const [newEntityType, setNewEntityType] = useState('PERSONAJE');
  const [newEntityFolderId, setNewEntityFolderId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const loadEntities = async () => {
    setLoading(true);
    const data = await WorldBibleUseCase.getRootEntities(projectId);
    setEntities(data);
    setLoading(false);
  };

  useEffect(() => {
    loadEntities();
  }, [projectId]);


  const handleBulkDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmBulkDelete = async () => {
    const selectedIds = Object.keys(rowSelection).map(idx => {
      const rowIndex = Number(idx);
      return filteredData[rowIndex]?.id;
    }).filter(id => id !== undefined) as number[];

    if (!selectedIds.length) return;
    
    try {
      await WorldBibleUseCase.bulkDeleteEntities(selectedIds);
      setRowSelection({});
      loadEntities();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkAssignFolder = async (folderId: number | null) => {
    const selectedIds = Object.keys(rowSelection).map(idx => entities[Number(idx)].id);
    if (!selectedIds.length) return;

    try {
      await WorldBibleUseCase.moveEntitiesToFolder(selectedIds as number[], folderId);
      setRowSelection({});
      loadEntities();
    } catch (err) {
      // [LOG REMOVED]
    }
  };

  const selectedCount = Object.keys(rowSelection).length;

  const handleUpdateField = async (id: number, field: string, value: any) => {
    try {
      await WorldBibleUseCase.quickUpdateEntity(id, field, value);
      await loadEntities();
    } catch (err) {
      console.error(err);
    }
  };

  const handleGhostCreate = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newEntityName.trim() && !isCreating) {
      setIsCreating(true);
      try {
        await WorldBibleUseCase.createEntity({
          nombre: newEntityName.trim(),
          tipo: newEntityType,
          project_id: projectId,
          carpeta_id: newEntityFolderId,
          descripcion: '',
          slug: newEntityName.trim().toLowerCase().replace(/\s+/g, '-'),
          contenido_json: null,
          folder_slug: null,
          imagen_url: null
        } as any);
        setNewEntityName('');
        await loadEntities();
      } catch (err) {
        // [LOG REMOVED]
      } finally {
        setIsCreating(false);
      }
    }
  };

  const columns = useMemo(() => [
    {
      id: 'select',
      header: ({ table }: HeaderContext<Entidad, unknown>) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="accent-primary"
        />
      ),
      cell: ({ row }: CellContext<Entidad, unknown>) => (
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
        <span className="text-foreground/40 text-[10px] italic">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('carpeta_id', {
      header: () => <span className="uppercase tracking-widest text-[10px] font-black">{t('common.folder')}</span>,
      cell: info => {
        const folderId = info.getValue();
        return (
          <select
            value={folderId || ''}
            onChange={(e) => handleUpdateField(info.row.original.id!, 'carpeta_id', e.target.value ? Number(e.target.value) : null)}
            className="bg-transparent border-none text-foreground/40 text-[10px] italic outline-none focus:text-primary"
          >
            <option value="">Raíz</option>
            {allFolders.map(f => (
              <option key={f.id} value={f.id}>{f.nombre}</option>
            ))}
          </select>
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

  const filteredData = useMemo(() => {
    return entities.filter(e => {
      if (filterType === 'ALL') return true;
      if (filterType === 'SPACES') return false; // Las carpetas no están en este array de entidades
      if (filterType === 'ENTITIES') return e.tipo !== 'MAPA' && e.tipo !== 'TIMELINE' && e.tipo !== 'MAP' && e.tipo !== 'LINEA_TEMPORAL';
      if (filterType === 'MAPS') return e.tipo === 'MAPA' || e.tipo === 'MAP';
      if (filterType === 'TIMELINES') return e.tipo === 'TIMELINE' || e.tipo === 'LINEA_TEMPORAL';
      return true;
    });
  }, [entities, filterType]);

  const table = useReactTable({
    data: filteredData,
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
      <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col monolithic-panel border border-foreground/5 bg-foreground/[0.02] overflow-hidden">
        <div className="flex items-center justify-start gap-3 p-6 bg-background border-b border-foreground/10 h-[72px]">
          {selectedCount > 0 && (
            <button 
              onClick={handleBulkDeleteClick}
              className="flex items-center gap-2 px-4 h-9 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10 shrink-0"
            >
              <span className="material-symbols-outlined text-sm">delete_sweep</span>
              Borrar {selectedCount}
            </button>
          )}
          
          <button 
            onClick={() => setIsMassCreateOpen(true)}
            className="flex items-center gap-2 px-4 h-9 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 shrink-0 border border-transparent"
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            Crear en Serie
          </button>
        </div>
        <div className="overflow-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-background z-10">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-foreground/10">
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
                <select
                  value={newEntityType}
                  onChange={(e) => setNewEntityType(e.target.value)}
                  className="bg-transparent border-none text-foreground/40 text-[10px] italic outline-none focus:text-primary cursor-pointer"
                >
                  <option value="PERSONAJE">Personaje</option>
                  <option value="LUGAR">Lugar</option>
                  <option value="OBJETO">Objeto</option>
                  <option value="CONCEPTO">Concepto</option>
                  <option value="CRIATURA">Criatura</option>
                  <option value="MAPA">Mapa</option>
                  <option value="TIMELINE">Línea Temporal</option>
                </select>
              </td>
              <td className="p-2 border-b border-foreground/10">
                <select
                  value={newEntityFolderId || ''}
                  onChange={(e) => setNewEntityFolderId(e.target.value ? Number(e.target.value) : null)}
                  className="bg-transparent border-none text-foreground/40 text-[10px] italic outline-none focus:text-primary cursor-pointer"
                >
                  <option value="">Raíz</option>
                  {allFolders.map(f => (
                    <option key={f.id} value={f.id}>{f.nombre}</option>
                  ))}
                </select>
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

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmBulkDelete}
        title="Confirmar Eliminación Masiva"
        message={`¿Estás seguro de que deseas eliminar ${selectedCount} entidades de forma permanente? Esta acción no se puede deshacer.`}
        confirmText="Borrar Todo"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default BibleTableView;
