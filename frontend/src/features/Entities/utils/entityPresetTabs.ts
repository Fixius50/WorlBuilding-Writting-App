export interface PresetTabItem {
  id: string;
  label: string;
  icon: string;
}

const normalizeType = (typeValue: string): string => {
  return typeValue
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]+/gi, " ")
    .trim()
    .toUpperCase();
};

const matchesAliases = (normalizedType: string, aliases: string[]): boolean => {
  const words = normalizedType.split(/\s+/).filter(Boolean);

  return aliases.some((alias) => {
    const normalizedAlias = normalizeType(alias);

    switch (true) {
      case normalizedType === normalizedAlias:
        return true;
      case normalizedType.includes(normalizedAlias):
        return true;
      case words.includes(normalizedAlias):
        return true;
      default:
        return false;
    }
  });
};

const buildTabs = (
  items: Array<{ id: string; label: string; icon: string }>,
): PresetTabItem[] => {
  return items.map((item) => ({
    id: item.id,
    label: item.label,
    icon: item.icon,
  }));
};

const getPlanetTabs = (): PresetTabItem[] => {
  return buildTabs([
    { id: "PLANET_GENERAL", label: "GENERAL", icon: "public" },
    { id: "PLANET_GEOGRAPHY", label: "GEOGRAFIA", icon: "terrain" },
    { id: "PLANET_LIFE", label: "VIDA PLANETARIA", icon: "eco" },
    {
      id: "PLANET_CIVILIZATION",
      label: "CIVILIZACION E HISTORIA",
      icon: "castle",
    },
  ]);
};

const getRaceTabs = (): PresetTabItem[] => {
  return buildTabs([
    { id: "RACE_ANATOMY", label: "ANATOMIA", icon: "biotech" },
    {
      id: "RACE_CLASSIFICATION",
      label: "CLASIFICACION",
      icon: "category",
    },
    { id: "RACE_CAPABILITIES", label: "CAPACIDADES", icon: "bolt" },
  ]);
};

const getClassTabs = (): PresetTabItem[] => {
  return buildTabs([
    {
      id: "CLASS_REQUIREMENTS",
      label: "REQUISITOS",
      icon: "rule_settings",
    },
    {
      id: "CLASS_BENEFITS",
      label: "BENEFICIOS Y DADOS",
      icon: "trophy",
    },
    {
      id: "CLASS_EVOLUTION",
      label: "RAMAS DE EVOLUCION",
      icon: "account_tree",
    },
  ]);
};

const getMagicTabs = (): PresetTabItem[] => {
  return buildTabs([
    {
      id: "MAGIC_CONCEPT",
      label: "CONCEPTO Y REGLAS",
      icon: "auto_awesome",
    },
    {
      id: "MAGIC_COSTS",
      label: "COSTES Y LIMITES",
      icon: "tune",
    },
    {
      id: "MAGIC_LEVELS",
      label: "RULETA/NIVELES",
      icon: "casino",
    },
  ]);
};

const composeTabs = (...groups: PresetTabItem[][]): PresetTabItem[] => {
  const merged: PresetTabItem[] = [];
  const ids = new Set<string>();

  groups.forEach((tabs) => {
    tabs.forEach((tab) => {
      switch (ids.has(tab.id)) {
        case false:
          merged.push(tab);
          ids.add(tab.id);
          break;
        default:
          break;
      }
    });
  });

  return merged;
};

export const getPresetTabsByEntityType = (
  entityType: string,
): PresetTabItem[] => {
  const normalizedType = normalizeType(entityType || "");

  switch (true) {
    case matchesAliases(normalizedType, [
      "PLANETA",
      "PLANET",
      "MUNDO",
      "WORLD",
    ]):
      return getPlanetTabs();
    case matchesAliases(normalizedType, [
      "ENTIDADINDIVIDUAL",
      "ARQUETIPO INDIVIDUAL",
      "INDIVIDUAL",
      "PERSONAJE",
      "CHARACTER",
    ]):
      return getRaceTabs();
    case matchesAliases(normalizedType, [
      "ENTIDADCOLECTIVA",
      "ARQUETIPO COLECTIVO",
      "COLECTIVO",
      "COLLECTIVE",
      "CULTURA",
      "CULTURE",
      "FACCION",
      "FACTION",
      "ORGANIZACION",
      "ORGANIZATION",
    ]):
      return composeTabs(getRaceTabs(), getClassTabs());
    case matchesAliases(normalizedType, ["RAZA", "RAZAS", "RACE", "SPECIES"]):
      return getRaceTabs();
    case matchesAliases(normalizedType, [
      "CLASE",
      "CLASES",
      "PROFESION",
      "PROFESIONES",
      "CLASS",
      "PROFESSION",
      "JOB",
      "CLASE PROFESION",
      "CLASEPROFESION",
      "CLASS PROFESSION",
    ]):
      return getClassTabs();
    case matchesAliases(normalizedType, [
      "MAGIA",
      "MAGIC",
      "ARCANO",
      "ARCANE",
      "HECHIZO",
      "SPELL",
      "MAGIAINDIVIDUAL",
      "ARQUETIPO MAGIA",
    ]):
      return getMagicTabs();
    default:
      return [];
  }
};

export const mergeTabs = (
  baseTabs: PresetTabItem[],
  extraTabs: PresetTabItem[],
): PresetTabItem[] => {
  const ids = new Set(baseTabs.map((tab) => tab.id));
  const merged = [...baseTabs];

  extraTabs.forEach((tab) => {
    switch (ids.has(tab.id)) {
      case false:
        merged.push(tab);
        ids.add(tab.id);
        break;
      default:
        break;
    }
  });

  return merged;
};
