import { useState, useCallback } from 'react';

/**
 * 🧠 useTerritoryGridView
 * Hook to handle territory grid logic, including filtering, searching, and grid layout management.
 */
export const useTerritoryGridView = (id?: string | number) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [territories, setTerritories] = useState([
    {
      title: "Nueva Neo-Tokyo",
      desc: "Metrópolis vertical construida sobre las...",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAYF5Q6W3o1w1f1",
      badges: ['Capital'],
      stats: ['15M', 'Templado', 'Costero'],
      color: "cyan"
    },
    {
      title: "Mar de Dunas",
      desc: "Extensión árida rica en especia sílica...",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBYG6R7X4p2x2g2",
      stats: ['Hostil', 'Árido'],
      color: "amber"
    },
    {
      title: "Sanctum Bio-Domo",
      desc: "Instalación de investigación...",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCZ H7S8Y5q3z3h3",
      badges: ['Ciencia'],
      stats: ['5K', 'Jungla'],
      color: "purple"
    }
  ]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleToggleView = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
  }, []);

  const handleAddTerritory = useCallback(() => {
    // Logic to spawn a new territory creation modal/process
  }, []);

  return {
    territories,
    searchQuery,
    viewMode,
    handleSearch,
    handleToggleView,
    handleAddTerritory
  };
};
