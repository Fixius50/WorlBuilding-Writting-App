import { sqlocal } from '@infrastructure/localDB/client';

/**
 * Servicio para la sincronización de archivos SQLite completos (Bulk Operations)
 * entre el frontend (SQLocal/OPFS) y el servidor auxiliar (Spring Boot).
 */
export const syncService = {
  /**
   * Exporta la base de datos actual desde el navegador al disco duro (vía Spring).
   * @param projectName Nombre del proyecto (se guardará como projectName.sqlite)
   */
  async exportToDisk(projectName: string): Promise<{ success: boolean; message: string }> {
    try {
      // Obtenemos el archivo .sqlite actual de SQLocal (OPFS)
      const dbFile = await sqlocal.getDatabaseFile();
      
      const formData = new FormData();
      formData.append('file', dbFile, `${projectName}.sqlite`);

      const response = await fetch(`/api/db/upload/${projectName}`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const message = await response.text();
      return { success: true, message: message || 'Backup completado en disco.' };
    } catch (error) {
      console.error('Error exportando a disco:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Error desconocido' };
    }
  },

  /**
   * Importa un archivo SQLite desde el disco duro al navegador y lo carga en SQLocal.
   * @param projectName Nombre del proyecto a descargar
   */
  async importFromDisk(projectName: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`/api/db/download/${projectName}`, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' }
      });

      if (!response.ok) {
        throw new Error(`No se pudo encontrar el archivo de respaldo para ${projectName}`);
      }

      const dbBlob = await response.blob();
      
      // Sobrescribimos la base de datos actual en SQLocal/OPFS
      await sqlocal.overwriteDatabaseFile(dbBlob);
      
      return { success: true, message: 'Base de datos importada y cargada con éxito.' };
    } catch (error) {
      console.error('Error importando desde disco:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Error desconocido' };
    }
  },

  /**
   * Obtiene la lista de bases de datos disponibles en el servidor local.
   */
  async listAvailableBackups(): Promise<string[]> {
    try {
      const response = await fetch('/api/db/list');
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Error listando backups:', error);
      return [];
    }
  }
};

export default syncService;
