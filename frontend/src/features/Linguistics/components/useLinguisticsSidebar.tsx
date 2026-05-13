import { Word } from '@domain/models/database';
import { GrammarRule } from '../components/LinguisticsSidebar';

/**
 * 🧠 useLinguisticsSidebar
 * Logic for the linguistics sidebar, including glyph filtering and status mapping.
 */
export const useLinguisticsSidebar = (
  glyphs: Word[] = [],
  rules: GrammarRule[] = []
) => {
  // Top glyphs logic (limited to 12 for the preview grid)
  const topGlyphs = glyphs.slice(0, 12);

  // Status color mapping for grammar rules
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'complete': return 'bg-emerald-500';
      case 'draft': return 'bg-amber-500';
      default: return 'bg-foreground/40';
    }
  };

  return {
    topGlyphs,
    getStatusColor,
    hasRules: rules.length > 0,
    hasGlyphs: glyphs.length > 0
  };
};
