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
import { Link, useParams } from 'react-router-dom';
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

  // Fila de creación rápida
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('PERSONAJE');

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
    
    try {
      await entityService.create({
        nombre: newName.trim(),
        tipo: newType,
        project_id: projectId,
        carpeta_id: null, // Raíz por defecto en creación rápida
        descripcion: '',
        contenido_json: null,
        slug: '',
        folder_slug: null,
        imagen_url: null
      });
      setNewName('');
      loadEntities(); // Recargar para ver el nuevo
    } catch (err) {
      console.error('Error creating entity:', err);
    }
  };

  const columns = useMemo(() => [
    columnHelper.accessor('nombre', {
      header: () => <span className="uppercase tracking-widest text-[10px] font-black">{t('common.name')}</span>,
      cell: info => (
        <Link 
          to={`/${username || 'local'}/${projectName}/bible/entity/${info.row.original.id}`}
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
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (loading) return <div className="p-10 text-center animate-pulse italic opacity-50">Sincronizando registros...</div>;

  return (
    <div className="flex-1 flex flex-col p-8 pt-0 overflow-hidden">
      {/* Contenedor de Tabla Centrado y de Ancho Reducido */}
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
              {/* Fila de Creación Rápida */}
              <tr className="border-b border-primary/20 bg-primary/5 group">
                <td className="p-4">
                  <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreateQuick()}
                    placeholder="Nueva entidad (Enter para guardar)..."
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
                <td className="p-4 text-[10px] text-foreground/20 italic">Asignar en ficha</td>
                <td className="p-4">
                   <button 
                    onClick={handleCreateQuick}
                    disabled={!newName.trim()}
                    className="text-primary hover:text-white transition-colors p-2"
                  >
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                  </button>
                </td>
              </tr>

              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
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
