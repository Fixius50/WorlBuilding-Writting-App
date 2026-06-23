import { useState, useRef, useCallback } from "react";
import { MapMarker } from "@domain/maps";
import { GeoFeatureCollection } from "../domain/types";

export const useMapHistory = (
  markers: MapMarker[],
  features: GeoFeatureCollection,
  setMarkers: (action: React.SetStateAction<MapMarker[]>) => void,
  setFeatures: (action: React.SetStateAction<GeoFeatureCollection>) => void,
  setIsDrawing: (drawing: boolean) => void
) => {
  const [history, setHistory] = useState<{ markers: MapMarker[]; features: GeoFeatureCollection }[]>([]);
  const [future, setFuture] = useState<{ markers: MapMarker[]; features: GeoFeatureCollection }[]>([]);
  const historyRef = useRef<{ markers: MapMarker[]; features: GeoFeatureCollection }[]>([]);
  const futureRef = useRef<{ markers: MapMarker[]; features: GeoFeatureCollection }[]>([]);
  const actionSavedRef = useRef(false);

  const getHistorySnapshot = useCallback(
    () => ({
      markers: JSON.parse(JSON.stringify(markers)),
      features: JSON.parse(JSON.stringify(features)),
    }),
    [markers, features]
  );

  const pushHistory = useCallback(
    (snapshot: { markers: MapMarker[]; features: GeoFeatureCollection }) => {
      setHistory((prev) => {
        const next = [...prev, snapshot];
        historyRef.current = next;
        return next;
      });
      setFuture([]);
      futureRef.current = [];
    },
    []
  );

  const restoreSnapshot = useCallback(
    (snapshot: { markers: MapMarker[]; features: GeoFeatureCollection }) => {
      setMarkers(snapshot.markers);
      setFeatures(snapshot.features);
    },
    [setMarkers, setFeatures]
  );

  const handleUndo = useCallback(() => {
    const currentHistory = historyRef.current;
    const canUndo = currentHistory.length > 0;
    canUndo
      ? (() => {
          const lastSnapshot = currentHistory[currentHistory.length - 1];
          const currentSnapshot = getHistorySnapshot();

          setHistory((prev) => {
            const next = prev.slice(0, -1);
            historyRef.current = next;
            return next;
          });
          setFuture((prev) => {
            const next = [currentSnapshot, ...prev];
            futureRef.current = next;
            return next;
          });
          restoreSnapshot(lastSnapshot);
        })()
      : undefined;
  }, [getHistorySnapshot, restoreSnapshot]);

  const handleRedo = useCallback(() => {
    const currentFuture = futureRef.current;
    const canRedo = currentFuture.length > 0;
    canRedo
      ? (() => {
          const nextSnapshot = currentFuture[0];
          const currentSnapshot = getHistorySnapshot();

          setFuture((prev) => {
            const next = prev.slice(1);
            futureRef.current = next;
            return next;
          });
          setHistory((prev) => {
            const next = [...prev, currentSnapshot];
            historyRef.current = next;
            return next;
          });
          restoreSnapshot(nextSnapshot);
        })()
      : undefined;
  }, [getHistorySnapshot, restoreSnapshot]);

  const saveHistorySnapshot = useCallback(() => {
    const shouldSave = !actionSavedRef.current;
    shouldSave
      ? (() => {
          pushHistory(getHistorySnapshot());
          actionSavedRef.current = true;
        })()
      : undefined;
  }, [getHistorySnapshot, pushHistory]);

  const endCurrentAction = useCallback(() => {
    setIsDrawing(false);
    actionSavedRef.current = false;
  }, [setIsDrawing]);

  return {
    history,
    future,
    handleUndo,
    handleRedo,
    saveHistorySnapshot,
    endCurrentAction,
  };
};
