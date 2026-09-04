import { create } from 'zustand'
import type { DeskConfig } from './model/types'
import { vychoziKonfigurace } from './model/defaults'
import { orizniNaProstor, type Mistnost, VYCHOZI_MISTNOST } from './model/constraints'

export type Zalozka = 'konfigurator' | 'galerie' | 'koupit' | 'export'

interface Stav {
  config: DeskConfig
  zalozka: Zalozka
  ukazMistnost: boolean
  /** Co o místnosti není v konfiguraci stolu (délka lehátka gauče). */
  mistnost: Mistnost
  historie: DeskConfig[]
  nastav: (patch: Partial<DeskConfig> | ((c: DeskConfig) => Partial<DeskConfig>)) => void
  nastavRozmer: (klic: keyof DeskConfig['rozmery'], hodnota: number) => void
  nactiPreset: (p: DeskConfig, kam?: Zalozka) => void
  setZalozka: (z: Zalozka) => void
  setUkazMistnost: (v: boolean) => void
  setMistnost: (m: Partial<Mistnost>) => void
  zpet: () => void
}

export const useStore = create<Stav>((set, get) => ({
  config: vychoziKonfigurace(),
  zalozka: 'konfigurator',
  ukazMistnost: true,
  mistnost: { ...VYCHOZI_MISTNOST },
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
  setMistnost: (m) => set((s) => ({ mistnost: { ...s.mistnost, ...m } })),

  zpet: () => {
    const h = get().historie
    if (!h.length) return
    set({ config: h[h.length - 1], historie: h.slice(0, -1) })
  },
}))
