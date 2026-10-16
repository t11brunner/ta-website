// The systems of the s-domain demo.
import type { Rat } from '../shared/math'

export type SysKey = 'handout' | 'msd' | 'lag'

export const SYSTEMS: Record<SysKey, { label: string; G: Rat }> = {
  handout: { label: 'Handout example', G: { num: [1], den: [1, 2, 2] } },
  msd: { label: 'Mass-spring-damper', G: { num: [4], den: [1, 0.8, 4] } },
  lag: { label: 'First-order lag', G: { num: [1], den: [1, 1] } },
}
