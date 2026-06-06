/**
 * testFeedbackMessages.ts — Mensajes de feedback personalizados por rango de percentil.
 * 11 tests × 6 rangos = 66 mensajes. Toda afirmación clínica lleva referencia real.
 *
 * Referencias empleadas (artículos consolidados):
 *  - TMT:      Tombaugh (2004); Reitan (1958); Lezak et al. (2012)
 *  - PVT-B:    Basner & Dinges (2011); Lim & Dinges (2008)
 *  - Balance:  Springer et al. (2007); Vellas et al. (1997); Bohannon (2006)
 *  - 5-STS:    Bohannon (2006); Cruz-Jentoft et al. (2019, EWGSOP2)
 *  - 30-STS:   Rikli & Jones (1999, 2013); Cossio-Bolaños et al. (2024)
 *  - Arm Curl: Rikli & Jones (1999, 2013)
 *  - TUG:      Podsiadlo & Richardson (1991); Bohannon (2006); Kear et al. (2017)
 *  - AHWTT:    Rikli & Jones (2013); Hoeger & Hoeger; Seidler et al. (2010); Swinnen (2002)
 *  - Hooper:   Hooper & Mackinnon (1995); Saw et al. (2016); Milewski et al. (2014); McEwen (2008); Meeusen et al. (2013)
 *  - 2-Min Step: Rikli & Jones (2013); ACSM (2021)
 *  - 6MWT:     Enright & Sherrill (1998); Casanova et al. (2011); ATS (2002)
 */

import { percentileToRange, type PercentileRange } from '../utils/percentileUtils'

export interface PercentileFeedback {
  range: PercentileRange
  emoji: string
  title: string
  performance: string
  healthImplication: string
  recommendation: string
  citation: string
}

export type FeedbackTestKey = 'tmt' | 'pvt' | 'balance' | 'sts5' | 'sts30' | 'armcurl' | 'tug' | 'balltoss' | 'hooper' | 'step2min' | '6mwt'

const PRO_REFERRAL =
  'Se recomienda que consultes con un profesional de la salud (médico, fisioterapeuta o graduado en CAFD) para una evaluación más completa y un programa de intervención personalizado.'

const EMOJIS: Record<PercentileRange, string> = {
  '<P25': '🔴', 'P25-P40': '🟠', 'P40-P60': '🟡', 'P60-P75': '🟢', 'P75-P90': '💚', 'P90-P100': '🏆',
}

// ─── TMT (Trail Making Test — velocidad de procesamiento y función ejecutiva) ───
const TMT: PercentileFeedback[] = [
  {
    range: '<P25', emoji: EMOJIS['<P25'], title: 'Rendimiento cognitivo bajo',
    performance: 'Tu tiempo se sitúa en el 25% más lento de tu grupo de edad y nivel educativo, lo que sugiere una velocidad de procesamiento y una flexibilidad cognitiva por debajo de lo esperado.',
    healthImplication: 'Un rendimiento bajo en el TMT se ha asociado con deterioro cognitivo leve (DCL) y mayor riesgo de progresión a demencia, así como con dificultades en la multitarea y la toma de decisiones.',
    recommendation: PRO_REFERRAL + ' La actividad física regular y el entrenamiento cognitivo pueden ayudar a mejorar estas funciones.',
    citation: 'Tombaugh (2004); Lezak et al. (2012)',
  },
  {
    range: 'P25-P40', emoji: EMOJIS['P25-P40'], title: 'Ligeramente por debajo de la media',
    performance: 'Estás por debajo de la media pero sin entrar en zona de riesgo. Tu velocidad para alternar entre tareas (función ejecutiva) tiene margen de mejora.',
    healthImplication: 'La función ejecutiva sostiene la planificación, la atención y la adaptación a situaciones nuevas; mantenerla protege la autonomía cognitiva con la edad.',
    recommendation: 'Incorpora retos cognitivos variados (lectura, juegos de estrategia, aprender algo nuevo) y ejercicio aeróbico, idealmente con orientación profesional.',
    citation: 'Reitan (1958); Tombaugh (2004)',
  },
  {
    range: 'P40-P60', emoji: EMOJIS['P40-P60'], title: 'En la media',
    performance: 'Tu velocidad de procesamiento y flexibilidad cognitiva se sitúan en la media de tu grupo de edad y escolaridad. Es un nivel aceptable.',
    healthImplication: 'Un rendimiento medio indica una función ejecutiva conservada, aunque existe margen para optimizarla y construir reserva cognitiva.',
    recommendation: 'Mantén la estimulación cognitiva y la actividad física para preservar y mejorar tu rendimiento.',
    citation: 'Tombaugh (2004)',
  },
  {
    range: 'P60-P75', emoji: EMOJIS['P60-P75'], title: 'Por encima de la media',
    performance: 'Tu rendimiento supera a la media de tu grupo. Demuestras una buena velocidad de procesamiento y capacidad de alternancia cognitiva.',
    healthImplication: 'Una función ejecutiva ágil se asocia con mayor reserva cognitiva y menor vulnerabilidad al deterioro relacionado con la edad.',
    recommendation: 'Sigue desafiando tu cerebro con tareas novedosas y mantén tu estilo de vida activo.',
    citation: 'Lezak et al. (2012)',
  },
  {
    range: 'P75-P90', emoji: EMOJIS['P75-P90'], title: 'Rendimiento cognitivo excelente',
    performance: 'Tu rendimiento se encuentra entre el 10-25% mejor de tu grupo. Tu velocidad de procesamiento y flexibilidad cognitiva son notables.',
    healthImplication: 'Este nivel refleja una elevada reserva cognitiva, un factor protector frente al envejecimiento cerebral y el deterioro funcional.',
    recommendation: '¡Sigue así! Eres un referente de salud cognitiva para tu tribu.',
    citation: 'Tombaugh (2004); Lezak et al. (2012)',
  },
  {
    range: 'P90-P100', emoji: EMOJIS['P90-P100'], title: 'Élite cognitiva (top 10%)',
    performance: 'Tu tiempo te sitúa en el 10% superior de tu grupo de edad y escolaridad: un rendimiento extraordinario en velocidad de procesamiento y función ejecutiva.',
    healthImplication: 'Una reserva cognitiva tan alta actúa como protección activa frente al declive y se asocia con mejor independencia funcional a largo plazo.',
    recommendation: 'Mantén tus hábitos: este nivel es una de tus mejores defensas contra el deterioro cognitivo.',
    citation: 'Tombaugh (2004)',
  },
]

// ─── PVT-B (tiempo de reacción y atención sostenida) ───
const PVT: PercentileFeedback[] = [
  {
    range: '<P25', emoji: EMOJIS['<P25'], title: 'Atención y reflejos bajos',
    performance: 'Tu puntuación se sitúa en el rango más bajo: tiempos de reacción lentos y/o lapsos de atención frecuentes, indicadores de fatiga del sistema nervioso central.',
    healthImplication: 'Un estado de alerta reducido aumenta el riesgo de accidentes (conducción, caídas) y se asocia con somnolencia diurna y fatiga acumulada.',
    recommendation: PRO_REFERRAL + ' Prioriza también la higiene del sueño y evita realizar tareas de riesgo si te sientes fatigado.',
    citation: 'Basner & Dinges (2011); Lim & Dinges (2008)',
  },
  {
    range: 'P25-P40', emoji: EMOJIS['P25-P40'], title: 'Alerta por debajo de la media',
    performance: 'Tu tiempo de reacción está por debajo de la media. Tu capacidad de atención sostenida muestra cierta fatiga.',
    healthImplication: 'La atención sostenida es clave para la seguridad en actividades cotidianas; su descenso suele reflejar falta de descanso o sobrecarga.',
    recommendation: 'Revisa tu descanso y carga de estrés. Repite el test en condiciones óptimas y consulta con un profesional si el patrón persiste.',
    citation: 'Basner & Dinges (2011)',
  },
  {
    range: 'P40-P60', emoji: EMOJIS['P40-P60'], title: 'Alerta en la media',
    performance: 'Tu estado de alerta y velocidad de reacción están en la media. Es un nivel funcional adecuado.',
    healthImplication: 'Un nivel medio indica un sistema nervioso central descansado y sin signos de fatiga aguda relevante.',
    recommendation: 'Mantén una buena rutina de sueño y descanso para sostener este nivel.',
    citation: 'Lim & Dinges (2008)',
  },
  {
    range: 'P60-P75', emoji: EMOJIS['P60-P75'], title: 'Buenos reflejos',
    performance: 'Tu tiempo de reacción y atención superan a la media. Tu sistema nervioso responde con agilidad.',
    healthImplication: 'Una buena vigilancia psicomotora reduce el riesgo de errores y accidentes en tareas que requieren atención.',
    recommendation: 'Sigue cuidando tu descanso; tu estado de alerta es un buen indicador de recuperación.',
    citation: 'Basner & Dinges (2011)',
  },
  {
    range: 'P75-P90', emoji: EMOJIS['P75-P90'], title: 'Atención excelente',
    performance: 'Tu rendimiento está entre los mejores: reflejos rápidos y atención muy estable, sin apenas lapsos.',
    healthImplication: 'Un estado de alerta óptimo es señal de buena salud del SNC y baja fatiga central, con alta seguridad funcional.',
    recommendation: '¡Excelente! Tu nivel de alerta es un modelo para tu tribu.',
    citation: 'Lim & Dinges (2008)',
  },
  {
    range: 'P90-P100', emoji: EMOJIS['P90-P100'], title: 'Vigilancia de élite (top 10%)',
    performance: 'Te sitúas en el 10% superior: tiempos de reacción extraordinarios y atención sostenida sobresaliente.',
    healthImplication: 'Este nivel refleja un sistema nervioso plenamente descansado y eficiente, con máxima protección frente a errores por fatiga.',
    recommendation: 'Mantén tus hábitos de sueño y recuperación: estás en tu mejor estado de alerta.',
    citation: 'Basner & Dinges (2011)',
  },
]

// ─── Equilibrio Unipodal ───
const BALANCE: PercentileFeedback[] = [
  {
    range: '<P25', emoji: EMOJIS['<P25'], title: 'Equilibrio bajo — riesgo de caídas',
    performance: 'Tu tiempo de apoyo sobre un pie está en el 25% más bajo de tu grupo, lo que indica un control postural reducido.',
    healthImplication: 'Un equilibrio deficiente es uno de los predictores más potentes de caídas con consecuencias y se asocia con deterioro neuromuscular y pérdida de independencia.',
    recommendation: PRO_REFERRAL + ' El entrenamiento de propiocepción y fuerza, en entorno seguro, mejora notablemente el equilibrio.',
    citation: 'Springer et al. (2007); Vellas et al. (1997)',
  },
  {
    range: 'P25-P40', emoji: EMOJIS['P25-P40'], title: 'Equilibrio por debajo de la media',
    performance: 'Mantienes la postura menos tiempo que la media de tu grupo. Tu sistema de control postural tiene margen de mejora.',
    healthImplication: 'El control postural integra la información visual, vestibular y propioceptiva; reforzarlo previene el riesgo de caídas a medio plazo.',
    recommendation: 'Practica ejercicios de equilibrio progresivos (apoyo unipodal, superficies inestables) con supervisión profesional.',
    citation: 'Shumway-Cook & Woollacott (2012); Springer et al. (2007)',
  },
  {
    range: 'P40-P60', emoji: EMOJIS['P40-P60'], title: 'Equilibrio en la media',
    performance: 'Tu equilibrio estático se sitúa en la media para tu edad y sexo. Es un nivel aceptable.',
    healthImplication: 'Un equilibrio medio indica un sistema postural conservado, con margen para mejorar y reducir aún más el riesgo de caídas.',
    recommendation: 'Incluye ejercicios de equilibrio en tu rutina semanal para seguir progresando.',
    citation: 'Bohannon (2006)',
  },
  {
    range: 'P60-P75', emoji: EMOJIS['P60-P75'], title: 'Buen equilibrio',
    performance: 'Aguantas más tiempo que la media. Tu control postural y propiocepción son buenos.',
    healthImplication: 'Un buen equilibrio se asocia con bajo riesgo de caídas y buena salud neuromuscular y vestibular.',
    recommendation: 'Mantén y progresa con variantes más exigentes (ojos cerrados, superficies blandas).',
    citation: 'Springer et al. (2007)',
  },
  {
    range: 'P75-P90', emoji: EMOJIS['P75-P90'], title: 'Equilibrio excelente',
    performance: 'Tu rendimiento está entre los mejores de tu grupo: un control postural muy sólido.',
    healthImplication: 'Este nivel es un fuerte factor protector frente a caídas y refleja una excelente integración sensoriomotora.',
    recommendation: '¡Muy bien! Eres un referente de estabilidad para tu tribu.',
    citation: 'Vellas et al. (1997)',
  },
  {
    range: 'P90-P100', emoji: EMOJIS['P90-P100'], title: 'Equilibrio de élite (top 10%)',
    performance: 'Te sitúas en el 10% superior: un equilibrio estático extraordinario para tu edad y sexo.',
    healthImplication: 'Un control postural tan alto protege activamente frente a caídas y es señal de un sistema neuromuscular muy eficiente.',
    recommendation: 'Mantén tu entrenamiento: este nivel es una de tus mejores defensas funcionales.',
    citation: 'Springer et al. (2007)',
  },
]

// ─── 5-STS (potencia tren inferior; menor tiempo = mejor) ───
const STS5: PercentileFeedback[] = [
  {
    range: '<P25', emoji: EMOJIS['<P25'], title: 'Potencia de piernas baja',
    performance: 'Tu tiempo para 5 levantamientos está entre los más lentos de tu grupo, lo que sugiere una potencia muscular del tren inferior reducida.',
    healthImplication: 'Un 5-STS lento es un marcador de sarcopenia y dinapenia, asociado a pérdida de movilidad funcional y dependencia en actividades de la vida diaria.',
    recommendation: PRO_REFERRAL + ' Un programa de fuerza del tren inferior puede revertir gran parte de este déficit.',
    citation: 'Bohannon (2006); Cruz-Jentoft et al. (2019, EWGSOP2)',
  },
  {
    range: 'P25-P40', emoji: EMOJIS['P25-P40'], title: 'Potencia por debajo de la media',
    performance: 'Tardas algo más que la media en levantarte 5 veces. Tu potencia de piernas tiene margen de mejora.',
    healthImplication: 'La potencia del tren inferior sostiene acciones cotidianas como levantarse, subir escaleras o caminar con seguridad.',
    recommendation: 'Incorpora sentadillas y ejercicios de fuerza de piernas progresivos, idealmente supervisados.',
    citation: 'Bohannon (2006)',
  },
  {
    range: 'P40-P60', emoji: EMOJIS['P40-P60'], title: 'Potencia en la media',
    performance: 'Tu tiempo en el 5-STS está en la media de tu grupo. Es un nivel funcional adecuado.',
    healthImplication: 'Una potencia media indica una capacidad conservada para levantarte y moverte con autonomía.',
    recommendation: 'Mantén la fuerza de piernas con ejercicio regular para no perder este nivel.',
    citation: 'Cruz-Jentoft et al. (2019)',
  },
  {
    range: 'P60-P75', emoji: EMOJIS['P60-P75'], title: 'Buena potencia de piernas',
    performance: 'Te levantas más rápido que la media. Tu potencia del tren inferior es buena.',
    healthImplication: 'Una buena potencia de piernas protege la movilidad y reduce el riesgo de caídas y dependencia.',
    recommendation: 'Mantén y progresa con cargas o variantes más exigentes.',
    citation: 'Bohannon (2006)',
  },
  {
    range: 'P75-P90', emoji: EMOJIS['P75-P90'], title: 'Potencia excelente',
    performance: 'Tu tiempo está entre los mejores de tu grupo: una potencia de piernas destacada.',
    healthImplication: 'Este nivel es un fuerte factor protector frente a la sarcopenia y la pérdida de independencia funcional.',
    recommendation: '¡Genial! Tu fuerza de piernas es un modelo para tu tribu.',
    citation: 'Cruz-Jentoft et al. (2019)',
  },
  {
    range: 'P90-P100', emoji: EMOJIS['P90-P100'], title: 'Potencia de élite (top 10%)',
    performance: 'Te sitúas en el 10% más rápido de tu grupo: una potencia del tren inferior extraordinaria.',
    healthImplication: 'Una potencia tan alta es una de las mejores defensas frente al deterioro muscular y la pérdida de autonomía con la edad.',
    recommendation: 'Mantén tu entrenamiento de fuerza: estás en un nivel óptimo de salud muscular.',
    citation: 'Bohannon (2006)',
  },
]

// ─── 30-STS (fuerza-resistencia tren inferior; más reps = mejor) ───
const STS30: PercentileFeedback[] = [
  {
    range: '<P25', emoji: EMOJIS['<P25'], title: 'Fuerza-resistencia de piernas baja',
    performance: 'El número de levantamientos en 30 s te sitúa en el 25% más bajo de tu grupo, indicando una fuerza-resistencia del tren inferior reducida.',
    healthImplication: 'Una baja fuerza-resistencia de piernas se asocia con mayor riesgo de caídas, fragilidad y pérdida de independencia funcional.',
    recommendation: PRO_REFERRAL + ' El entrenamiento de fuerza de piernas mejora rápidamente este parámetro.',
    citation: 'Rikli & Jones (1999, 2013); Cossio-Bolaños et al. (2024)',
  },
  {
    range: 'P25-P40', emoji: EMOJIS['P25-P40'], title: 'Por debajo de la media',
    performance: 'Realizas menos repeticiones que la media. Tu resistencia muscular de piernas tiene margen de mejora.',
    healthImplication: 'La fuerza-resistencia del tren inferior es clave para caminar, subir escaleras y mantener la autonomía.',
    recommendation: 'Añade ejercicios de fuerza de piernas 2-3 veces por semana, con orientación profesional.',
    citation: 'Rikli & Jones (2013)',
  },
  {
    range: 'P40-P60', emoji: EMOJIS['P40-P60'], title: 'En la media',
    performance: 'Tu número de repeticiones está en la media de tu grupo de edad y sexo. Es un nivel aceptable.',
    healthImplication: 'Una resistencia media indica una capacidad funcional conservada para las actividades cotidianas.',
    recommendation: 'Mantén la fuerza de piernas con ejercicio regular y busca progresar.',
    citation: 'Cossio-Bolaños et al. (2024)',
  },
  {
    range: 'P60-P75', emoji: EMOJIS['P60-P75'], title: 'Por encima de la media',
    performance: 'Haces más repeticiones que la media. Tu fuerza-resistencia de piernas es buena.',
    healthImplication: 'Una buena resistencia del tren inferior protege la movilidad y reduce el riesgo de caídas.',
    recommendation: 'Mantén y progresa para seguir mejorando tu capacidad funcional.',
    citation: 'Rikli & Jones (1999)',
  },
  {
    range: 'P75-P90', emoji: EMOJIS['P75-P90'], title: 'Resistencia excelente',
    performance: 'Tu rendimiento está entre los mejores de tu grupo: una fuerza-resistencia de piernas destacada.',
    healthImplication: 'Este nivel es un fuerte factor protector frente a la fragilidad y la dependencia funcional.',
    recommendation: '¡Excelente! Tu resistencia de piernas es un referente para tu tribu.',
    citation: 'Rikli & Jones (2013)',
  },
  {
    range: 'P90-P100', emoji: EMOJIS['P90-P100'], title: 'Resistencia de élite (top 10%)',
    performance: 'Te sitúas en el 10% superior: una fuerza-resistencia del tren inferior extraordinaria.',
    healthImplication: 'Una capacidad tan alta es una de las mejores defensas frente al deterioro muscular asociado a la edad.',
    recommendation: 'Mantén tu entrenamiento: estás en un nivel óptimo de salud funcional.',
    citation: 'Cossio-Bolaños et al. (2024)',
  },
]

// ─── Arm Curl 30 s (fuerza-resistencia tren superior; más reps = mejor) ───
const ARMCURL: PercentileFeedback[] = [
  {
    range: '<P25', emoji: EMOJIS['<P25'], title: 'Fuerza de brazos baja',
    performance: 'Tu número de flexiones de codo te sitúa en el 25% más bajo de tu grupo, indicando una fuerza-resistencia del tren superior reducida.',
    healthImplication: 'Una baja fuerza de brazos (dinapenia de miembros superiores) dificulta tareas como llevar la compra o abrir tarros y reduce la capacidad de protegerse ante una caída.',
    recommendation: PRO_REFERRAL + ' Un programa de fuerza del tren superior puede mejorar notablemente este resultado.',
    citation: 'Rikli & Jones (1999, 2013)',
  },
  {
    range: 'P25-P40', emoji: EMOJIS['P25-P40'], title: 'Por debajo de la media',
    performance: 'Realizas menos repeticiones que la media. Tu resistencia muscular del tren superior tiene margen de mejora.',
    healthImplication: 'La fuerza de brazos sostiene muchas actividades instrumentales de la vida diaria y la capacidad de reacción ante desequilibrios.',
    recommendation: 'Incorpora ejercicios de fuerza de brazos con peso ligero, idealmente supervisados.',
    citation: 'Rikli & Jones (2013)',
  },
  {
    range: 'P40-P60', emoji: EMOJIS['P40-P60'], title: 'En la media',
    performance: 'Tu número de repeticiones está en la media de tu grupo. Es un nivel funcional adecuado.',
    healthImplication: 'Una fuerza media de brazos indica una capacidad conservada para las tareas cotidianas con carga.',
    recommendation: 'Mantén la fuerza del tren superior con ejercicio regular y busca progresar.',
    citation: 'Rikli & Jones (1999)',
  },
  {
    range: 'P60-P75', emoji: EMOJIS['P60-P75'], title: 'Por encima de la media',
    performance: 'Haces más repeticiones que la media. Tu fuerza-resistencia de brazos es buena.',
    healthImplication: 'Una buena fuerza del tren superior facilita las tareas con carga y protege la independencia funcional.',
    recommendation: 'Mantén y progresa con más carga o repeticiones para seguir mejorando.',
    citation: 'Rikli & Jones (2013)',
  },
  {
    range: 'P75-P90', emoji: EMOJIS['P75-P90'], title: 'Fuerza de brazos excelente',
    performance: 'Tu rendimiento está entre los mejores de tu grupo: una fuerza-resistencia del tren superior destacada.',
    healthImplication: 'Este nivel protege de forma robusta tu independencia funcional y tu capacidad de reacción ante caídas.',
    recommendation: '¡Muy bien! Tu fuerza de brazos es un modelo para tu tribu.',
    citation: 'Rikli & Jones (1999)',
  },
  {
    range: 'P90-P100', emoji: EMOJIS['P90-P100'], title: 'Fuerza de élite (top 10%)',
    performance: 'Te sitúas en el 10% superior: una fuerza-resistencia del tren superior extraordinaria.',
    healthImplication: 'Una fuerza tan alta es un potente factor protector frente al deterioro muscular y la pérdida de autonomía.',
    recommendation: 'Mantén tu entrenamiento: estás en un nivel óptimo de salud muscular.',
    citation: 'Rikli & Jones (2013)',
  },
]

// ─── TUG (Timed Up and Go — movilidad funcional; percentil alto = más rápido = mejor) ───
const TUG: PercentileFeedback[] = [
  {
    range: '<P25', emoji: EMOJIS['<P25'], title: 'Movilidad funcional baja — riesgo de caídas',
    performance: 'Tu tiempo en el TUG está entre los más lentos de tu grupo, lo que indica una movilidad funcional y un equilibrio dinámico reducidos.',
    healthImplication: 'Un TUG lento se asocia con mayor riesgo de caídas, deterioro de la marcha y posible fragilidad. Integra fuerza de piernas, equilibrio dinámico y giro de 180º; afecta a acciones como cruzar un semáforo o esquivar obstáculos.',
    recommendation: PRO_REFERRAL + ' El entrenamiento de fuerza de piernas y equilibrio dinámico mejora notablemente la movilidad.',
    citation: 'Podsiadlo & Richardson (1991); Shumway-Cook et al. (2000)',
  },
  {
    range: 'P25-P40', emoji: EMOJIS['P25-P40'], title: 'Por debajo de la media',
    performance: 'Tardas algo más que la media en completar el TUG. Tu movilidad funcional tiene margen de mejora.',
    healthImplication: 'El TUG integra levantarse, caminar, girar y sentarse; reforzar estos componentes previene el riesgo de caídas a medio plazo.',
    recommendation: 'Incorpora ejercicios de fuerza de piernas, marcha y giros controlados, con orientación profesional.',
    citation: 'Bohannon (2006); Kear et al. (2017)',
  },
  {
    range: 'P40-P60', emoji: EMOJIS['P40-P60'], title: 'En la media',
    performance: 'Tu tiempo en el TUG está en la media de tu grupo de edad y sexo. Nivel funcional adecuado.',
    healthImplication: 'Una movilidad media indica buena automatización de la marcha y los giros, con margen para optimizar y alejarte del umbral de riesgo.',
    recommendation: 'Mantén un estilo de vida activo con fuerza y equilibrio para conservar y mejorar tu movilidad.',
    citation: 'Kear et al. (2017)',
  },
  {
    range: 'P60-P75', emoji: EMOJIS['P60-P75'], title: 'Por encima de la media',
    performance: 'Completas el TUG más rápido que la media. Tu coordinación neuromuscular y equilibrio dinámico son buenos.',
    healthImplication: 'Una buena movilidad funcional se asocia con bajo riesgo de caídas y buena reserva de fuerza y equilibrio.',
    recommendation: 'Mantén y progresa con ejercicios de potencia y equilibrio dinámico.',
    citation: 'Bohannon (2006)',
  },
  {
    range: 'P75-P90', emoji: EMOJIS['P75-P90'], title: 'Movilidad excelente',
    performance: 'Tu tiempo está entre los mejores de tu grupo: una movilidad funcional muy sólida.',
    healthImplication: 'Este nivel es un fuerte factor protector frente a caídas y refleja una excelente integración de fuerza, equilibrio y control motor.',
    recommendation: '¡Muy bien! Tu movilidad es un referente para tu tribu.',
    citation: 'Podsiadlo & Richardson (1991)',
  },
  {
    range: 'P90-P100', emoji: EMOJIS['P90-P100'], title: 'Movilidad de élite (top 10%)',
    performance: 'Te sitúas en el 10% más rápido de tu grupo: una movilidad funcional extraordinaria.',
    healthImplication: 'Una movilidad tan alta protege activamente frente a caídas y es señal de un sistema neuromuscular y de control motor muy eficiente.',
    recommendation: 'Mantén tu entrenamiento: estás en un nivel óptimo de movilidad y coordinación.',
    citation: 'Bohannon (2006); Kear et al. (2017)',
  },
]

// ─── AHWTT (Alternate Hand Wall Toss — coordinación óculo-manual bilateral; más recepciones = mejor) ───
const BALLTOSS: PercentileFeedback[] = [
  {
    range: '<P25', emoji: EMOJIS['<P25'], title: 'Coordinación óculo-manual baja',
    performance: 'Tu número de recepciones te sitúa en el 25% más bajo de tu grupo de edad y sexo, lo que indica una coordinación visomotora bilateral por debajo de lo esperado.',
    healthImplication: 'Una coordinación ojo-mano reducida disminuye la capacidad reactiva ante objetos que caen y se asocia con mayor riesgo de caídas; los déficits marcados en tareas bimanuales pueden reflejar una integración visomotora o cerebelosa comprometida.',
    recommendation: PRO_REFERRAL + ' El entrenamiento de lanzar y atrapar, los juegos de raqueta y los ejercicios bimanuales mejoran la coordinación.',
    citation: 'Rikli & Jones (2013); Seidler et al. (2010)',
  },
  {
    range: 'P25-P40', emoji: EMOJIS['P25-P40'], title: 'Por debajo de la media',
    performance: 'Realizas menos recepciones que la media. Tu coordinación óculo-manual y tu timing bimanual tienen margen de mejora.',
    healthImplication: 'La coordinación bilateral sostiene actividades cotidianas que requieren manipular objetos con ambas manos (cocinar, vestirse, llevar la compra) y la capacidad de reaccionar con rapidez.',
    recommendation: 'Practica ejercicios de lanzamiento y recepción, juegos de pelota y tareas que combinen ambas manos, idealmente con orientación profesional.',
    citation: 'Hoeger & Hoeger; Rikli & Jones (2013)',
  },
  {
    range: 'P40-P60', emoji: EMOJIS['P40-P60'], title: 'En la media',
    performance: 'Tu número de recepciones está en la media de tu grupo de edad y sexo. Es un nivel de coordinación óculo-manual aceptable.',
    healthImplication: 'Una coordinación media indica una integración visomotora conservada, con margen para optimizar la anticipación temporal y el ajuste de la fuerza de lanzamiento.',
    recommendation: 'Mantén la práctica de habilidades de coordinación (deportes de raqueta, malabares, lanzar y atrapar) para seguir progresando.',
    citation: 'Rikli & Jones (2013)',
  },
  {
    range: 'P60-P75', emoji: EMOJIS['P60-P75'], title: 'Por encima de la media',
    performance: 'Atrapas más veces que la media. Tu coordinación óculo-manual y tu control bimanual son buenos.',
    healthImplication: 'Una buena coordinación visomotora se asocia con una respuesta motora ágil y eficiente y con menor riesgo de caídas por una mejor capacidad reactiva.',
    recommendation: 'Mantén y progresa con variantes más exigentes (mayor velocidad, más distancia o una pelota más pequeña).',
    citation: 'Swinnen (2002); Rikli & Jones (2013)',
  },
  {
    range: 'P75-P90', emoji: EMOJIS['P75-P90'], title: 'Coordinación excelente',
    performance: 'Tu rendimiento está entre los mejores de tu grupo: una coordinación óculo-manual bilateral destacada.',
    healthImplication: 'Este nivel refleja una excelente integración visomotora y cerebelosa, con una anticipación temporal y una transferencia interhemisférica muy eficientes.',
    recommendation: '¡Muy bien! Tu coordinación es un referente para tu tribu.',
    citation: 'Bernard & Seidler (2014)',
  },
  {
    range: 'P90-P100', emoji: EMOJIS['P90-P100'], title: 'Coordinación de élite (top 10%)',
    performance: 'Te sitúas en el 10% superior: una coordinación óculo-manual bilateral extraordinaria para tu edad y sexo.',
    healthImplication: 'Una coordinación tan alta es señal de un sistema visomotor y cerebeloso muy eficiente y un potente factor protector frente a caídas y a la pérdida de destreza con la edad.',
    recommendation: 'Mantén tu práctica: este nivel es una de tus mejores defensas para la destreza y la reactividad.',
    citation: 'Rikli & Jones (2013); Seidler et al. (2010)',
  },
]

// ─── Hooper (Índice de Hooper-Mackinnon — bienestar subjetivo; mayor puntuación = mejor) ───
const HOOPER: PercentileFeedback[] = [
  {
    range: '<P25', emoji: EMOJIS['<P25'], title: 'Bienestar muy bajo',
    performance: 'Tu puntuación de bienestar de hoy es muy baja: refleja una marcada combinación de fatiga, mal descanso, dolor, estrés elevado y/o ánimo deprimido.',
    healthImplication: 'Una puntuación tan baja, sobre todo si se repite, es un signo de alarma de sobreentrenamiento o sobrecarga psicofísica: la privación de sueño deteriora la cognición y eleva el riesgo de lesión, y el estrés sostenido aumenta el cortisol con efectos inmunológicos y cardiovasculares.',
    recommendation: PRO_REFERRAL + ' Si la puntuación se mantiene baja varios días consecutivos, consulta con un profesional de la salud (médico, psicólogo deportivo o preparador físico). Hoy prioriza descanso, sueño y reducción de carga.',
    citation: 'Hooper & Mackinnon (1995); McEwen (2008); Milewski et al. (2014)',
  },
  {
    range: 'P25-P40', emoji: EMOJIS['P25-P40'], title: 'Bienestar por debajo de lo habitual',
    performance: 'Tu bienestar de hoy está por debajo de lo deseable. Alguna dimensión (sueño, estrés, fatiga, dolor o ánimo) está penalizando tu estado general.',
    healthImplication: 'Mantenerte varios días en esta franja puede reflejar una recuperación incompleta y un riesgo creciente de fatiga acumulada.',
    recommendation: 'Regula la intensidad de tu actividad hoy y cuida la higiene del sueño y la gestión del estrés. Si el patrón persiste, busca orientación profesional.',
    citation: 'Hooper & Mackinnon (1995); Saw et al. (2016)',
  },
  {
    range: 'P40-P60', emoji: EMOJIS['P40-P60'], title: 'Bienestar moderado',
    performance: 'Tu bienestar de hoy es moderado: ni señales de alarma ni un estado óptimo. Es un punto de partida razonable.',
    healthImplication: 'Un bienestar medio indica una adaptación aceptable a la carga, con margen para mejorar el sueño, la recuperación y la gestión del estrés.',
    recommendation: 'Continúa con tu planificación habitual y observa la tendencia de los próximos días para detectar mejoras o caídas.',
    citation: 'Saw et al. (2016)',
  },
  {
    range: 'P60-P75', emoji: EMOJIS['P60-P75'], title: 'Buen bienestar',
    performance: 'Tu bienestar de hoy es bueno: te sientes razonablemente descansado, con poco dolor y estrés y un buen ánimo.',
    healthImplication: 'Un buen estado subjetivo se asocia con una correcta asimilación de la carga y una baja probabilidad de fatiga del sistema nervioso central.',
    recommendation: 'Buen día para afrontar demandas físicas o mentales exigentes. Mantén tus hábitos de descanso.',
    citation: 'Hooper & Mackinnon (1995)',
  },
  {
    range: 'P75-P90', emoji: EMOJIS['P75-P90'], title: 'Bienestar excelente',
    performance: 'Tu bienestar de hoy es excelente: descanso, energía, ausencia de dolor, calma y ánimo positivo se combinan favorablemente.',
    healthImplication: 'Este nivel refleja una homeostasis muy favorable y una alta capacidad de respuesta y adaptación a la carga.',
    recommendation: 'Estás en un estado óptimo. Aprovéchalo y sigue monitorizando para conservar la tendencia.',
    citation: 'Saw et al. (2016); Hooper & Mackinnon (1995)',
  },
  {
    range: 'P90-P100', emoji: EMOJIS['P90-P100'], title: 'Bienestar óptimo (homeostasis)',
    performance: 'Tu puntuación está en lo más alto: un estado de bienestar prácticamente pleno en las cinco dimensiones.',
    healthImplication: 'Una homeostasis tan favorable es señal de excelente recuperación y baja fatiga central, el mejor escenario para el rendimiento físico y cognitivo.',
    recommendation: '¡Aprovecha este pico! Mantén tu sueño, tu manejo del estrés y una carga equilibrada para sostenerlo.',
    citation: 'Hooper & Mackinnon (1995)',
  },
]

// ─── 2-Minute Step Test (resistencia aeróbica domiciliaria; más pasos = mejor) ───
const STEP2MIN: PercentileFeedback[] = [
  {
    range: '<P25', emoji: EMOJIS['<P25'], title: 'Resistencia aeróbica baja',
    performance: 'Tu número de pasos en 2 minutos te sitúa por debajo del P25 de tu grupo: una capacidad cardiorrespiratoria reducida.',
    healthImplication: 'Una baja resistencia aeróbica (fenotipo vulnerable) se asocia con menor autonomía, fatiga en actividades cotidianas y mayor riesgo cardiovascular y de fragilidad.',
    recommendation: PRO_REFERRAL + ' El ejercicio aeróbico progresivo (caminar, marcha, bici) mejora rápidamente este parámetro.',
    citation: 'Rikli & Jones (2013); ACSM (2021)',
  },
  {
    range: 'P25-P40', emoji: EMOJIS['P25-P40'], title: 'Por debajo de la media',
    performance: 'Realizas menos pasos que la media. Tu reserva cardiorrespiratoria tiene margen de mejora.',
    healthImplication: 'La capacidad aeróbica sostiene la energía diaria y protege la salud cardiometabólica.',
    recommendation: 'Añade 20-30 min de actividad aeróbica moderada casi a diario, con orientación profesional.',
    citation: 'Rikli & Jones (2013)',
  },
  {
    range: 'P40-P60', emoji: EMOJIS['P40-P60'], title: 'En la media',
    performance: 'Tu número de pasos está en la media de tu grupo de edad y sexo. Nivel funcional adecuado.',
    healthImplication: 'Una resistencia media indica una capacidad cardiorrespiratoria conservada.',
    recommendation: 'Mantén la actividad aeróbica regular y busca progresar en duración o intensidad.',
    citation: 'Rikli & Jones (2013)',
  },
  {
    range: 'P60-P75', emoji: EMOJIS['P60-P75'], title: 'Por encima de la media',
    performance: 'Haces más pasos que la media. Buena reserva cardiorrespiratoria.',
    healthImplication: 'Una buena capacidad aeróbica reduce el riesgo cardiovascular y mejora la resistencia a la fatiga.',
    recommendation: 'Mantén y progresa con intervalos o mayor volumen aeróbico.',
    citation: 'Rikli & Jones (2013)',
  },
  {
    range: 'P75-P90', emoji: EMOJIS['P75-P90'], title: 'Resistencia excelente',
    performance: 'Tu rendimiento está entre los mejores de tu grupo: una resistencia aeróbica destacada.',
    healthImplication: 'Excelente reserva cardiorrespiratoria, un fuerte factor protector cardiometabólico.',
    recommendation: '¡Muy bien! Tu capacidad aeróbica es un referente para tu tribu.',
    citation: 'Rikli & Jones (2013)',
  },
  {
    range: 'P90-P100', emoji: EMOJIS['P90-P100'], title: 'Resistencia de élite (top 10%)',
    performance: 'Te sitúas en el 10% superior: una capacidad cardiorrespiratoria extraordinaria para tu edad y sexo.',
    healthImplication: 'Una reserva aeróbica tan alta es una de las mejores defensas frente al declive funcional y cardiovascular.',
    recommendation: 'Mantén tu entrenamiento: estás en un nivel óptimo de salud aeróbica.',
    citation: 'Rikli & Jones (2013)',
  },
]

// ─── 6-Minute Walk Test (capacidad aeróbica máxima; más distancia = mejor) ───
const SIXMWT: PercentileFeedback[] = [
  {
    range: '<P25', emoji: EMOJIS['<P25'], title: 'Capacidad aeróbica baja — riesgo funcional',
    performance: 'Tu distancia recorrida queda por debajo del Límite Inferior de Normalidad para tu perfil: una capacidad aeróbica máxima reducida.',
    healthImplication: 'Una distancia baja en el 6MWT se asocia con peor pronóstico funcional y cardiorrespiratorio, mayor disnea de esfuerzo y limitación en las actividades de la vida diaria.',
    recommendation: PRO_REFERRAL + ' Un programa de ejercicio aeróbico supervisado mejora la distancia recorrida y la capacidad funcional.',
    citation: 'Enright & Sherrill (1998); Casanova et al. (2011)',
  },
  {
    range: 'P25-P40', emoji: EMOJIS['P25-P40'], title: 'Por debajo de lo esperado',
    performance: 'Caminas algo menos de lo previsto para tu edad, sexo, talla y peso. Margen de mejora en capacidad aeróbica.',
    healthImplication: 'La capacidad aeróbica máxima predice la autonomía y la tolerancia al esfuerzo en la vida diaria.',
    recommendation: 'Incrementa de forma progresiva la marcha rápida o el ejercicio aeróbico, con orientación profesional.',
    citation: 'Casanova et al. (2011)',
  },
  {
    range: 'P40-P60', emoji: EMOJIS['P40-P60'], title: 'Capacidad normal',
    performance: 'Tu distancia está dentro de los límites clínicos esperados para tu perfil. Nivel funcional adecuado.',
    healthImplication: 'Una capacidad media indica una buena tolerancia al esfuerzo submáximo y autonomía conservada.',
    recommendation: 'Mantén la actividad aeróbica regular para conservar y mejorar tu capacidad.',
    citation: 'ATS (2002)',
  },
  {
    range: 'P60-P75', emoji: EMOJIS['P60-P75'], title: 'Por encima de lo esperado',
    performance: 'Recorres más distancia que la prevista. Buena capacidad aeróbica máxima.',
    healthImplication: 'Una buena capacidad cardiorrespiratoria se asocia con menor riesgo cardiovascular y mejor pronóstico funcional.',
    recommendation: 'Mantén y progresa con caminatas más largas o intervalos.',
    citation: 'Enright & Sherrill (1998)',
  },
  {
    range: 'P75-P90', emoji: EMOJIS['P75-P90'], title: 'Capacidad excelente',
    performance: 'Tu rendimiento está entre los mejores de tu perfil: una capacidad aeróbica máxima destacada.',
    healthImplication: 'Excelente reserva cardiorrespiratoria y un fuerte factor protector cardiometabólico.',
    recommendation: '¡Muy bien! Tu resistencia es un referente para tu tribu.',
    citation: 'Casanova et al. (2011)',
  },
  {
    range: 'P90-P100', emoji: EMOJIS['P90-P100'], title: 'Capacidad de élite (top 10%)',
    performance: 'Superas ampliamente tu distancia predicha: una capacidad aeróbica extraordinaria.',
    healthImplication: 'Una capacidad tan alta es una de las mejores defensas frente al declive cardiorrespiratorio asociado a la edad.',
    recommendation: 'Mantén tu entrenamiento: estás en un nivel óptimo de salud aeróbica.',
    citation: 'Enright & Sherrill (1998); ATS (2002)',
  },
]

export const FEEDBACK_MESSAGES: Record<FeedbackTestKey, PercentileFeedback[]> = {
  tmt: TMT, pvt: PVT, balance: BALANCE, sts5: STS5, sts30: STS30, armcurl: ARMCURL, tug: TUG, balltoss: BALLTOSS, hooper: HOOPER, step2min: STEP2MIN, '6mwt': SIXMWT,
}

export const FEEDBACK_TEST_NAMES: Record<FeedbackTestKey, string> = {
  tmt: 'Trail Making Test — TMT',
  pvt: 'PVT-B (Vigilancia Psicomotora)',
  balance: 'Equilibrio Unipodal',
  sts5: 'Sit-to-Stand 5 repeticiones (5-STS)',
  sts30: 'Sit-to-Stand 30 segundos (30-STS)',
  armcurl: 'Arm Curl Test 30 s',
  tug: 'Timed Up and Go (TUG)',
  balltoss: 'Alternate Hand Wall Toss Test (AHWTT)',
  hooper: 'Índice de Hooper-Mackinnon (Bienestar)',
  step2min: '2-Minute Step Test',
  '6mwt': '6-Minute Walk Test (6MWT)',
}

/** Devuelve el mensaje de feedback de un test para un percentil dado (0-100). */
export function getFeedback(testKey: FeedbackTestKey, percentile: number): PercentileFeedback {
  const range = percentileToRange(percentile)
  const list = FEEDBACK_MESSAGES[testKey]
  return list.find((m) => m.range === range) ?? list[2]
}
