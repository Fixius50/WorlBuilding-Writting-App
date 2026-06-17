import { useState, useEffect, useMemo } from 'react';
import { RelationshipUseCase } from '@features/Relationships/application/RelationshipUseCase';
import { Entidad } from '@domain/database';

type GraphNode = { id: string; group?: string; data: Record<string, unknown>; label?: string; nombre?: string; category?: string; isFull?: boolean; isStub?: boolean; };
type EntidadExtendida = Entidad & { attributes?: Record<string, unknown> };

/**
 * ðŸ§  useInGraphNodeWindow
 * Hook to handle entity detail fetching, tab navigation, and relationship mapping for the in-graph node window.
 */
export const useInGraphNodeWindow = (node: GraphNode | null, elements: GraphNode[]) => {
  const [activeTab, setActiveTab] = useState('ESENCIA'); // ESENCIA, RELACIONES, CRÃ“NICA
  const [details, setDetails] = useState<EntidadExtendida | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!node?.id) return;

    const fetchDetails = async () => {
      try {
        setLoading(true);
        const response = await RelationshipUseCase.getEntityDetails(Number(node.id));
        if (response && response.contenido_json) {
          try {
            const parsed = JSON.parse(response.contenido_json);
            setDetails({ ...response, attributes: parsed } as EntidadExtendida);
          } catch (e) {
            setDetails(response);
          }
        } else {
          setDetails(response);
        }
      } catch (err) {
        console.error("Error fetching node details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!node.isFull || node.isStub) {
      fetchDetails();
    } else {
      // If we already have full data (or it's not a stub), we reset details to null to use node data
      setDetails(null);
    }
  }, [node?.id, node?.isFull, node?.isStub]);

  const data = useMemo(() => (details || node) as Record<string, unknown>, [details, node]);
  const attributes = useMemo(() => {
    const rawAttrs = data.attributes && typeof data.attributes === 'object' ? data.attributes as Record<string, unknown> : {};
    return Object.entries(rawAttrs).filter(([key, value]) => {
      const k = key.toLowerCase();
      return !k.includes('id') &&
             !k.includes('url') &&
             !k.includes('image') &&
             !k.includes('layers') &&
             !k.includes('snapshot') &&
             !k.includes('file') &&
             typeof value !== 'object';
    });
  }, [data]);

  const relations = useMemo(() => {
    if (!node) return [];
    const nodeIdStr = String(node.id);
    return elements
      .filter(e => e.group === 'edges' && (String(e.data.source) === nodeIdStr || String(e.data.target) === nodeIdStr))
      .map(edge => {
        const otherId = String(edge.data.source) === nodeIdStr ? edge.data.target : edge.data.source;
        const otherNode = elements.find(n => String(n.data?.id) === String(otherId));
        return {
          id: edge.data.id as string,
          otherLabel: String(otherNode?.data?.label || otherNode?.label || 'IncÃ³gnito'),
          edgeLabel: String(edge.data.label || 'VÃ­nculo')
        };
      });
  }, [node, elements]);

  const categoryConfig = useMemo(() => {
    if (!node) return { color: 'border-foreground/40', icon: 'help' };
    switch (node.category) {
      case 'Individual': return { color: 'border-indigo-500/50', icon: 'person' };
      case 'Location': return { color: 'border-emerald-500/50', icon: 'location_on' };
      default: return { color: 'border-purple-500/50', icon: 'groups' };
    }
  }, [node?.category]);

  return {
    activeTab,
    setActiveTab,
    details,
    loading,
    data,
    attributes,
    relations,
    categoryConfig
  };
};

