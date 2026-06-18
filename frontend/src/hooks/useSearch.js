import { useState, useMemo, useCallback } from 'react';

export function useSearch(items, searchFields = ['nombre', 'descripcion']) {
  const [busqueda, setBusqueda] = useState('');

  const filteredItems = useMemo(() => {
    if (!busqueda.trim()) return items;

    const term = busqueda.toLowerCase().trim();
    return items.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        return value && String(value).toLowerCase().includes(term);
      })
    );
  }, [items, busqueda, searchFields]);

  const clearSearch = useCallback(() => {
    setBusqueda('');
  }, []);

  return {
    busqueda,
    setBusqueda,
    filteredItems,
    clearSearch,
    hasResults: filteredItems.length > 0,
    resultsCount: filteredItems.length,
  };
}
