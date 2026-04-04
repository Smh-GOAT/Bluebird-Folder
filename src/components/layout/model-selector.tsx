"use client";

import { useCallback, useEffect, useState } from "react";
import { authFetch } from "@/lib/forsion/fetch";

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  isEnabled: boolean;
}

const STORAGE_KEY = "bluebird_selected_model";

function getStoredModelId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

function setStoredModelId(id: string) {
  localStorage.setItem(STORAGE_KEY, id);
}

export function useSelectedModel() {
  const [modelId, setModelId] = useState<string | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch("/api/models")
      .then((res) => res.json())
      .then((data) => {
        const list: ModelInfo[] = Array.isArray(data) ? data : [];
        setModels(list);

        const stored = getStoredModelId();
        if (stored && list.some((m) => m.id === stored)) {
          setModelId(stored);
        } else if (list.length > 0) {
          setModelId(list[0].id);
          setStoredModelId(list[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const select = useCallback((id: string) => {
    setModelId(id);
    setStoredModelId(id);
  }, []);

  return { modelId, models, loading, select };
}

interface ModelSelectorProps {
  modelId: string | null;
  models: ModelInfo[];
  onSelect: (id: string) => void;
}

export function ModelSelector({ modelId, models, onSelect }: ModelSelectorProps) {
  if (models.length === 0) return null;

  return (
    <select
      value={modelId ?? ""}
      onChange={(e) => onSelect(e.target.value)}
      className="ui-input px-2 py-1 text-xs"
      style={{ maxWidth: 180 }}
    >
      {models.map((m) => (
        <option key={m.id} value={m.id}>
          {m.name}
        </option>
      ))}
    </select>
  );
}
