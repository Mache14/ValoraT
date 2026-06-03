import { AlertTriangle } from 'lucide-react'

/**
 * ConfirmDialog — modal de confirmación inline (sin alert() nativo).
 * Usado por los tests para confirmar el abandono de la evaluación.
 */
interface ConfirmDialogProps {
  open: boolean
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title = 'Confirmar',
  message,
  confirmLabel = 'Sí, abandonar',
  cancelLabel = 'Continuar',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[90] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-5">
      <div className="bg-white rounded-3xl max-w-xs w-full p-5 shadow-2xl">
        <div className="flex items-center gap-2 text-amber-500 mb-2">
          <AlertTriangle size={20} />
          <h4 className="font-bold text-slate-800 text-base">{title}</h4>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">{message}</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            className="py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="py-2.5 rounded-xl bg-rose-500 text-white font-bold text-sm hover:bg-rose-600 transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
