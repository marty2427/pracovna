import { create } from 'zustand'
import type { DeskConfig } from './model/types'
import { vychoziKonfigurace } from './model/defaults'
import { orizniNaProstor } from './model/constraints'

export type Zalozka = 'konfigurator' | 'galerie' | 'koupit' | 'export'

interface Stav {
  config: DeskConfig
  zalozka: Zalozka
  ukazMistnost: boolean
  historie: DeskConfig[]
  nastav: (patch: Partial<DeskConfig> | ((c: DeskConfig) => Partial<DeskConfig>)) => void
  nastavRozmer: (klic: keyof DeskConfig['rozmery'], hodnota: number) => void
  nactiPreset: (p: DeskConfig, kam?: Zalozka) => void
  setZalozka: (z: Zalozka) => void
  setUkazMistnost: (v: boolean) => void
  zpet: () => void
}

export const useStore = create<Stav>((set, get) => ({
  config: vychoziKonfigurace(),
  zalozka: 'konfigurator',
  ukazMistnost: true,
  historie: [],

  nastav: (patch) =>
    set((s) => {
      const p = typeof patch === 'function' ? patch(s.config) : patch
      return {
        historie: [...s.historie.slice(-24), s.config],
        config: orizniNaProstor({ ...s.config, ...p }),
      }
    }),

  nastavRozmer: (klic, hodnota) =>
    set((s) => ({
      historie: [...s.historie.slice(-24), s.config],
      config: orizniNaProstor({ ...s.config, rozmery: { ...s.config.rozmery, [klic]: hodnota } }),
    })),

  nactiPreset: (p, kam = 'konfigurator') =>
    set((s) => ({
      historie: [...s.historie.slice(-24), s.config],
      config: orizniNaProstor(structuredClone(p)),
      zalozka: kam,
    })),

  setZalozka: (zalozka) => set({ zalozka }),
  setUkazMistnost: (ukazMistnost) => set({ ukazMistnost }),

  zpet: () => {
    const h = get().historie
    if (!h.length) return
    set({ config: h[h.length - 1], historie: h.slice(0, -1) })
  },
}))
