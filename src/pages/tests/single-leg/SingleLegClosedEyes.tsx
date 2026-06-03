import { SingleLegTestBase } from './SingleLegTestBase'

/**
 * SingleLegClosedEyes — Equilibrio Unipodal con Ojos Cerrados.
 * Usa su propia matriz normativa y almacena en `upst_history_Ojos Cerrados`.
 */
export function SingleLegClosedEyes({ onBack }: { onBack: () => void }) {
  return <SingleLegTestBase modality="Ojos Cerrados" onBack={onBack} />
}
