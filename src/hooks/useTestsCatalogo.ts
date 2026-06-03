import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { TestCatalogo, CategoriaTest } from '../types'

/**
 * useTestsCatalogo — lee el catálogo de tests desde Supabase.
 * Esta es la conexión real entre el front y el backend:
 * los tests provienen de la tabla `tests_catalogo` de la base de datos.
 */
export function useTestsCatalogo() {
  const [tests, setTests] = useState<TestCatalogo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('tests_catalogo')
      .select('*')
      .order('categoria')
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setTests(data ?? [])
        setLoading(false)
      })
  }, [])

  /** Devuelve los tests de una categoría concreta */
  function porCategoria(categoria: CategoriaTest): TestCatalogo[] {
    return tests.filter((t) => t.categoria === categoria)
  }

  return { tests, loading, error, porCategoria }
}
