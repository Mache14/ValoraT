-- ============================================================
-- ValoraT — Schema Inicial (Migración 001)
-- Ejecutar en: Supabase → SQL Editor → New query
-- ============================================================

-- ─── EXTENSIONES ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ─── TABLA: usuarios ─────────────────────────────────────────
-- Extiende el sistema de auth de Supabase (auth.users)
-- Se crea automáticamente al registrarse un usuario nuevo.

CREATE TABLE IF NOT EXISTS public.usuarios (
  id                UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_completo   TEXT        NOT NULL,
  fecha_nacimiento  DATE        NOT NULL,
  sexo              CHAR(1)     NOT NULL CHECK (sexo IN ('H', 'M')),
  nivel_educativo   TEXT        NOT NULL CHECK (nivel_educativo IN ('bajo', 'medio', 'alto')),
  altura_cm         SMALLINT    NOT NULL CHECK (altura_cm BETWEEN 100 AND 250),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: cada usuario solo ve su propio perfil
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "usuarios_propios" ON public.usuarios
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger: crear perfil vacío automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Solo inserta la fila, el usuario la rellena en el onboarding
  -- No hacemos INSERT aquí porque necesitamos los datos del formulario
  RETURN NEW;
END;
$$;


-- ─── TABLA: tests_catalogo ────────────────────────────────────
-- Catálogo fijo de todos los tests de la batería ValoraT.
-- No cambia en tiempo de ejecución.

CREATE TABLE IF NOT EXISTS public.tests_catalogo (
  id           TEXT PRIMARY KEY,  -- ej. 'chair_stand_30s'
  nombre       TEXT NOT NULL,
  categoria    TEXT NOT NULL CHECK (categoria IN (
    'fuerza', 'resistencia', 'equilibrio',
    'coordinacion', 'flexibilidad', 'movilidad',
    'cognitivo', 'calidad_vida'
  )),
  unidad       TEXT NOT NULL,      -- 'repeticiones', 'segundos', 'puntos', etc.
  descripcion  TEXT NOT NULL
);

-- Sin RLS: lectura pública (es un catálogo, no datos personales)
ALTER TABLE public.tests_catalogo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "catalogo_publico" ON public.tests_catalogo
  FOR SELECT USING (true);

-- Insertar el catálogo completo de la batería ValoraT
INSERT INTO public.tests_catalogo (id, nombre, categoria, unidad, descripcion) VALUES
  ('chair_stand_30s',    '30-s Chair Stand Test',         'fuerza',       'repeticiones', 'Fuerza-resistencia del tren inferior. Nº de levantadas de silla en 30 s.'),
  ('sit_to_stand_5rep',  '5-rep Sit-to-Stand Test',       'fuerza',       'segundos',     'Potencia muscular tren inferior. Tiempo en completar 5 ciclos.'),
  ('arm_curl_30s',       '30-s Arm Curl Test',            'fuerza',       'repeticiones', 'Fuerza-resistencia tren superior. Flexiones de bíceps con mancuerna en 30 s.'),
  ('push_up',            'Push-Up Test',                  'fuerza',       'repeticiones', 'Fuerza-resistencia pecho, hombros y tríceps. Máximas repeticiones.'),
  ('chair_sit_reach',    'Chair Sit-and-Reach',           'flexibilidad', 'cm',           'Flexibilidad isquiotibiales. Distancia al pie desde posición sentada.'),
  ('back_scratch',       'Back Scratch Test',             'flexibilidad', 'cm',           'Movilidad del hombro. Distancia entre dedos detrás de la espalda.'),
  ('single_leg_stand',   'Single-Leg Stand Test',         'equilibrio',   'segundos',     'Equilibrio estático. Tiempo sobre un pie (ojos abiertos y cerrados).'),
  ('tug',                'Timed Up and Go (TUG)',         'movilidad',    'segundos',     'Movilidad funcional. Tiempo en levantarse, caminar 3 m, girar y sentarse.'),
  ('step_2min',          '2-Minute Step Test',            'resistencia',  'elevaciones',  'Resistencia aeróbica domiciliaria. Elevaciones de rodilla en 2 minutos.'),
  ('ymca_step',          'YMCA Step Test',                'resistencia',  'lpm',          'Capacidad cardiorrespiratoria. FC de recuperación post-test de escalón 3 min.'),
  ('pvt_b',              'PVT-B (Psychomotor Vigilance)', 'cognitivo',    'ms',           'Tiempo de reacción y atención sostenida. Estándar de oro para fatiga del SNC.'),
  ('tmt_ab',             'Trail Making Test A/B',         'cognitivo',    'segundos',     'Velocidad de procesamiento (A) y flexibilidad cognitiva (B).'),
  ('moca',               'MoCA (Montreal Cognitive)',     'cognitivo',    'puntos',       'Cribado cognitivo global. 30 puntos, 8 dominios. Corte MCI: <26.'),
  ('sage',               'SAGE',                          'cognitivo',    'puntos',       'Cribado cognitivo autoadministrado. 22 puntos. Corte: ≤17.'),
  ('dual_task_tug',      'Dual-Task TUG',                 'cognitivo',    'segundos',     'Interferencia cognitivo-motora. TUG + tarea cognitiva simultánea.'),
  ('sf12',               'SF-12 / SF-36',                 'calidad_vida', 'T-score',      'Salud física (PCS) y mental (MCS) autopercibida. Media normativa = 50.'),
  ('eq5d',               'EQ-5D-3L',                      'calidad_vida', 'índice',       'Calidad de vida. 5 dimensiones + EVA 0-100. Estándar europeo.'),
  ('ipaq_sf',            'IPAQ-SF',                       'calidad_vida', 'MET-min/sem',  'Nivel de actividad física autopercibida. 7 preguntas, últimos 7 días.'),
  ('maf_scale',          'MAF Scale',                     'calidad_vida', 'GFI',          'Fatiga multidimensional. Global Fatigue Index 1-50. Corte significativo: >25.')
ON CONFLICT (id) DO NOTHING;


-- ─── TABLA: evaluaciones ─────────────────────────────────────
-- Cada resultado de test que realiza un usuario.

CREATE TABLE IF NOT EXISTS public.evaluaciones (
  id                   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID        NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  test_id              TEXT        NOT NULL REFERENCES public.tests_catalogo(id),
  fecha                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resultado_bruto      NUMERIC     NOT NULL,
  percentil            SMALLINT    CHECK (percentil BETWEEN 0 AND 100),
  categoria_resultado  TEXT        CHECK (categoria_resultado IN ('muy_bajo','bajo','normal','alto','muy_alto')),
  datos_extra_json     JSONB,      -- TMT: {"timeA": 32.1, "timeB": 78.4, "ratio": 2.44}
                                   -- PVT: {"meanRt": 265, "lapses": 1, "anticipations": 0}
                                   -- SLS: {"ojos_abiertos": 44.2, "ojos_cerrados": 12.8}
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evaluaciones_user_fecha ON public.evaluaciones (user_id, fecha DESC);
CREATE INDEX idx_evaluaciones_user_test  ON public.evaluaciones (user_id, test_id);

ALTER TABLE public.evaluaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "evaluaciones_propias" ON public.evaluaciones
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ─── TABLA: datos_antropometricos ────────────────────────────
-- Mediciones de peso, talla y perímetro de cintura.

CREATE TABLE IF NOT EXISTS public.datos_antropometricos (
  id                      UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID        NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  fecha                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  peso_kg                 NUMERIC(5,2) NOT NULL CHECK (peso_kg BETWEEN 20 AND 300),
  altura_cm               SMALLINT    NOT NULL CHECK (altura_cm BETWEEN 100 AND 250),
  perimetro_cintura_cm    NUMERIC(5,1),
  imc                     NUMERIC(5,2) GENERATED ALWAYS AS
                            (ROUND((peso_kg / POWER(altura_cm::NUMERIC / 100, 2))::NUMERIC, 2))
                          STORED,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_antro_user_fecha ON public.datos_antropometricos (user_id, fecha DESC);

ALTER TABLE public.datos_antropometricos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "antro_propios" ON public.datos_antropometricos
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ─── TABLA: informes ─────────────────────────────────────────
-- Informe global generado tras completar la batería.

CREATE TABLE IF NOT EXISTS public.informes (
  id                              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                         UUID        NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  fecha_generacion                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  indice_fragilidad_preventiva    NUMERIC(3,1) CHECK (indice_fragilidad_preventiva BETWEEN 0 AND 5),
  percentil_global                SMALLINT    CHECK (percentil_global BETWEEN 0 AND 100),
  resumen_dominios_json           JSONB,      -- {"fuerza": 62, "resistencia": 48, "equilibrio": 71, ...}
  recomendaciones_ia              TEXT,       -- null hasta fase 2 (Claude API)
  evaluaciones_incluidas          UUID[],     -- array de IDs de evaluaciones usadas
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_informes_user_fecha ON public.informes (user_id, fecha_generacion DESC);

ALTER TABLE public.informes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "informes_propios" ON public.informes
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ─── FIN DEL SCHEMA ──────────────────────────────────────────
-- Verificar con:
--   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
--   SELECT COUNT(*) FROM public.tests_catalogo;  -- debe devolver 19
