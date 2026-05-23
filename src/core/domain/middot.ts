import type { Middah } from './types'

// Las 13 middot según R. Mendel de Satanov — orden exacto del sefer
export const MIDDOT: Middah[] = [
  {
    id: 1,
    hebrew: 'מְנוּחָה',
    transliteration: 'Menuchah',
    spanish: 'Serenidad',
    description:
      'La calma interior como fundamento de toda conducta recta. R. Mendel enseña que quien no domina su estado de ánimo no puede adquirir ninguna otra virtud. La menuchah no es pasividad sino equilibrio activo del alma.',
    dailyPrompt: '¿Mantuve hoy la calma interior frente a las perturbaciones externas?',
  },
  {
    id: 2,
    hebrew: 'סַבְלָנוּת',
    transliteration: 'Savlanut',
    spanish: 'Paciencia',
    description:
      'La capacidad de soportar la demora, la frustración y las personas difíciles sin perder la ecuanimidad. R. Mendel la coloca después de la serenidad: primero hay que tener paz interior para poder aguardar con dignidad.',
    dailyPrompt: '¿Respondí con paciencia a las personas y situaciones que pusieron a prueba mi tolerancia?',
  },
  {
    id: 3,
    hebrew: 'סֵדֶר',
    transliteration: 'Seder',
    spanish: 'Orden',
    description:
      'Organización del tiempo, el espacio y las prioridades. El seder libera energía mental: cuando el entorno está ordenado, la mente puede ocuparse de lo que realmente importa. Incluye el orden en el habla y en el pensamiento.',
    dailyPrompt: '¿Mantuve mis compromisos de tiempo y orden en las tareas de hoy?',
  },
  {
    id: 4,
    hebrew: 'חֲרִיצוּת',
    transliteration: 'Charitzut',
    spanish: 'Determinación',
    description:
      'El impulso decidido hacia los objetivos elegidos, sin dilaciones ni medias tintas. R. Mendel la distingue de la velocidad: no es hacer todo rápido, sino hacer cada cosa con plena intención y energía.',
    dailyPrompt: '¿Actué hoy con determinación hacia mis metas, o me dejé llevar por la postergación?',
  },
  {
    id: 5,
    hebrew: 'נִקָּיוֹן',
    transliteration: 'Nikiyon',
    spanish: 'Pureza',
    description:
      'Limpieza del cuerpo, del espíritu y de los motivos. Va más allá de la higiene física: es la pureza de intención, evitar pensamientos que enturbian y mantener los actos libres de intereses ocultos.',
    dailyPrompt: '¿Actué hoy con motivos limpios, sin segundas intenciones hacia los demás?',
  },
  {
    id: 6,
    hebrew: 'עֲנָוָה',
    transliteration: 'Anavah',
    spanish: 'Humildad',
    description:
      'No el auto-menosprecio, sino el reconocimiento exacto del propio lugar. La anavah permite escuchar, aprender y recibir corrección sin sentirse amenazado. Es la base de las relaciones honestas.',
    dailyPrompt: '¿Escuché hoy con apertura real, sin defenderme ni minimizar a los demás?',
  },
  {
    id: 7,
    hebrew: 'צֶדֶק',
    transliteration: 'Tzedek',
    spanish: 'Justicia',
    description:
      'Dar a cada persona y situación lo que le corresponde, con rectitud en los juicios y en los tratos. Incluye la justicia con uno mismo: no ser ni demasiado severo ni demasiado indulgente.',
    dailyPrompt: '¿Fui hoy justo en mis juicios sobre los demás y sobre mí mismo?',
  },
  {
    id: 8,
    hebrew: 'קִמּוּץ',
    transliteration: 'Kimutz',
    spanish: 'Frugalidad',
    description:
      'El uso consciente y austero de los recursos: tiempo, dinero, palabras y energía. R. Mendel no propone la pobreza sino la sobriedad: tomar solo lo necesario, sin desperdiciar lo que pertenece a la vida.',
    dailyPrompt: '¿Usé hoy mis recursos (tiempo, dinero, palabras) con sobriedad y conciencia?',
  },
  {
    id: 9,
    hebrew: 'זְרִיזוּת',
    transliteration: 'Zerizut',
    spanish: 'Prontitud',
    description:
      'La agilidad para actuar en el momento oportuno, sin dejar que la oportunidad pase. Es la contrapartida de la charitzut: si la determinación apunta a los objetivos grandes, la zerizut cuida los momentos pequeños.',
    dailyPrompt: '¿Aproveché hoy las oportunidades de bien que se presentaron, sin dejarlas pasar?',
  },
  {
    id: 10,
    hebrew: 'שְׁתִיקָה',
    transliteration: 'Shtikah',
    spanish: 'Silencio',
    description:
      'El dominio de la palabra. Hablar menos y con más peso. R. Mendel, siguiendo una larga tradición judía, ve en el control del habla uno de los ejercicios espirituales más difíciles y más transformadores.',
    dailyPrompt: '¿Guardé silencio cuando no era necesario hablar, y hablé con cuidado cuando sí era necesario?',
  },
  {
    id: 11,
    hebrew: 'נַחַת',
    transliteration: 'Nachat',
    spanish: 'Calma',
    description:
      'La quietud en el movimiento: actuar sin urgencia innecesaria, sin agitación. Donde la menuchah es paz interior, el nachat es la expresión externa de esa paz en el ritmo de vida cotidiana.',
    dailyPrompt: '¿Actué hoy con calma en mi ritmo de vida, sin generar agitación en mí o en los demás?',
  },
  {
    id: 12,
    hebrew: 'אֱמֶת',
    transliteration: 'Emet',
    spanish: 'Verdad',
    description:
      'La coherencia entre lo que se piensa, se dice y se hace. R. Mendel la entiende como el pilar de la persona íntegra: no hay que mentir, pero tampoco racionalizar, exagerar ni engañarse a uno mismo.',
    dailyPrompt: '¿Fui hoy completamente honesto: conmigo mismo y con los demás?',
  },
  {
    id: 13,
    hebrew: 'פְּרִישׁוּת',
    transliteration: 'Prishut',
    spanish: 'Separación',
    description:
      'La capacidad de distanciarse de lo que no sirve al crecimiento: placeres superfluos, relaciones que drenan, hábitos que degradan. No es ascetismo total, sino el arte de poner límites con discernimiento.',
    dailyPrompt: '¿Me separé hoy de lo que me aleja de mis valores y propósitos más profundos?',
  },
]

export const getMiddahById = (id: number): Middah | undefined =>
  MIDDOT.find((m) => m.id === id)
