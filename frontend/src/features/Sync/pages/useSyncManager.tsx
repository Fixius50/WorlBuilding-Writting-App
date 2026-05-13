import { useState, useEffect, useRef, useCallback } from 'react';
import Peer, { DataConnection } from 'peerjs';

/**
 * 🧠 useSyncManager
 * Logic for Peer-to-Peer synchronization using WebRTC.
 */
export const useSyncManager = () => {
  const [myPeerId, setMyPeerId] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'CONNECTING' | 'CONNECTED' | 'SYNCING' | 'DONE'>('IDLE');
  const [logs, setLogs] = useState<string[]>([]);
  const peerRef = useRef<Peer | null>(null);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  }, []);

  const handleIncomingData = useCallback((data: unknown) => {
    const d = data as { type?: string; payload?: unknown };
    addLog(`Datos recibidos: ${d.type}`);
    if (d.type === 'SYNC_REQUEST') {
      addLog('Enviando datos locales...');
      // In a real scenario, we would send the actual project data here.
      connection?.send({ type: 'SYNC_DATA', payload: { entities: [] } });
    }
  }, [addLog, connection]);

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
      
      conn.on('data', (data) => {
        handleIncomingData(data);
      });

      conn.on('close', () => {
        setStatus('IDLE');
        addLog('Conexión cerrada.');
      });
    });

    peer.on('error', (err) => {
      addLog(`Error de Peer: ${err.type}`);
      setStatus('IDLE');
    });

    return () => {
      peer.destroy();
    };
  }, [addLog, handleIncomingData]);

  const handleConnect = useCallback(() => {
    if (!targetId || !peerRef.current) return;
    
    setStatus('CONNECTING');
    addLog(`Intentando conectar a: ${targetId}...`);
    const conn = peerRef.current.connect(targetId);
    
    conn.on('open', () => {
      setConnection(conn);
      setStatus('CONNECTED');
      addLog(`Conectado exitosamente a: ${targetId}`);
    });

    conn.on('data', (data) => {
      handleIncomingData(data);
    });

    conn.on('error', (err) => {
      addLog(`Error de conexión: ${err.message}`);
      setStatus('IDLE');
    });

    conn.on('close', () => {
      setStatus('IDLE');
      addLog('Conexión finalizada.');
    });
  }, [targetId, addLog, handleIncomingData]);

  const startSync = useCallback(() => {
    if (!connection) return;
    setStatus('SYNCING');
    addLog('Solicitando sincronización al partner...');
    connection.send({ type: 'SYNC_REQUEST' });
  }, [connection, addLog]);

  return {
    myPeerId,
    targetId,
    setTargetId,
    status,
    logs,
    handleConnect,
    startSync
  };
};
