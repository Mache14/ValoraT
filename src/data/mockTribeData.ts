/**
 * mockTribeData.ts — datos simulados de los miembros de la Tribu del usuario.
 * Provisional hasta que la comparación con la tribu se conecte a datos reales (Supabase).
 *
 * scoreKeys:
 *  - tmt_b: tiempo TMT-B (s) — menor es mejor
 *  - pvt_rt: tiempo de reacción medio PVT-B (ms) — menor es mejor
 *  - balance_oa: equilibrio unipodal ojos abiertos (s) — mayor es mejor
 *  - balance_oc: equilibrio unipodal ojos cerrados (s) — mayor es mejor
 *  - sts30: repeticiones 30-STS — mayor es mejor
 *  - armcurl: repeticiones Arm Curl 30 s — mayor es mejor
 */

export type TribeScoreKey = 'tmt_b' | 'pvt_rt' | 'balance_oa' | 'balance_oc' | 'sts30' | 'armcurl' | 'tug'

export interface TribeMember {
  name: string
  avatar: string
  scores: Record<TribeScoreKey, number>
}

export const MOCK_TRIBE_MEMBERS: TribeMember[] = [
  { name: 'Ana',    avatar: '👩',    scores: { tmt_b: 72,  pvt_rt: 245, balance_oa: 38.5, balance_oc: 8.2,  sts30: 22, armcurl: 24, tug: 9.5  } },
  { name: 'Carlos', avatar: '👨',    scores: { tmt_b: 95,  pvt_rt: 310, balance_oa: 25.0, balance_oc: 5.1,  sts30: 18, armcurl: 19, tug: 12.3 } },
  { name: 'María',  avatar: '👩‍🦰', scores: { tmt_b: 65,  pvt_rt: 220, balance_oa: 42.0, balance_oc: 12.0, sts30: 25, armcurl: 27, tug: 8.2  } },
  { name: 'Pedro',  avatar: '👴',    scores: { tmt_b: 110, pvt_rt: 380, balance_oa: 15.0, balance_oc: 3.5,  sts30: 14, armcurl: 15, tug: 14.8 } },
  { name: 'Laura',  avatar: '👩‍🔬', scores: { tmt_b: 80,  pvt_rt: 260, balance_oa: 35.0, balance_oc: 9.0,  sts30: 20, armcurl: 22, tug: 10.1 } },
]

/** Devuelve los valores de la tribu para una métrica concreta. */
export function tribeValuesFor(key: TribeScoreKey): number[] {
  return MOCK_TRIBE_MEMBERS.map((m) => m.scores[key])
}
