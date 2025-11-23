"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { SupportedCurrency } from "@/lib/calculator/from-answers";
import {
  DEFAULT_FX_RATES,
  convertAmount,
  type CurrencyRatesSnapshot,
} from "@/lib/currency/shared";

const STATIC_SNAPSHOT: CurrencyRatesSnapshot = {
  base: "usd",
  rates: { ...DEFAULT_FX_RATES },
  fetchedAt: 0,
  source: "static",
};

interface UseCurrencyRatesResponse {
  rates: CurrencyRatesSnapshot | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  convert: (
    value: number,
    from: SupportedCurrency,
    to: SupportedCurrency,
    precision?: number,
  ) => number;
}

export function useCurrencyRates(): UseCurrencyRatesResponse {
  const [rates, setRates] = useState<CurrencyRatesSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const fetchRates = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/currency", { signal: controller.signal });
      const payload = (await response.json().catch(() => ({}))) as {
        data?: CurrencyRatesSnapshot;
        error?: string;
      };
      if (!response.ok || !payload.data) {
        throw new Error(payload.error ?? "Failed to load currency data.");
      }
      setRates(payload.data);
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      setError(error instanceof Error ? error.message : "Unable to load currency data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
    return () => {
      controllerRef.current?.abort();
    };
  }, [fetchRates]);

  const convert = useCallback<
    UseCurrencyRatesResponse["convert"]
  >(
    (value, from, to, precision = 2) => {
      const snapshot = rates ?? STATIC_SNAPSHOT;
      return convertAmount(value, from, to, snapshot, precision);
    },
    [rates],
  );

  return {
    rates,
    loading,
    error,
    refresh: fetchRates,
    convert,
  };
}

export function formatFxRelativeTime(snapshot?: CurrencyRatesSnapshot | null): string | null {
  if (!snapshot?.fetchedAt) {
    return null;
  }
  const deltaMs = Date.now() - snapshot.fetchedAt;
  if (deltaMs < 60_000) {
    return "just now";
  }
  if (deltaMs < 3_600_000) {
    const minutes = Math.round(deltaMs / 60_000);
    return `${minutes}m ago`;
  }
  if (deltaMs < 86_400_000) {
    const hours = Math.round(deltaMs / 3_600_000);
    return `${hours}h ago`;
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(snapshot.fetchedAt);
}

