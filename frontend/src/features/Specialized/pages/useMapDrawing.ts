import { useCallback } from "react";
import type maplibregl from "maplibre-gl";
import { GeoFeatureCollection, GeoFeature } from "../domain/types";

export const useMapDrawing = (
  features: GeoFeatureCollection,
  setFeatures: (action: React.SetStateAction<GeoFeatureCollection>) => void,
  activeLevelId: string,
  brushColor: string,
  brushSize: number
) => {
  const addLinePoint = useCallback(
    (lng: number, lat: number, forceNew: boolean = false, type: string = "line") => {
      setFeatures((prev: GeoFeatureCollection) => {
        const fts = [...prev.features];
        const lastIdx = fts.length - 1;
        const last = lastIdx >= 0 ? fts[lastIdx] : null;
        
        const hasCurrentLine = last &&
          last.geometry.type === "LineString" &&
          last.properties?.levelId === activeLevelId &&
          last.properties?.color === brushColor &&
          last.properties?.width === brushSize &&
          last.properties?.type === type;
          
        const shouldAppend = !forceNew && hasCurrentLine;

        if (shouldAppend && last) {
          fts[lastIdx] = {
            ...last,
            geometry: {
              ...last.geometry,
              coordinates: [
                ...(last.geometry.coordinates as unknown[]),
                [lng, lat],
              ],
            },
          };
        } else {
          fts.push({
            type: "Feature",
            geometry: { type: "LineString", coordinates: [[lng, lat]] },
            properties: { levelId: activeLevelId, color: brushColor, width: brushSize, type, timestamp: Date.now() },
          });
        }
        return { ...prev, features: fts };
      });
    },
    [activeLevelId, brushColor, brushSize, setFeatures],
  );

  const addSprayPoint = useCallback(
    (lng: number, lat: number, forceNew: boolean = false) => {
      addLinePoint(lng, lat, forceNew, "spray");
    },
    [addLinePoint],
  );

  const eraseFeatures = useCallback(
    (lng: number, lat: number, mapInstance?: maplibregl.Map | null) => {
      const hasInstance = !!mapInstance;
      if (hasInstance) {
        const cursorPx = mapInstance!.project([lng, lat]);
        const radius = brushSize;

        const getSqSegDist = (px: number, py: number, ax: number, ay: number, bx: number, by: number): number => {
          let dx = bx - ax;
          let dy = by - ay;
          const hasLength = dx !== 0 || dy !== 0;
          return hasLength
            ? (() => {
                const t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
                return t > 1
                  ? (px - bx) * (px - bx) + (py - by) * (py - by)
                  : t > 0
                    ? (px - (ax + t * dx)) * (px - (ax + t * dx)) + (py - (ay + t * dy)) * (py - (ay + t * dy))
                    : (px - ax) * (px - ax) + (py - ay) * (py - ay);
              })()
            : (px - ax) * (px - ax) + (py - ay) * (py - ay);
        };

        const isPointClose = (ptCoords: [number, number]): boolean => {
          const ptPx = mapInstance!.project(ptCoords);
          return Math.hypot(cursorPx.x - ptPx.x, cursorPx.y - ptPx.y) <= radius;
        };

        const isPointInPolygon = (polygonCoords: [number, number][][]): boolean => {
          let inside = false;
          polygonCoords.forEach((ring) => {
            const len = ring.length;
            for (let i = 0, j = len - 1; i < len; j = i++) {
              const pi = mapInstance!.project(ring[i]);
              const pj = mapInstance!.project(ring[j]);
              const intersect = ((pi.y > cursorPx.y) !== (pj.y > cursorPx.y))
                && (cursorPx.x < (pj.x - pi.x) * (cursorPx.y - pi.y) / (pj.y - pi.y) + pi.x);
              if (intersect) {
                inside = !inside;
              }
            }
          });
          return inside;
        };

        const isPolygonIntersecting = (polygonCoords: [number, number][][]): boolean => {
          let intersects = isPointInPolygon(polygonCoords);
          if (!intersects) {
            polygonCoords.forEach((ring) => {
              const len = ring.length;
              for (let i = 0; i < len - 1; i++) {
                const p1 = mapInstance!.project(ring[i]);
                const p2 = mapInstance!.project(ring[i + 1]);
                const distSq = getSqSegDist(cursorPx.x, cursorPx.y, p1.x, p1.y, p2.x, p2.y);
                if (distSq <= radius * radius) {
                  intersects = true;
                }
              }
            });
          }
          return intersects;
        };

        setFeatures((prev: GeoFeatureCollection) => {
          const newFeatures = (prev.features || []).flatMap((f: GeoFeature): GeoFeature[] => {
            const isDifferentLevel = f.properties?.levelId !== activeLevelId;
            return isDifferentLevel
              ? [f]
              : (() => {
                  const geomType = f.geometry.type;
                  switch (geomType) {
                    case "Point": {
                      const erase = isPointClose(f.geometry.coordinates as [number, number]);
                      return erase ? [] : [f];
                    }
                    case "Polygon": {
                      const erase = isPolygonIntersecting(f.geometry.coordinates as [number, number][][]);
                      return erase ? [] : [f];
                    }
                    case "MultiPolygon": {
                      const polys = f.geometry.coordinates as [number, number][][][];
                      let intersects = false;
                      polys.forEach((poly) => {
                        if (isPolygonIntersecting(poly)) {
                          intersects = true;
                        }
                      });
                      return intersects ? [] : [f];
                    }
                    case "LineString": {
                      const coords = f.geometry.coordinates as [number, number][];

                      const subtractCircleFromLine = (
                        lineCoords: [number, number][],
                        centerPx: { x: number; y: number },
                        rad: number
                      ): [number, number][][] => {
                        const lenCoords = lineCoords.length;
                        const isTooShort = lenCoords < 2;

                        return isTooShort
                          ? []
                          : (() => {
                              const paths: [number, number][][] = [];
                              let currentPath: [number, number][] = [];

                              const addCoord = (path: [number, number][], coord: [number, number]): void => {
                                const len = path.length;
                                const shouldAdd = len === 0 || (path[len - 1][0] !== coord[0] || path[len - 1][1] !== coord[1]);
                                shouldAdd ? path.push(coord) : undefined;
                              };

                              const isPointInside = (coord: [number, number]): boolean => {
                                const ptPx = mapInstance!.project(coord);
                                return Math.hypot(centerPx.x - ptPx.x, centerPx.y - ptPx.y) <= rad;
                              };

                              const firstInside = isPointInside(lineCoords[0]);
                              firstInside ? undefined : addCoord(currentPath, lineCoords[0]);

                              for (let i = 0; i < lenCoords - 1; i++) {
                                const cCurr = lineCoords[i];
                                const cNext = lineCoords[i + 1];
                                const p1 = mapInstance!.project(cCurr);
                                const p2 = mapInstance!.project(cNext);
                                const inside1 = Math.hypot(centerPx.x - p1.x, centerPx.y - p1.y) <= rad;
                                const inside2 = Math.hypot(centerPx.x - p2.x, centerPx.y - p2.y) <= rad;

                                const dx = p2.x - p1.x;
                                const dy = p2.y - p1.y;
                                const a = dx * dx + dy * dy;

                                const ts: number[] = [];

                                const hasLength = a > 0;
                                hasLength
                                  ? (() => {
                                      const fx = p1.x - centerPx.x;
                                      const fy = p1.y - centerPx.y;
                                      const b = 2 * (fx * dx + fy * dy);
                                      const cCoeff = fx * fx + fy * fy - rad * rad;
                                      const discriminant = b * b - 4 * a * cCoeff;

                                      const hasRealRoots = discriminant >= 0;
                                      hasRealRoots
                                        ? (() => {
                                            const sqrtDisc = Math.sqrt(discriminant);
                                            const t1 = (-b - sqrtDisc) / (2 * a);
                                            const t2 = (-b + sqrtDisc) / (2 * a);
                                            const t1Valid = t1 >= 0 && t1 <= 1;
                                            t1Valid ? ts.push(t1) : undefined;
                                            const t2Valid = t2 >= 0 && t2 <= 1 && Math.abs(t2 - t1) > 1e-5;
                                            t2Valid ? ts.push(t2) : undefined;
                                          })()
                                        : undefined;
                                    })()
                                  : undefined;

                                const numIntersections = ts.length;
                                switch (numIntersections) {
                                  case 1: {
                                    const t = ts[0];
                                    const cInt: [number, number] = [
                                      cCurr[0] + t * (cNext[0] - cCurr[0]),
                                      cCurr[1] + t * (cNext[1] - cCurr[1])
                                    ];
                                    const goingInside = !inside1 && inside2;
                                    goingInside
                                      ? (() => {
                                          addCoord(currentPath, cInt);
                                          const pathValid = currentPath.length >= 2;
                                          pathValid ? paths.push(currentPath) : undefined;
                                          currentPath = [];
                                        })()
                                      : (() => {
                                          currentPath = [cInt];
                                          addCoord(currentPath, cNext);
                                        })();
                                    break;
                                  }
                                  case 2: {
                                    const t1 = ts[0];
                                    const t2 = ts[1];
                                    const cInt1: [number, number] = [
                                      cCurr[0] + t1 * (cNext[0] - cCurr[0]),
                                      cCurr[1] + t1 * (cNext[1] - cCurr[1])
                                    ];
                                    const cInt2: [number, number] = [
                                      cCurr[0] + t2 * (cNext[0] - cCurr[0]),
                                      cCurr[1] + t2 * (cNext[1] - cCurr[1])
                                    ];
                                    addCoord(currentPath, cInt1);
                                    const pathValid = currentPath.length >= 2;
                                    pathValid ? paths.push(currentPath) : undefined;
                                    currentPath = [cInt2];
                                    addCoord(currentPath, cNext);
                                    break;
                                  }
                                  default: {
                                    const bothOutside = !inside1 && !inside2;
                                    bothOutside ? addCoord(currentPath, cNext) : undefined;
                                    break;
                                  }
                                }
                              }

                              const finalPathValid = currentPath.length >= 2;
                              finalPathValid ? paths.push(currentPath) : undefined;

                              return paths;
                            })();
                      };

                      const newLinesCoords = subtractCircleFromLine(coords, cursorPx, radius);

                      return newLinesCoords.map((cList, sIdx) => ({
                        ...f,
                        id: `${f.id || Date.now()}-seg-${sIdx}`,
                        geometry: {
                          ...f.geometry,
                          coordinates: cList,
                        },
                      }));
                    }
                    default:
                      return [f];
                  }
                })();
          });
          return { ...prev, features: newFeatures };
        });
      }
    },
    [brushSize, activeLevelId, setFeatures]
  );

  const addGeometricFeature = useCallback(
    (
      id: string,
      type: "rectangle" | "circle",
      startCoords: { lng: number; lat: number },
      currentCoords: { lng: number; lat: number },
      isTemp: boolean = false
    ) => {
      setFeatures((prev: GeoFeatureCollection) => {
        const fts = [...prev.features];
        const existingIdx = fts.findIndex((f) => f.id === id);
        
        let coords: [number, number][][] = [[]];
        const x1 = startCoords.lng;
        const y1 = startCoords.lat;
        const x2 = currentCoords.lng;
        const y2 = currentCoords.lat;

        const buildRectangle = (): [number, number][][] => [[
          [x1, y1],
          [x2, y1],
          [x2, y2],
          [x1, y2],
          [x1, y1]
        ]];

        const buildCircle = (): [number, number][][] => {
          const radius = Math.hypot(x2 - x1, y2 - y1);
          const circlePoints: [number, number][] = [];
          for (let i = 0; i <= 64; i++) {
            const angle = (i / 64) * 2 * Math.PI;
            circlePoints.push([
              x1 + radius * Math.cos(angle),
              y1 + radius * Math.sin(angle)
            ]);
          }
          return [circlePoints];
        };

        coords = type === "rectangle" ? buildRectangle() : buildCircle();

        const newFeature: GeoFeature = {
          id,
          type: "Feature",
          geometry: { type: "Polygon", coordinates: coords },
          properties: {
            levelId: activeLevelId,
            color: brushColor,
            width: brushSize,
            type,
            isTemp,
            timestamp: Date.now()
          }
        };

        const hasExisting = existingIdx >= 0;
        hasExisting
          ? (fts[existingIdx] = newFeature)
          : fts.push(newFeature);

        return { ...prev, features: fts };
      });
    },
    [activeLevelId, brushColor, brushSize, setFeatures]
  );

  const consolidateGeometricFeature = useCallback(
    (id: string) => {
      setFeatures((prev: GeoFeatureCollection) => {
        const fts = prev.features.map((f) => {
          const isTarget = f.id === id;
          return isTarget
            ? {
                ...f,
                properties: {
                  ...f.properties,
                  isTemp: false
                }
              }
            : f;
        });
        return { ...prev, features: fts };
      });
    },
    [setFeatures]
  );

  const removeFeature = useCallback(
    (id: string) => {
      setFeatures((prev: GeoFeatureCollection) => ({
        ...prev,
        features: prev.features.filter((f) => f.id !== id)
      }));
    },
    [setFeatures]
  );

  const handleFloodFill = useCallback(
    (clickLng: number, clickLat: number, mapInstance?: maplibregl.Map | null) => {
      // Límites de pantalla por defecto o del viewport activo
      let minLng = -180;
      let maxLng = 180;
      let minLat = -85;
      let maxLat = 85;

      mapInstance
        ? (() => {
            const bounds = mapInstance.getBounds();
            minLng = bounds.getWest();
            maxLng = bounds.getEast();
            minLat = bounds.getSouth();
            maxLat = bounds.getNorth();
          })()
        : undefined;

      const currentLevelObstacles = features.features.filter((f) => {
        const isSameLevel = f.properties?.levelId === activeLevelId;
        const isLineOrPoly = f.geometry.type === "LineString" || f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon";
        return isSameLevel && isLineOrPoly;
      });

      // RASTERIZACIÓN VIRTUAL EN MEMORIA DE LOS MUROS
      let width = 800;
      let height = 600;
      let pixelData = new Uint8ClampedArray(width * height * 4);
      
      mapInstance
        ? (() => {
            const canvasElement = mapInstance.getCanvas();
            width = canvasElement.clientWidth || 800;
            height = canvasElement.clientHeight || 600;

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d")!;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, width, height);

            ctx.strokeStyle = "#000000";
            // Aumentamos ligeramente el grosor del obstáculo virtual para evitar fugas entre uniones
            ctx.lineWidth = Math.max(3, brushSize);
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            currentLevelObstacles.forEach((obs) => {
              const geomType = obs.geometry.type;
              switch (geomType) {
                case "LineString": {
                  const coords = obs.geometry.coordinates as [number, number][];
                  ctx.beginPath();
                  coords.forEach((coord, index) => {
                    const pt = mapInstance.project(coord);
                    index === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
                  });
                  ctx.stroke();
                  break;
                }
                case "Polygon": {
                  const rings = obs.geometry.coordinates as [number, number][][];
                  rings.forEach((ring) => {
                    ctx.fillStyle = "#000000";
                    ctx.beginPath();
                    ring.forEach((coord, index) => {
                      const pt = mapInstance.project(coord);
                      index === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
                    });
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                  });
                  break;
                }
                case "MultiPolygon": {
                  const polygonsList = obs.geometry.coordinates as [number, number][][][];
                  polygonsList.forEach((rings) => {
                    rings.forEach((ring) => {
                      ctx.fillStyle = "#000000";
                      ctx.beginPath();
                      ring.forEach((coord, index) => {
                        const pt = mapInstance.project(coord);
                        index === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
                      });
                      ctx.closePath();
                      ctx.fill();
                      ctx.stroke();
                    });
                  });
                  break;
                }
                default:
                  break;
              }
            });

            const imgData = ctx.getImageData(0, 0, width, height);
            pixelData = imgData.data;
          })()
        : undefined;

      const isBlockedPixel = (lng: number, lat: number): boolean => {
        const hasInstance = !!mapInstance;
        return hasInstance
          ? (() => {
              const pt = mapInstance!.project([lng, lat]);
              const px = Math.round(pt.x);
              const py = Math.round(pt.y);
              const inside = px >= 0 && px < width && py >= 0 && py < height;
              return inside
                ? pixelData[(py * width + px) * 4] < 128
                : false;
            })()
          : false;
      };

      // Inundación sobre una rejilla ortogonal adaptada a la pantalla visible
      const cols = 250;
      const rows = 250;
      const spacingLng = (maxLng - minLng) / cols;
      const spacingLat = (maxLat - minLat) / rows;

      const startI = Math.floor((clickLng - minLng) / spacingLng);
      const startJ = Math.floor((clickLat - minLat) / spacingLat);

      const insideStart = startI >= 0 && startI < cols && startJ >= 0 && startJ < rows;

      if (insideStart) {
        const queue: [number, number][] = [[startI, startJ]];
        const visited = new Set<string>();
        visited.add(`${startI},${startJ}`);
        const filledCells: [number, number][] = [[startI, startJ]];

        const checkBlocked = (i: number, j: number, ni: number, nj: number): boolean => {
          const pMid = [
            minLng + ((i + ni) / 2 + 0.5) * spacingLng,
            minLat + ((j + nj) / 2 + 0.5) * spacingLat
          ] as [number, number];
          const pDest = [
            minLng + (ni + 0.5) * spacingLng,
            minLat + (nj + 0.5) * spacingLat
          ] as [number, number];
          return isBlockedPixel(pMid[0], pMid[1]) || isBlockedPixel(pDest[0], pDest[1]);
        };

        while (queue.length > 0) {
          const curr = queue.shift()!;
          const [ci, cj] = curr;

          const directions: [number, number][] = [
            [ci + 1, cj],
            [ci - 1, cj],
            [ci, cj + 1],
            [ci, cj - 1]
          ];

          directions.forEach(([ni, nj]) => {
            const key = `${ni},${nj}`;
            if (ni >= 0 && ni < cols && nj >= 0 && nj < rows && !visited.has(key)) {
              if (!checkBlocked(ci, cj, ni, nj)) {
                visited.add(key);
                queue.push([ni, nj]);
                filledCells.push([ni, nj]);
              }
            }
          });
        }

        // EXTRAER SÓLO LAS ARISTAS FRONTERA EXTERIORES utilizando índices enteros de esquinas
        const boundaryEdges: { p1: [number, number]; p2: [number, number] }[] = [];

        filledCells.forEach(([i, j]) => {
          const c0: [number, number] = [i, j];
          const c1: [number, number] = [i + 1, j];
          const c2: [number, number] = [i + 1, j + 1];
          const c3: [number, number] = [i, j + 1];

          const edges = [
            { p1: c0, p2: c1, neighborKey: `${i},${j - 1}` },
            { p1: c1, p2: c2, neighborKey: `${i + 1},${j}` },
            { p1: c2, p2: c3, neighborKey: `${i},${j + 1}` },
            { p1: c3, p2: c0, neighborKey: `${i - 1},${j}` }
          ];

          edges.forEach((edge) => {
            const isNeighborFilled = visited.has(edge.neighborKey);
            if (!isNeighborFilled) {
              boundaryEdges.push({ p1: edge.p1, p2: edge.p2 });
            }
          });
        });

        // CONECTAR LAS ARISTAS EN UNO O MÁS CAMINOS CERRADOS en tiempo O(E) usando mapa de adyacencia
        const adjMap = new Map<string, { to: [number, number]; edgeId: number }[]>();
        boundaryEdges.forEach((edge, index) => {
          const k1 = `${edge.p1[0]},${edge.p1[1]}`;
          const k2 = `${edge.p2[0]},${edge.p2[1]}`;
          
          if (!adjMap.has(k1)) {
            adjMap.set(k1, []);
          }
          if (!adjMap.has(k2)) {
            adjMap.set(k2, []);
          }
          adjMap.get(k1)!.push({ to: edge.p2, edgeId: index });
          adjMap.get(k2)!.push({ to: edge.p1, edgeId: index });
        });

        const usedEdges = new Set<number>();
        const polygons: [number, number][][] = [];

        boundaryEdges.forEach((startEdge, index) => {
          const isUsed = usedEdges.has(index);
          if (!isUsed) {
            usedEdges.add(index);
            const currentPath: [number, number][] = [startEdge.p1, startEdge.p2];
            let lastPt = startEdge.p2;
            let foundNext = true;

            while (foundNext) {
              foundNext = false;
              const lastKey = `${lastPt[0]},${lastPt[1]}`;
              const neighbors = adjMap.get(lastKey) || [];
              
              let nextNeighbor: { to: [number, number]; edgeId: number } | null = null;
              for (let k = 0; k < neighbors.length; k++) {
                const n = neighbors[k];
                if (!usedEdges.has(n.edgeId)) {
                  nextNeighbor = n;
                  break;
                }
              }

              if (nextNeighbor) {
                usedEdges.add(nextNeighbor.edgeId);
                currentPath.push(nextNeighbor.to);
                lastPt = nextNeighbor.to;
                foundNext = true;
              }
            }

            if (currentPath.length >= 3) {
              polygons.push(currentPath);
            }
          }
        });

        const simplifyPath = (points: [number, number][], epsilon: number): [number, number][] => {
          let result: [number, number][] = points;
          const isLarge = points.length > 2;

          if (isLarge) {
            let maxDist = 0;
            let index = 0;
            const end = points.length - 1;

            const getSqSegDist = (p: [number, number], p1: [number, number], p2: [number, number]): number => {
              const x = p1[0];
              const y = p1[1];
              let dx = p2[0] - x;
              let dy = p2[1] - y;
              
              const hasLength = dx !== 0 || dy !== 0;
              return hasLength
                ? (() => {
                    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
                    return t > 1
                      ? (p[0] - p2[0]) * (p[0] - p2[0]) + (p[1] - p2[1]) * (p[1] - p2[1])
                      : t > 0
                        ? (p[0] - (x + t * dx)) * (p[0] - (x + t * dx)) + (p[1] - (y + t * dy)) * (p[1] - (y + t * dy))
                        : (p[0] - x) * (p[0] - x) + (p[1] - y) * (p[1] - y);
                  })()
                : (p[0] - x) * (p[0] - x) + (p[1] - y) * (p[1] - y);
            };

            for (let i = 1; i < end; i++) {
              const dist = getSqSegDist(points[i], points[0], points[end]);
              const isMax = dist > maxDist;
              if (isMax) {
                index = i;
                maxDist = dist;
              }
            }

            const exceedLimit = maxDist > epsilon * epsilon;
            result = exceedLimit
              ? (() => {
                  const results1 = simplifyPath(points.slice(0, index + 1), epsilon);
                  const results2 = simplifyPath(points.slice(index), epsilon);
                  return results1.slice(0, results1.length - 1).concat(results2);
                })()
              : [points[0], points[end]];
          }

          return result;
        };

        const simplifiedPolygons = polygons.map((poly) => simplifyPath(poly, 1.2));

        // Convertir esquinas de rejilla a coordenadas geográficas
        const polyCoords = simplifiedPolygons.map((poly) => {
          const coords = poly.map(([x, y]) => {
            const lng = minLng + x * spacingLng;
            const lat = minLat + y * spacingLat;
            return [lng, lat] as [number, number];
          });
          return [coords];
        });

        const fillFeature: GeoFeature = {
          type: "Feature" as const,
          geometry: {
            type: "MultiPolygon" as const,
            coordinates: polyCoords
          },
          properties: {
            levelId: activeLevelId,
            color: brushColor,
            width: brushSize,
            type: "fill",
            timestamp: Date.now()
          }
        };

        setFeatures((prev: GeoFeatureCollection) => ({
          ...prev,
          features: [...prev.features, fillFeature]
        }));
      }
    },
    [features, activeLevelId, brushColor, brushSize, setFeatures]
  );

  return {
    addLinePoint,
    addSprayPoint,
    eraseFeatures,
    addGeometricFeature,
    consolidateGeometricFeature,
    removeFeature,
    handleFloodFill,
  };
};
