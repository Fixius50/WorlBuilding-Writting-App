import { useState, useEffect, useRef, useCallback } from "react";
import Peer, { DataConnection } from "peerjs";
import { useParams } from "react-router-dom";
import { syncService, SyncRealtimePayload } from "@network/syncService";

/**
 * 🧠 useSyncManager
 * Logic for Peer-to-Peer synchronization using WebRTC.
 */
export const useSyncManager = () => {
  const { projectName } = useParams<{ projectName: string }>();
  const [myPeerId, setMyPeerId] = useState<string>("");
  const [targetId, setTargetId] = useState<string>("");
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [status, setStatus] = useState<
    "IDLE" | "CONNECTING" | "CONNECTED" | "SYNCING" | "DONE"
  >("IDLE");
  const [logs, setLogs] = useState<string[]>([]);
  const peerRef = useRef<Peer | null>(null);

  const addLog = useCallback((msg: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  }, []);

  const handleIncomingData = useCallback(
    async (data: unknown, activeConnection: DataConnection | null) => {
      const incoming = data as { type?: string; payload?: unknown };
      addLog(`Datos recibidos: ${incoming.type || "UNKNOWN"}`);

      switch (incoming.type) {
        case "SYNC_REQUEST": {
          const currentProjectName = projectName || "";

          switch (currentProjectName.length === 0) {
            case true:
              addLog("No hay proyecto activo en ruta para sincronizar.");
              break;
            default: {
              addLog("Generando snapshot real del proyecto local...");
              const snapshotResult =
                await syncService.buildRealtimeSnapshot(currentProjectName);

              switch (snapshotResult.success) {
                case true: {
                  const payload = snapshotResult.payload;
                  if (payload) {
                    addLog(
                      `Enviando payload real (${payload.entities.length} entidades)...`,
                    );
                    activeConnection?.send({
                      type: "SYNC_DATA",
                      payload: payload,
                    });
                  } else {
                    addLog("Snapshot generado sin payload.");
                  }
                  break;
                }
                default:
                  addLog(`Error al crear snapshot: ${snapshotResult.message}`);
                  break;
              }
              break;
            }
          }
          break;
        }

        case "SYNC_DATA": {
          const incomingPayload = incoming.payload as
            | SyncRealtimePayload
            | undefined;
          if (incomingPayload) {
            addLog("Aplicando datos reales recibidos en la base local...");
            const applyResult =
              await syncService.applyRealtimeSnapshot(incomingPayload);

            switch (applyResult.success) {
              case true:
                addLog("Aplicación local completada.");
                setStatus("DONE");
                break;
              default:
                addLog(`Fallo aplicando datos: ${applyResult.message}`);
                setStatus("CONNECTED");
                break;
            }

            const archiveProject =
              projectName || incomingPayload.project.nombre;
            const archiveResult = await syncService.archiveRealtimePayload(
              archiveProject,
              incomingPayload,
            );
            switch (archiveResult.success) {
              case true:
                addLog("Payload archivado en backend auxiliar.");
                break;
              default:
                addLog(
                  `Archivado backend no disponible: ${archiveResult.message}`,
                );
                break;
            }
          } else {
            addLog("SYNC_DATA recibido sin payload válido.");
          }
          break;
        }

        default:
          addLog("Tipo de mensaje no reconocido.");
          break;
      }
    },
    [addLog, projectName],
  );

  useEffect(() => {
    const peer = new Peer();
    peerRef.current = peer;

    peer.on("open", (id) => {
      setMyPeerId(id);
      addLog(`Tu ID de sincronización: ${id}`);
    });

    peer.on("connection", (conn) => {
      setConnection(conn);
      setStatus("CONNECTED");
      addLog(`Conexión recibida de: ${conn.peer}`);

      conn.on("data", (data) => {
        void handleIncomingData(data, conn);
      });

      conn.on("close", () => {
        setStatus("IDLE");
        addLog("Conexión cerrada.");
      });
    });

    peer.on("error", (err) => {
      addLog(`Error de Peer: ${err.type}`);
      setStatus("IDLE");
    });

    return () => {
      peer.destroy();
    };
  }, [addLog, handleIncomingData]);

  const handleConnect = useCallback(() => {
    if (!targetId || !peerRef.current) {
      addLog("Debes indicar un Peer ID válido antes de conectar.");
    } else {
      setStatus("CONNECTING");
      addLog(`Intentando conectar a: ${targetId}...`);
      const conn = peerRef.current.connect(targetId);

      conn.on("open", () => {
        setConnection(conn);
        setStatus("CONNECTED");
        addLog(`Conectado exitosamente a: ${targetId}`);
      });

      conn.on("data", (data) => {
        void handleIncomingData(data, conn);
      });

      conn.on("error", (err) => {
        addLog(`Error de conexión: ${err.message}`);
        setStatus("IDLE");
      });

      conn.on("close", () => {
        setStatus("IDLE");
        addLog("Conexión finalizada.");
      });
    }
  }, [targetId, addLog, handleIncomingData]);

  const startSync = useCallback(() => {
    const conn = connection;
    if (conn) {
      setStatus("SYNCING");
      addLog("Solicitando sincronización al partner...");
      conn.send({ type: "SYNC_REQUEST" });
    } else {
      addLog("No hay conexión activa para iniciar sincronización.");
    }
  }, [connection, addLog]);

  return {
    myPeerId,
    targetId,
    setTargetId,
    status,
    logs,
    handleConnect,
    startSync,
  };
};
