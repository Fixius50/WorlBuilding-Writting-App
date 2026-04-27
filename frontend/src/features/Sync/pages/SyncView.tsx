import React, { useState, useEffect, useRef } from 'react';
import Peer, { DataConnection } from 'peerjs';
import Button from '@atoms/Button';
import GlassPanel from '@atoms/GlassPanel';
import { useLanguage } from '@context/LanguageContext';

const SyncView: React.FC = () => {
  const { t } = useLanguage();
  const [myPeerId, setMyPeerId] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'CONNECTING' | 'CONNECTED' | 'SYNCING' | 'DONE'>('IDLE');
  const [logs, setLogs] = useState<string[]>([]);
  const peerRef = useRef<Peer | null>(null);

  const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

  useEffect(() => {
    const peer = new Peer();
    peerRef.current = peer;

    peer.on('open', (id) => {
      setMyPeerId(id);
      addLog(`Tu ID de sincronización: ${id}`);
    });

    peer.on('connection', (conn) => {
      setConnection(conn);
      setStatus('CONNECTED');
      addLog(`Conexión recibida de: ${conn.peer}`);
      
      conn.on('data', (data: any) => {
          handleIncomingData(data);
      });
    });

    return () => {
      peer.destroy();
    };
  }, []);

  const handleConnect = () => {
    if (!targetId || !peerRef.current) return;
    setStatus('CONNECTING');
    const conn = peerRef.current.connect(targetId);
    
    conn.on('open', () => {
      setConnection(conn);
      setStatus('CONNECTED');
      addLog(`Conectado a: ${targetId}`);
    });

    conn.on('data', (data: any) => {
        handleIncomingData(data);
    });
  };

  const handleIncomingData = (data: any) => {
      addLog(`Datos recibidos: ${data.type}`);
      if (data.type === 'SYNC_REQUEST') {
          // Responder con datos
          addLog('Enviando datos locales...');
          connection?.send({ type: 'SYNC_DATA', payload: { entities: [] } }); // Placeholder
      }
  };

  const startSync = () => {
      if (!connection) return;
      setStatus('SYNCING');
      addLog('Solicitando sincronización...');
      connection.send({ type: 'SYNC_REQUEST' });
  };

  return (
    <div className="h-full w-full p-8 bg-background overflow-y-auto no-scrollbar">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground">
            Sincronización P2P
          </h1>
          <p className="text-xs text-foreground/40 font-bold uppercase tracking-[0.2em] mt-2 italic">
            Conexión directa entre nodos sin intermediarios
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <GlassPanel className="p-8 space-y-6 border-primary/10">
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary">Tu Identificador (Peer ID)</label>
                    <div className="flex gap-2">
                        <input 
                            readOnly 
                            value={myPeerId}
                            className="flex-1 bg-foreground/5 border border-foreground/10 px-4 py-3 text-sm font-mono text-primary outline-none"
                        />
                        <Button variant="ghost" icon="content_copy" onClick={() => navigator.clipboard.writeText(myPeerId)} />
                    </div>
                    <p className="text-[9px] text-foreground/40 italic">Comparte este ID con el otro usuario para establecer el puente.</p>
                </div>

                <div className="h-px bg-foreground/5 my-6"></div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Conectar con Partner</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Pega el ID del otro usuario..."
                            value={targetId}
                            onChange={(e) => setTargetId(e.target.value)}
                            className="flex-1 bg-foreground/5 border border-foreground/10 px-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors"
                        />
                        <Button 
                            variant="primary" 
                            onClick={handleConnect}
                            disabled={status === 'CONNECTING' || status === 'CONNECTED'}
                        >
                            Conectar
                        </Button>
                    </div>
                </div>
            </GlassPanel>

            <GlassPanel className="p-8 flex flex-col border-foreground/5">
                <div className="flex justify-between items-center mb-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Consola de Puente</label>
                    <div className="flex items-center gap-2">
                        <div className={`size-2 rounded-full ${status === 'CONNECTED' ? 'bg-emerald-500' : 'bg-foreground/20'}`} />
                        <span className="text-[9px] font-bold uppercase tracking-widest">{status}</span>
                    </div>
                </div>
                
                <div className="flex-1 bg-black/20 border border-foreground/5 p-4 font-mono text-[10px] space-y-1 overflow-y-auto max-h-48 custom-scrollbar mb-6">
                    {logs.map((log, i) => (
                        <div key={i} className="text-foreground/60">
                            <span className="text-primary/40 mr-2">&gt;</span>
                            {log}
                        </div>
                    ))}
                    {logs.length === 0 && <div className="text-foreground/20 italic">Esperando señal...</div>}
                </div>

                <Button 
                    variant="primary" 
                    className="w-full !py-4" 
                    icon="sync"
                    disabled={status !== 'CONNECTED'}
                    onClick={startSync}
                >
                    Sincronizar ahora
                </Button>
            </GlassPanel>
        </div>

        <section className="p-8 border border-dashed border-foreground/10 rounded-none bg-foreground/[0.01]">
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground/60 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">security</span>
                Protocolo de Seguridad
            </h3>
            <p className="text-[11px] text-foreground/40 leading-relaxed italic">
                La sincronización P2P utiliza WebRTC para cifrar los datos de punto a punto. 
                Tus archivos nunca pasan por servidores centrales. Asegúrate de tener una conexión estable durante el proceso.
            </p>
        </section>
      </div>
    </div>
  );
};

export default SyncView;
