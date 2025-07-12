import { AppContext } from '@/contexts/AppContext';
import { useContext } from 'react';

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider');
    return ctx;
}
