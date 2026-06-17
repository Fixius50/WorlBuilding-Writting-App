import React from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';

// --- Interfaces ---
interface SectionErrorBoundaryProps {
  children: React.ReactNode;
  /** Nombre del sector que aparecerá en el mensaje de error. Ej: "CANVAS CÓSMICO" */
  sectorName?: string;
  /** Callback opcional cuando el usuario intenta recuperar el sector */
  onReset?: () => void;
}

// --- Fallback UI ---
const SectorFallback = ({ error, resetErrorBoundary, sectorName }: FallbackProps & { sectorName: string }) => (
  <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] w-full bg-foreground/[0.02] border border-foreground/10 p-8 gap-4">
    <span className="material-symbols-outlined text-2xl text-foreground/40">warning</span>
    <div className="text-center space-y-2">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60">
        No se pudo cargar: {sectorName}
      </p>
      <p className="text-[10px] text-foreground/40 max-w-sm truncate">
        {error instanceof Error ? error.message : 'Error interno'}
      </p>
    </div>
    <button
      onClick={resetErrorBoundary}
      className="px-6 py-2 border border-foreground/20 text-foreground/60 text-[10px] font-black uppercase tracking-widest hover:bg-foreground hover:text-background transition-all"
    >
      REINTENTAR
    </button>
  </div>
);

/**
 * 🛡️ SectionErrorBoundary
 * Aísla errores en secciones específicas (Canvas, Timeline, Panels, etc.)
 * para que un crash parcial no mate toda la pantalla.
 *
 * Uso:
 * <SectionErrorBoundary sectorName="CANVAS CÓSMICO">
 *   <DrawingCanvas />
 * </SectionErrorBoundary>
 */
const SectionErrorBoundary = ({ children, sectorName = 'SECTOR', onReset }: SectionErrorBoundaryProps) => (
  <ErrorBoundary
    FallbackComponent={(props) => <SectorFallback {...props} sectorName={sectorName} />}
    onReset={onReset}
    onError={(error, info) => {
      // Preservado para futura integración con logger local
      // reportError('SectionErrorBoundary', sectorName, error.message, info.componentStack);
    }}
  >
    {children}
  </ErrorBoundary>
);

export default SectionErrorBoundary;
