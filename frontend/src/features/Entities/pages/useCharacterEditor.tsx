import { useState, useCallback } from 'react';

/**
 * 🧠 useCharacterEditor
 * Hook to handle character creation and editing logic, including attribute tuning and biography management.
 */
export const useCharacterEditor = () => {
  const [name, setName] = useState("Elara Vance");
  const [role, setRole] = useState("Protaganist");
  const [bio, setBio] = useState("A scavenger from the outer rim who discovers a hidden power.");
  const [age, setAge] = useState("24");
  const [species, setSpecies] = useState("Human");

  const [attributes, setAttributes] = useState([
    { label: 'Resilience', value: 78 },
    { label: 'Influence', value: 42 },
    { label: 'Arcane Potency', value: 12 },
    { label: 'Stealth', value: 91 }
  ]);

  const handleSave = useCallback(() => {
    // Logic to persist character changes
  }, []);

  const handleDiscard = useCallback(() => {
    // Logic to revert changes
  }, []);

  const handleAddAttribute = useCallback(() => {
    // Logic to add a new attribute slider
  }, []);

  return {
    name,
    setName,
    role,
    setRole,
    bio,
    setBio,
    age,
    setAge,
    species,
    setSpecies,
    attributes,
    handleSave,
    handleDiscard,
    handleAddAttribute
  };
};
