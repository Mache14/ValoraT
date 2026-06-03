import { SingleLegTestBase } from './SingleLegTestBase'

/**
 * SingleLegOpenEyes — Equilibrio Unipodal con Ojos Abiertos.
 * Usa su propia matriz normativa y almacena en `upst_history_Ojos Abiertos`.
 */
export function SingleLegOpenEyes({ onBack }: { onBack: () => void }) {
  return <SingleLegTestBase modality="Ojos Abiertos" onBack={onBack} />
}
