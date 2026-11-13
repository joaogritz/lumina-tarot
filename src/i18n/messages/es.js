// Español. Interface texts by key; plural entries have `one` and `other`.
// Placeholders like {name} are filled by t(key, vars) in src/i18n/index.js.
export default {
  "common": {
    "close": "Cerrar",
    "retry": "Intentar de nuevo",
    "privacy": "Privacidad",
    "copied": "¡Copiado!",
    "yes": "Sí",
    "no": "No",
    "tarot": "Tarot",
    "lenormand": "Baraja Lenormand",
    "tagline": "Tarot y Lenormand",
    "reversed": "Invertida",
    "reversedShort": "inv.",
    "viewDetails": "Ver detalles de {name}",
    "card": {
      "one": "carta",
      "other": "cartas"
    },
    "cardCount": {
      "one": "{count} carta",
      "other": "{count} cartas"
    },
    "majorArcana": "Arcano Mayor {roman}",
    "lenormandCard": "Lenormand · Carta {number}",
    "disclaimer": "Lectura simbólica para la reflexión. No sustituye el consejo médico, psicológico, jurídico o financiero.",
    "language": "Idioma"
  },
  "entry": {
    "description": "Tu camino empieza con una pregunta y una elección.",
    "enter": "Entrar al Santuario",
    "preparing": "Preparando el santuario",
    "status": {
      "cards": "Preparando las cartas",
      "shuffle": "Barajando",
      "almost": "Casi listo",
      "ready": "Listo"
    },
    "figure": "FIG. XVII — EL ORÁCULO",
    "footer": "UN INSTANTE DE SILENCIO. UNA NUEVA PERSPECTIVA."
  },
  "header": {
    "menu": "Menú",
    "yesNo": "Sí o No",
    "journal": "Diario"
  },
  "opening": {
    "chapter": "La pregunta",
    "title1": "¿Sobre qué",
    "title2": "deseas reflexionar?",
    "label": "Tu pregunta",
    "optional": "opcional",
    "placeholder": "Escríbela con tus palabras",
    "clear": "Borrar",
    "hint": "Sin pregunta, las cartas ofrecen una lectura abierta del momento."
  },
  "menu": {
    "kicker": "Índice",
    "navLabel": "Consultas y herramientas",
    "yesNoNote": "Una carta para una pregunta directa",
    "daily": "Carta del día",
    "dailyNote": "Un arcano para acompañar tu día",
    "grimoire": "Grimorio",
    "grimoireNote": "El significado de cada carta",
    "journalNote": "Tus lecturas guardadas",
    "journalCount": {
      "one": "{count} lectura guardada",
      "other": "{count} lecturas guardadas"
    },
    "guide": "Cómo leer",
    "guideNote": "El método, paso a paso",
    "themes": "Atmósferas",
    "themesNote": "El color del altar",
    "table3d": "Mesa 3D",
    "table3dNote": "Una mesa libre para disponer las cartas",
    "preferences": "Preferencias",
    "reversed": "Cartas invertidas",
    "reversedNA": "No se usa en Lenormand",
    "sound": "Efectos de sonido",
    "on": "Activados",
    "off": "Desactivados",
    "footer": "Lecturas simbólicas, para reflexionar.",
    "language": "Idioma"
  },
  "table": {
    "skip": "Ir a la mesa de lectura",
    "chapterSpread": "La tirada",
    "chapterTable": "La mesa",
    "chapterDeck": "La baraja",
    "footerText": "Tarot y Lenormand, para reflexionar. Las lecturas son simbólicas y no sustituyen el consejo médico, psicológico, jurídico o financiero.",
    "shortcuts": "Atajos: Espacio baraja, D saca al azar, G grimorio, H diario, Esc cierra",
    "deckDialogTitle": "¿Cambiar a {name}?",
    "deckDialogText": "Las cartas de la mesa se recogerán. Las lecturas guardadas en el diario se conservan.",
    "deckDialogCancel": "Seguir leyendo",
    "deckDialogConfirm": "Cambiar de baraja"
  },
  "dock": {
    "label": "Navegación rápida",
    "table": "Mesa",
    "random": "Al azar",
    "more": "Más",
    "sheetLabel": "Más consultas y preferencias",
    "closeSheet": "Cerrar herramientas",
    "sheetText": "Otras consultas y preferencias.",
    "yesNoNote": "Una carta para tu pregunta",
    "journal": "Diario de lecturas",
    "journalNote": "Vuelve a tus reflexiones",
    "themesNote": "Elige la atmósfera de tu mesa"
  },
  "journal": {
    "dialog": "Diario de lecturas",
    "title": "Diario",
    "tabReadings": "Lecturas ({count})",
    "tabStats": "Estadísticas",
    "search": "Buscar en el diario",
    "searchPlaceholder": "Buscar por carta, pregunta, tirada o notas…",
    "exportAria": "Exportar diario",
    "exportTitle": "Descargar todas las lecturas en un archivo JSON",
    "export": "Exportar",
    "importAria": "Importar copia del diario",
    "importTitle": "Restaurar lecturas desde una copia JSON",
    "import": "Importar",
    "localNote": "Tus lecturas se quedan solo en este navegador. Exporta una copia para guardarlas o llevarlas a otro dispositivo.",
    "exported": {
      "one": "Copia con {count} lectura descargada.",
      "other": "Copia con {count} lecturas descargada."
    },
    "tooBig": "El archivo es demasiado grande para una copia del diario (máx. 5 MB).",
    "restored": {
      "one": "{count} lectura restaurada",
      "other": "{count} lecturas restauradas"
    },
    "ignored": {
      "one": "{count} repetida o no válida omitida",
      "other": "{count} repetidas o no válidas omitidas"
    },
    "dropped": {
      "one": "{count} más antigua quedó fuera por el límite de 100",
      "other": "{count} más antiguas quedaron fuera por el límite de 100"
    },
    "readFailed": "No se pudo leer la copia.",
    "notJson": "El archivo no es un JSON válido.",
    "notBackup": "Este archivo no es una copia del diario de Lumina.",
    "newer": "Esta copia se creó con una versión más reciente de Lumina.",
    "empty": "Aún no hay lecturas guardadas.",
    "emptyHint": "Usa «Guardar en el diario» al final de una lectura para volver a verla aquí.",
    "noMatch": "Ninguna lectura coincide con la búsqueda.",
    "delete": "Eliminar lectura",
    "oracle": "La lectura del oráculo:",
    "diagnosis": "🌌 Diagnóstico:",
    "dynamics": "🔮 Fuerzas ocultas:",
    "advice": "🗝️ Consejo:",
    "notes": "Notas personales:",
    "edit": "Editar",
    "addNote": "Añadir nota",
    "notePlaceholder": "Escribe tus impresiones, sentimientos o ideas sobre esta tirada…",
    "save": "Guardar",
    "noNotes": "Sin notas todavía.",
    "statReadings": "Tiradas realizadas",
    "statCards": "Cartas",
    "statMajors": "Arcanos Mayores",
    "statGuide": "Carta más frecuente",
    "lenormandNote": "Baraja Lenormand: {count} cartas en el historial. Las demás categorías corresponden al Tarot.",
    "top": "Tus 5 cartas más frecuentes",
    "topEmpty": "Haz tiradas en la mesa para trazar tu mapa de arquetipos.",
    "lenormandShort": "Lenormand",
    "balance": "Equilibrio elemental de tu recorrido",
    "fire": "Fuego / Bastos (Acción y voluntad)",
    "water": "Agua / Copas (Emociones e intuición)",
    "air": "Aire / Espadas (Mente y verdad)",
    "earth": "Tierra / Oros (Materia y realización)"
  },
  "image": {
    "advice": "CONSEJO DEL ORÁCULO",
    "fileName": "lumina-lectura",
    "shareText": "Mi lectura en Lumina Tarot · luminatarot.app"
  },
  "yesno": {
    "interpreting": "Interpretando {name} para tu pregunta",
    "dialog": "Oráculo sí o no",
    "kicker": "Una carta, una respuesta",
    "title": "Sí o No",
    "intro": "Haz tu pregunta y explora una orientación simbólica con consejos prácticos. El resultado no es una certeza sobre los hechos.",
    "inputLabel": "Pregunta para el oráculo sí o no",
    "placeholder": "Piensa o escribe una pregunta directa…",
    "suggestions": "Sugerencias",
    "s1": "¿Debo dar este paso ahora?",
    "s2": "¿Es una oportunidad favorable?",
    "s3": "¿Este proyecto saldrá bien?",
    "s4": "¿Debo ser prudente y esperar?",
    "s5": "¿Esta persona es sincera conmigo?",
    "drawing": "Barajando",
    "draw": "Sacar la carta",
    "loading": "Leyendo la carta…",
    "unavailableHint": "{name} sigue reservada para tu pregunta. Inténtalo de nuevo en unos instantes.",
    "another": "Otra pregunta",
    "yourQuestion": "Tu pregunta:",
    "cardTitle": "Haz clic para ver los detalles de la carta",
    "answer": "Respuesta del oráculo:",
    "tip": "Consejo práctico / condición:",
    "copy": "Copiar respuesta",
    "done": "Terminar",
    "positionName": "Oráculo del Sí o No",
    "positionMeaning": "Respuesta directa y consejo",
    "text": {
      "header": "🔮 LUMINA TAROT · SÍ O NO",
      "question": "Pregunta: «{question}»",
      "card": "Carta: {name}",
      "verdict": "Veredicto: {verdict}",
      "answer": "Respuesta: {answer}",
      "tip": "💡 Consejo: {tip}"
    }
  },
  "card": {
    "artUnavailableFor": "Arte de {name} no disponible",
    "artUnavailable": "Arte no disponible",
    "fallbackName": "Carta"
  },
  "daily": {
    "dialog": "Carta del día",
    "title": "Carta del día",
    "subtitle": "Una carta para acompañar tu día.",
    "streak": {
      "one": "{count} día seguido",
      "other": "{count} días seguidos"
    },
    "cardTitle": "Haz clic para ver todos los detalles",
    "focus": "Enfoque del día:",
    "advice": "Consejo práctico para hoy:",
    "notifyUnsupported": "Este navegador no admite notificaciones.",
    "notifyOn": "¡Recordatorio diario activado!",
    "notifyTitle": "Lumina · Carta del día",
    "notifyBody": "Tu carta del día te está esperando.",
    "notifyDenied": "Se rechazó el permiso para notificaciones.",
    "reminderOn": "Recordatorio diario activado",
    "remind": "Recordármelo cada día"
  },
  "grimoire": {
    "dialog": "Grimorio",
    "title": "Grimorio · {count} cartas",
    "subtitle": "Significados, correspondencias y símbolos de cada carta",
    "all": "Las {count}",
    "major": "22 Mayores",
    "wands": "Bastos (Fuego)",
    "cups": "Copas (Agua)",
    "swords": "Espadas (Aire)",
    "pentacles": "Oros (Tierra)",
    "search": "Buscar en el grimorio",
    "searchPlaceholder": "Buscar por nombre, arquetipo o palabra clave…",
    "inspect": "Haz clic para ver"
  },
  "guide": {
    "dialog": "Guía de lectura",
    "title": "Cómo leer",
    "intro": "El Tarot es un espejo simbólico. Formula la pregunta con calma y elige las cartas sin prisa: la lectura es una invitación a reflexionar, no una predicción.",
    "lenormandTitle": "Baraja Lenormand · Petit Lenormand",
    "lenormandText": "Elige la baraja antes de la tirada. Sus 36 cartas usan símbolos cotidianos y se leen sin inversiones. En la línea de tres cartas, lee también los pares vecinos como una secuencia; con una sola carta, usa el símbolo como foco de reflexión. La Torre representa estructuras y autonomía; la Luna, emoción y reconocimiento. Sus significados difieren del Tarot. Aquí, Sí o No es una adaptación simbólica, no una probabilidad.",
    "q": {
      "title": "1. Cómo formular tu pregunta",
      "text": "Prefiere preguntas abiertas que inviten a reflexionar:",
      "ex1": "«¿Qué energías debo cultivar para resolver este bloqueo?»",
      "or": "o",
      "ex2": "«¿Qué necesito comprender sobre esta etapa?»"
    },
    "s": {
      "title": "2. La estructura de las 78 cartas",
      "major": "22 Arcanos Mayores:",
      "majorText": "Grandes lecciones, hitos espirituales y transformaciones profundas.",
      "wands": "14 Bastos (Fuego):",
      "wandsText": "Voluntad, energía creativa, pasión, trabajo y nuevos proyectos.",
      "cups": "14 Copas (Agua):",
      "cupsText": "Emociones, amor, intuición, familia y relaciones.",
      "swords": "14 Espadas (Aire):",
      "swordsText": "Claridad mental, desafíos, verdad, justicia y decisiones racionales.",
      "pentacles": "14 Oros (Tierra):",
      "pentaclesText": "Prosperidad material, finanzas, salud física y paciencia en la cosecha."
    },
    "t": {
      "title": "3. La tirada de 3 cartas (predeterminada)",
      "a": "En la lectura de 3 cartas, la primera representa las",
      "b": "raíces y causas pasadas",
      "c": "; la segunda, el",
      "d": "momento presente y sus fuerzas activas",
      "e": "; y la tercera, la",
      "f": "tendencia futura y consejo de acción"
    },
    "done": "Entendido, volver a la mesa"
  },
  "themes": {
    "dialog": "Temas",
    "title": "Atmósferas",
    "subtitle": "El tono de fondo de la mesa.",
    "apply": "Aplicar",
    "cosmic": "Tinta y oro champán",
    "lunar": "Azul medianoche y plata",
    "solar": "Ámbar oscuro y latón",
    "crimson": "Vino profundo y marfil",
    "ivoire": "Marfil, tinta y oro viejo"
  },
  "detail": {
    "dialog": "Detalles de {name}",
    "close": "Cerrar detalles de la carta",
    "position": "Posición: {name}",
    "reversed": "Carta invertida",
    "influence": "Influencia en la posición ({name})",
    "light": "Luz y potencial positivo:",
    "shadowReversed": "⚡ Manifestación invertida (sombra y bloqueo activo):",
    "shadow": "Sombra y punto de atención:",
    "advice": "Consejo del oráculo:"
  },
  "confirm": {
    "dialog": "Cambiar tirada",
    "cancelAria": "Cancelar cambio de tirada",
    "title": "Cambiar tipo de tirada",
    "text": "Las cartas de la mesa se recogerán y la baraja se volverá a barajar. ¿Deseas continuar?",
    "keep": "Mantener la mesa actual",
    "ok": "Confirmar cambio"
  },
  "ritual": {
    "dialog": "Cartas sacadas al azar",
    "cancel": "Cancelar",
    "skip": "Saltar",
    "kicker": "EL ORÁCULO HA ELEGIDO",
    "done": "El destino ha respondido.",
    "aligning": "Alineando las cartas…",
    "chosen": {
      "one": "{count} carta elegida para «{spread}»",
      "other": "{count} cartas elegidas para «{spread}»"
    },
    "toTable": "Llevar a la mesa"
  },
  "shuffle": {
    "cut": "Cortando la baraja…",
    "riffle": "Barajando",
    "fan": "Alineando las cartas…",
    "ready": "Listo",
    "sr": "Baraja barajada"
  },
  "deckSel": {
    "label": "Elección de baraja",
    "eyebrow": "TU ORÁCULO",
    "title": "¿Qué baraja guía tu lectura?",
    "hintLenormand": "Lee los símbolos en conjunto, de izquierda a derecha. En esta baraja las cartas siempre están derechas.",
    "hintTarot": "Explora los arquetipos del Tarot. Elige una tirada y, si quieres, activa las cartas invertidas.",
    "switchTitle": "¿Cambiar a {name}?",
    "switchText": "Las cartas de la mesa se recogerán. Las lecturas guardadas en el diario se conservan.",
    "keep": "Seguir leyendo",
    "switch": "Cambiar baraja",
    "tarotSubtitle": "78 cartas · Arcanos mayores y menores",
    "lenormandSubtitle": "36 cartas · Petit Lenormand"
  },
  "error": {
    "title": "Algo se salió de su lugar",
    "text": "Un error interrumpió la mesa. No te preocupes: tu diario y tus lecturas guardadas siguen a salvo.",
    "reload": "Recargar la mesa",
    "reset": "Empezar de nuevo",
    "details": "Detalles técnicos"
  },
  "oracle": {
    "fill": {
      "advice2": "El consejo principal es mantener la calma, ser honesto contigo y no decidir por impulso.",
      "dynamics1": "La situación actual pide paciencia para ver las cosas con más claridad.",
      "advice1": "Da un paso a la vez y confía en tu intuición.",
      "dynamics": "La situación actual pide calma y observación atenta.",
      "advice": "Mantén los pies en la tierra y elige con conciencia.",
      "ynAnswer": "Las cartas muestran un movimiento directo para tu pregunta.",
      "ynTip": "Mantén la firmeza en tus decisiones y observa los detalles prácticos."
    },
    "fb": {
      "lenormandIntro": "Lectura simbólica de Petit Lenormand: {cards}",
      "lenormandPair": "{a} + {b}: observa cómo {x} se relaciona con {y}.",
      "lenormandSingle": "Una carta ofrece un foco de reflexión; las combinaciones amplían el contexto.",
      "lenormandAdvice": "{advice} Usa esta lectura como reflexión, no como una predicción garantizada.",
      "qReversed": "Para tu consulta («{question}»): {name} ({reversed}) indica trabas y falta de transparencia en este momento. La carta advierte de {shadow}.",
      "q": "Para tu consulta («{question}»): {name} trae la energía de {light}. Las cartas indican que los acontecimientos están ligados a ese movimiento.",
      "reversed": "{name} ({reversed}) señala un momento de atención en tu camino. La energía actual refleja {shadow}.",
      "plain": "{name} destaca que tu momento actual está movido por {light}.",
      "shadow": "Detrás de este escenario, {name} revela el punto que requiere más atención: {meaning}. Junto con {middle}, muestra la necesidad de analizar los detalles antes de actuar.",
      "pair": "En la dinámica de las cartas, {first} y {middle} actúan juntas. Mientras la primera marca el tono, {middle} refuerza la importancia de centrarse en {light}.",
      "advice": "Orientación práctica de {name}: {advice}. Analiza la situación con discernimiento y decide según los hechos concretos.",
      "defaultLight": "nuevo comienzo y claridad",
      "defaultShadow": "dudas y bloqueos",
      "defaultMiddle": "estabilidad y acción",
      "defaultShadowMeaning": "desafíos prácticos",
      "defaultAdvice": "Actúa con firmeza, claridad y los pies en la tierra"
    }
  },
  "yn": {
    "v": {
      "facts": "BUSCA ORIENTACIÓN BASADA EN HECHOS",
      "maybe": "QUIZÁS",
      "condYes": "SÍ, CON UNA CONDICIÓN",
      "noAlert": "NO / ALERTA",
      "depends": "DEPENDE DE TI",
      "noBlock": "NO / BLOQUEO",
      "yesCourage": "SÍ, CON VALOR",
      "yesSure": "UN SÍ ROTUNDO",
      "yes": "SÍ",
      "yesSecret": "SÍ, CON DISCRECIÓN",
      "notNow": "NO POR AHORA",
      "pause": "PAUSA / QUIZÁS",
      "noCaution": "NO / CAUTELA",
      "yesClarity": "SÍ, CON CLARIDAD",
      "noTension": "NO / TENSIÓN",
      "dependsReason": "DEPENDE DE LA RAZÓN",
      "yesEffort": "SÍ, CON ESFUERZO",
      "yesEnergy": "UN SÍ ENÉRGICO",
      "noDisillusion": "NO / DESILUSIÓN",
      "yesHeart": "UN SÍ AFECTIVO",
      "noScarcity": "NO / ESCASEZ",
      "yesPatience": "SÍ, CON PACIENCIA",
      "yesSolid": "UN SÍ CONCRETO",
      "support": "BUSCA APOYO PROFESIONAL",
      "self": "ENFOQUE EN EL AUTOCONOCIMIENTO"
    },
    "none": {
      "summary": "El momento pide reflexión y observación antes de definir nada.",
      "tip": "Depende de ti analizar los hechos con calma y no precipitarte."
    },
    "lenormand": {
      "summary": "Como reflexión simbólica: {light}"
    },
    "revGood": {
      "summary": "La esencia de {name} sigue siendo favorable, pero la inversión advierte de retrasos o falta de alineación.",
      "tip": "Sí, pero depende de ti ajustar el foco, tener paciencia y no forzar los acontecimientos antes de tiempo."
    },
    "revHeavy": {
      "summary": "La energía invertida de {name} señala apegos, ilusiones o riesgo de frustración si insistes ahora.",
      "tip": "No, a menos que hagas una limpieza profunda y rompas de una vez con viejos patrones."
    },
    "revDefault": {
      "summary": "La inversión de {name} indica resistencias internas, falta de claridad o un momento inoportuno.",
      "tip": "No por el momento. A menos que revises tus premisas y cambies radicalmente de estrategia."
    },
    "fool": {
      "summary": "Los caminos están abiertos a lo nuevo y la energía es de libertad y nuevo comienzo.",
      "tip": "Sí, pero depende de ti dar el primer paso sin miedo, cuidando de no ser imprudente con los detalles prácticos."
    },
    "sun": {
      "summary": "Claridad total, éxito, vitalidad y la verdad a tu favor.",
      "tip": "¡Sí! Sé auténtico, actúa con transparencia y aprovecha el momento favorable con confianza."
    },
    "world": {
      "summary": "Un ciclo favorable de realización, coronación y plena expansión.",
      "tip": "¡Sí! Termina lo que empezaste y confía en la plenitud de tus resultados."
    },
    "majorYes": {
      "summary": "La energía de {name} favorece directamente tu intención e impulsa tu camino.",
      "tipAdvice": "Sí, pero recuerda: {advice}",
      "tip": "Sí, pero depende de ti mantener la constancia y actuar con firmeza."
    },
    "justice": {
      "summary": "El desenlace será la consecuencia exacta de tus elecciones y de tu sentido ético.",
      "tip": "Depende de ti actuar con total rectitud, revisar contratos o acuerdos y ser completamente justo."
    },
    "priestess": {
      "summary": "Las respuestas maduran en lo oculto; la intuición apunta en una dirección favorable.",
      "tip": "Sí, pero depende de ti guardar en secreto tus planes y confiar más en tu presentimiento."
    },
    "hermit": {
      "summary": "El momento pide pausa, reflexión en soledad y prudencia antes de cualquier avance público.",
      "tip": "No de inmediato. Depende de ti madurar la idea a solas antes de tomar la decisión final."
    },
    "hanged": {
      "summary": "Hace falta un tiempo de espera para cambiar tu perspectiva sobre el asunto.",
      "tip": "Depende de ti renunciar a la terquedad y ver la situación desde otro ángulo."
    },
    "majorNo": {
      "summary": "La energía de {name} avisa de riesgos, desilusiones, rupturas o conflictos ocultos.",
      "tip": "No, a menos que estés dispuesto a afrontar verdades duras y cambiarlo todo desde cero."
    },
    "swordsYes": {
      "summary": "La lucidez mental, la verdad y la razón apuntan a una resolución favorable.",
      "tip": "Sí, pero depende de ti tener una conversación honesta y no alimentar medias verdades."
    },
    "swordsNo": {
      "summary": "El escenario apunta a desgaste, desconfianza, frustración o exceso de preocupación.",
      "tip": "No. A menos que te protejas de influencias tóxicas y evites actuar en caliente."
    },
    "swordsMaybe": {
      "summary": "La respuesta exige estrategia, equilibrio emocional y un análisis lógico de la realidad.",
      "tip": "Depende de ti decidir con la cabeza y cortar las dudas que te paralizan."
    },
    "wandsEffort": {
      "summary": "Hay potencial positivo, aunque acompañado de sobrecarga, competencia o cansancio.",
      "tip": "Sí, pero depende de ti delegar tareas y no cargar con el peso del mundo."
    },
    "wandsYes": {
      "summary": "El entusiasmo, la motivación y el movimiento directo aceleran los acontecimientos a tu favor.",
      "tip": "¡Sí! Toma la iniciativa ahora y no dejes que se apague la llama de tu motivación."
    },
    "cupsNo": {
      "summary": "Expectativas irreales, apego al pasado o ilusiones emocionales están bloqueando el flujo.",
      "tip": "No por ahora. A menos que superes viejas frustraciones y mires la realidad tal como es."
    },
    "cupsYes": {
      "summary": "Armonía en los sentimientos, acogida sincera y sintonía positiva para tu petición.",
      "tip": "Sí, pero depende de ti expresar lo que sientes con sinceridad y empatía."
    },
    "pentNo": {
      "summary": "Sensación de desamparo, apuro económico o falta de apoyo en este momento.",
      "tip": "No en este momento. A menos que busques ayuda y reestructures primero tus bases materiales."
    },
    "pentPatience": {
      "summary": "La semilla se plantó con seguridad, pero el resultado necesita tiempo para madurar.",
      "tip": "Sí, pero depende de ti tener paciencia para cosechar en el momento justo, sin forzar el ritmo natural."
    },
    "pentYes": {
      "summary": "Estabilidad, beneficio práctico y suelo firme para concretar tus planes.",
      "tip": "¡Sí! Mantén la disciplina, organiza tus recursos y avanza con los pies en la tierra."
    },
    "default": {
      "summary": "Las corrientes soplan a favor de tu pregunta.",
      "tip": "Sí, pero depende de ti mantener la dedicación y centrarte en tus metas."
    },
    "offline": {
      "withQuestion": "Para tu pregunta («{question}»): {name} indica {summary}",
      "noQuestion": "{name} muestra que {summary}",
      "revealed": "la carta revelada"
    }
  },
  "meta": {
    "title": "Lumina Tarot • Santuario de los Arcanos",
    "description": "Oráculo y mesa virtual de lectura de Tarot con las 78 cartas clásicas, tiradas guiadas, Mesa 3D, diario de lecturas e interpretaciones personalizadas para tu pregunta."
  },
  "reading": {
    "dialog": "Interpretación de la lectura",
    "kicker": "La lectura",
    "openTitle1": "Una lectura",
    "openTitle2": "abierta",
    "loading": "Las cartas se están leyendo",
    "unavailable": "No fue posible consultar el oráculo ahora.",
    "unavailableHint": "Tus cartas siguen aquí. Inténtalo de nuevo en unos instantes.",
    "section1": "Lo que muestran las cartas",
    "section2": "Lo que actúa detrás",
    "section3": "El consejo",
    "cards": "Las cartas",
    "inspectHint": "Haz clic en cualquier carta para verla",
    "viewCard": "Ver carta",
    "cardAdvice": "Consejo de la carta:",
    "balance": "Equilibrio elemental de la tirada",
    "majors": {
      "one": "{count} Arcano Mayor",
      "other": "{count} Arcanos Mayores"
    },
    "fire": "{count} Fuego / Bastos (Acción y pasión)",
    "water": "{count} Agua / Copas (Corazón e intuición)",
    "air": "{count} Aire / Espadas (Mente y verdad)",
    "earth": "{count} Tierra / Oros (Materia y práctica)",
    "copy": "Copiar texto",
    "copiedText": "¡Copiada!",
    "shareTitle": "Compartir la lectura en WhatsApp u otras apps",
    "share": "Compartir",
    "imageTitle": "Crear una imagen de la lectura en formato Stories",
    "image": "Crear imagen",
    "imageWorking": "Creando…",
    "imageSaved": "¡Imagen guardada!",
    "imageFailed": "Inténtalo de nuevo",
    "save": "Guardar en el diario",
    "saved": "¡Guardado!",
    "saveFailed": "No se pudo guardar. Inténtalo de nuevo.",
    "newSpread": "Nueva tirada",
    "finish": "Terminar lectura",
    "text": {
      "header": "🔮 LUMINA TAROT · LECTURA",
      "spread": "Tirada: {name}",
      "question": "Pregunta: «{question}»",
      "date": "Fecha: {date}",
      "light": "Luz",
      "advice": "Consejo",
      "synthesis": "🌌 LA LECTURA DEL ORÁCULO:"
    }
  },
  "spreads": {
    "navLabel": "Tipos de tirada",
    "prev": "Tiradas anteriores",
    "next": "Más tiradas",
    "freeCount": "Número de cartas",
    "freeHint": "Sin posiciones fijas. Puedes ampliar la lectura hasta 10 cartas sin perder las ya sacadas."
  },
  "area": {
    "label": "Mesa de lectura",
    "crossed": "Cruzada",
    "removeCrossed": "Quitar carta cruzada",
    "cross": "2. Cruzar",
    "crossTitle": "La cruz · presente y circunstancias",
    "staffTitle": "El bastón · el camino",
    "apex": "Vértice: Resultado",
    "progress": "{filled} de {total} cartas en la mesa",
    "clearTitle": "Recoger las cartas de la mesa",
    "clear": "Recoger",
    "mobileGuidance": "Desliza la mesa para explorar todas las posiciones. Toca una carta revelada para ampliarla.",
    "celticTitle": "Las diez posiciones",
    "celticHint": "El mapa de arriba conserva la cruz y el bastón. Explora cada posición abajo; toca una carta para ampliarla o usa × para quitarla.",
    "read": "Leer las cartas",
    "complete": {
      "one": "La carta está en la mesa.",
      "other": "Las {count} cartas están en la mesa."
    }
  },
  "slot": {
    "crossing": "Cruce",
    "details": "Ver detalles",
    "remove": "Quitar {name} de la posición {position}",
    "removeTitle": "Quitar carta de la posición",
    "focal": "Carta focal",
    "position": "Posición {position}",
    "choose": "Elige de la baraja"
  },
  "deck": {
    "label": "Selección de cartas",
    "count": "{available} de {total}",
    "switchToLenormandTitle": "Cambiar a la baraja Lenormand (Petit Lenormand)",
    "switchToTarotTitle": "Cambiar al Tarot tradicional (78 cartas)",
    "useLenormand": "Usar la baraja Lenormand",
    "useTarot": "Usar el Tarot",
    "layoutLabel": "Disposición de la baraja",
    "classic": "Clásica",
    "row": "Fila única",
    "rowTitle": "Una fila que se baraja con cada carta sacada",
    "classicTitle": "Distribuir las cartas en varias filas",
    "shufflingStatus": "Barajando las cartas…",
    "pickRow": {
      "one": "Saca de la fila. Falta una carta.",
      "other": "Saca de la fila. Faltan {count} cartas."
    },
    "pick": {
      "one": "Elige una carta más.",
      "other": "Elige {count} cartas más."
    },
    "full": "La mesa está completa.",
    "shuffling": "Barajando",
    "shuffle": "Barajar",
    "random": "Sacar al azar",
    "search": "Buscar carta por nombre",
    "searchPlaceholder": "Buscar carta por nombre…",
    "none": "Ninguna carta coincide con los filtros seleccionados.",
    "filter": {
      "all": "Todas",
      "major": "Mayores",
      "wands": "Bastos",
      "cups": "Copas",
      "swords": "Espadas",
      "pentacles": "Oros"
    }
  },
  "fan": {
    "guideMobile": "Toca o arrastra para destacar una carta. Luego toca Confirmar carta.",
    "guideDesktop": "Explora el abanico con el ratón y haz clic para sacar. En el móvil, arrastra para explorar y toca la carta destacada para confirmar.",
    "label": "Baraja en abanico",
    "drawAria": "Sacar la carta {index} de {total} del abanico",
    "reshuffling": "Reorganizando el abanico…",
    "position": "Carta {index} de {total}",
    "count": "{count} cartas en el abanico",
    "reshufflingShort": "Reorganizando…",
    "confirm": "Confirmar carta",
    "keyboard": "Teclado: ← → para explorar · Inicio / Fin para ir a los extremos · Intro para sacar"
  },
  "safety": {
    "crisis": "En España puedes llamar al 024; en México, a la Línea de la Vida, 800 911 2000. En otros países, findahelpline.com reúne líneas gratuitas, o acude a los servicios de emergencia locales.",
    "yn": {
      "answer": "El Tarot no hace lecturas sobre la muerte ni la autodestrucción. Tu vida tiene valor y no tienes que afrontar este dolor a solas.",
      "tip": "Por favor, busca ayuda humana de inmediato. {crisis}"
    },
    "ynNecro": {
      "answer": "El Tarot es un espejo de orientación y autoconocimiento para los vivos, no una herramienta para contactar con los muertos.",
      "tip": "Honra la memoria y el amor de quien partió cuidando tu propia sanación emocional, tu duelo y el momento presente."
    },
    "read": {
      "diagnosis": "Lumina Tarot está dedicado a la vida, al autoconocimiento y a la esperanza. No hacemos lecturas sobre autodestrucción, muerte o ideas suicidas. Este momento puede traer un dolor inmenso, pero no tienes que cargarlo a solas.",
      "dynamics": "Los momentos de oscuridad y desamparo piden acogida humana real, escucha atenta y apoyo profesional. Hay caminos de alivio cuando dejamos que personas preparadas nos tiendan la mano.",
      "advice": "Por favor, busca ayuda humana de inmediato. {crisis}"
    },
    "necro": {
      "diagnosis": "El Tarot es un espejo de reflexión para los vivos. No funciona como canal mediúmnico para comunicarse con quienes ya fallecieron.",
      "dynamics": "El vínculo con quien partió sigue vivo en la memoria, el legado y el amor compartido. El simbolismo de las cartas te invita a acoger el duelo y cuidar tus emociones en el presente.",
      "advice": "Dirige tu energía hacia tu propia sanación y paz. Honra la memoria de quien partió viviendo con dignidad y amor aquí y ahora."
    }
  }
};
