import { useEffect, useRef, useState, useCallback } from 'react';
import { useDebounce } from './useDebounce';

export function useAutoSave<T>(
  onboardingId: string,
  stepKey: string,
  initialData: T
) {
  const [data, setData] = useState<T>(initialData);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const debouncedData = useDebounce(data, 1000);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const saveData = async () => {
      setSaving(true);
      try {
        const response = await fetch(`/api/onboarding/${onboardingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [stepKey]: debouncedData }),
        });

        if (response.ok) {
          setLastSaved(new Date());
        }
      } catch (error) {
        console.error('Auto-save error:', error);
      } finally {
        setSaving(false);
      }
    };

    saveData();
  }, [debouncedData, onboardingId, stepKey]);

  const updateData = useCallback((updates: Partial<T>) => {
    setData(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    data,
    updateData,
    saving,
    lastSaved,
  };
}