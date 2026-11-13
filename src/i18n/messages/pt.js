// Português (idioma de origem). Interface texts by key; plural entries have `one` and `other`.
// Placeholders like {name} are filled by t(key, vars) in src/i18n/index.js.
export default {
  "common": {
    "close": "Fechar",
    "retry": "Tentar novamente",
    "privacy": "Privacidade",
    "copied": "Copiado!",
    "yes": "Sim",
    "no": "Não",
    "tarot": "Tarot",
    "lenormand": "Baralho Cigano",
    "tagline": "Tarot & Baralho Cigano",
    "reversed": "Invertida",
    "reversedShort": "inv.",
    "viewDetails": "Ver detalhes de {name}",
    "card": {
      "one": "carta",
      "other": "cartas"
    },
    "cardCount": {
      "one": "{count} carta",
      "other": "{count} cartas"
    },
    "majorArcana": "Arcano Maior {roman}",
    "lenormandCard": "Baralho Cigano · Carta {number}",
    "disclaimer": "Leitura simbólica para reflexão. Não substitui orientação médica, psicológica, jurídica ou financeira.",
    "language": "Idioma"
  },
  "entry": {
    "description": "Sua jornada começa com uma pergunta e uma escolha.",
    "enter": "Entrar no Santuário",
    "preparing": "Preparando o santuário",
    "status": {
      "cards": "Preparando as cartas",
      "shuffle": "Embaralhando",
      "almost": "Quase lá",
      "ready": "Pronto"
    },
    "figure": "FIG. XVII — O ORÁCULO",
    "footer": "UM INSTANTE DE SILÊNCIO. UMA NOVA PERSPECTIVA."
  },
  "header": {
    "menu": "Menu",
    "yesNo": "Sim ou Não",
    "journal": "Diário"
  },
  "opening": {
    "chapter": "A pergunta",
    "title1": "Sobre o que",
    "title2": "deseja refletir?",
    "label": "Sua pergunta",
    "optional": "opcional",
    "placeholder": "Escreva com suas palavras",
    "clear": "Apagar",
    "hint": "Sem pergunta, as cartas oferecem uma leitura aberta do momento."
  },
  "menu": {
    "kicker": "Índice",
    "navLabel": "Consultas e ferramentas",
    "yesNoNote": "Uma carta para uma pergunta direta",
    "daily": "Carta do dia",
    "dailyNote": "Um arcano para acompanhar o dia",
    "grimoire": "Grimório",
    "grimoireNote": "O significado de cada carta",
    "journalNote": "Suas leituras guardadas",
    "journalCount": {
      "one": "{count} leitura guardada",
      "other": "{count} leituras guardadas"
    },
    "guide": "Como ler",
    "guideNote": "O método, passo a passo",
    "themes": "Atmosferas",
    "themesNote": "A cor do altar",
    "table3d": "Mesa 3D",
    "table3dNote": "Uma mesa livre para dispor as cartas",
    "preferences": "Preferências",
    "reversed": "Cartas invertidas",
    "reversedNA": "Indisponível no Cigano",
    "sound": "Efeitos sonoros",
    "on": "Ligados",
    "off": "Desligados",
    "footer": "Leituras simbólicas, para reflexão.",
    "language": "Idioma"
  },
  "table": {
    "skip": "Ir para a mesa de leitura",
    "chapterSpread": "A tiragem",
    "chapterTable": "A mesa",
    "chapterDeck": "O baralho",
    "footerText": "Tarot e Baralho Cigano, para reflexão. As leituras são simbólicas e não substituem orientação médica, psicológica, jurídica ou financeira.",
    "shortcuts": "Atalhos: Espaço embaralha, D tira ao acaso, G grimório, H diário, Esc fecha",
    "deckDialogTitle": "Trocar para {name}?",
    "deckDialogText": "As cartas na mesa serão recolhidas. Leituras salvas no diário serão preservadas.",
    "deckDialogCancel": "Continuar leitura",
    "deckDialogConfirm": "Trocar baralho"
  },
  "dock": {
    "label": "Navegação rápida",
    "table": "Mesa",
    "random": "Ao acaso",
    "more": "Mais",
    "sheetLabel": "Mais consultas e preferências",
    "closeSheet": "Fechar ferramentas",
    "sheetText": "Outras consultas e preferências.",
    "yesNoNote": "Uma carta para sua pergunta",
    "journal": "Diário de leituras",
    "journalNote": "Revisite suas reflexões",
    "themesNote": "Escolha a atmosfera da sua mesa"
  },
  "journal": {
    "dialog": "Diário de leituras",
    "title": "Diário",
    "tabReadings": "Leituras ({count})",
    "tabStats": "Estatísticas",
    "search": "Buscar no diário",
    "searchPlaceholder": "Pesquisar por carta, pergunta, tiragem ou notas...",
    "exportAria": "Exportar diário",
    "exportTitle": "Baixar todas as leituras em um arquivo JSON",
    "export": "Exportar",
    "importAria": "Importar backup do diário",
    "importTitle": "Restaurar leituras de um backup JSON",
    "import": "Importar",
    "localNote": "Suas leituras ficam só neste navegador. Exporte um backup para guardá-las ou levá-las a outro aparelho.",
    "exported": {
      "one": "Backup com {count} leitura baixado.",
      "other": "Backup com {count} leituras baixado."
    },
    "tooBig": "O arquivo é grande demais para um backup do diário (máx. 5 MB).",
    "restored": {
      "one": "{count} leitura restaurada",
      "other": "{count} leituras restauradas"
    },
    "ignored": {
      "one": "{count} já existente ou inválida ignorada",
      "other": "{count} já existentes ou inválidas ignoradas"
    },
    "dropped": {
      "one": "{count} mais antiga ficou de fora pelo limite de 100",
      "other": "{count} mais antigas ficaram de fora pelo limite de 100"
    },
    "readFailed": "Não foi possível ler o backup.",
    "notJson": "O arquivo não é um JSON válido.",
    "notBackup": "Este arquivo não é um backup do diário do Lumina.",
    "newer": "Este backup foi criado por uma versão mais nova do Lumina.",
    "empty": "Nenhuma leitura guardada ainda.",
    "emptyHint": "Use \"Salvar no Diário\" ao fim de uma leitura para revê-la aqui.",
    "noMatch": "Nenhuma leitura encontrada para a busca informada.",
    "delete": "Excluir leitura",
    "oracle": "A leitura do oráculo:",
    "diagnosis": "🌌 Diagnóstico:",
    "dynamics": "🔮 Forças ocultas:",
    "advice": "🗝️ Conselho:",
    "notes": "Anotações pessoais:",
    "edit": "Editar",
    "addNote": "Adicionar nota",
    "notePlaceholder": "Digite suas percepções, sentimentos ou insights sobre esta tiragem...",
    "save": "Salvar",
    "noNotes": "Nenhuma anotação inserida.",
    "statReadings": "Tiragens realizadas",
    "statCards": "Cartas",
    "statMajors": "Arcanos Maiores",
    "statGuide": "Arcano mais presente",
    "lenormandNote": "Baralho Cigano: {count} cartas no histórico. As demais categorias representam o Tarot.",
    "top": "Suas 5 cartas mais frequentes",
    "topEmpty": "Faça tiragens na mesa para traçar seu mapa de arquétipos.",
    "lenormandShort": "Cigano",
    "balance": "Balanço elemental da sua jornada",
    "fire": "Fogo / Paus (Ação & Vontade)",
    "water": "Água / Copas (Emoções & Intuição)",
    "air": "Ar / Espadas (Mente & Verdade)",
    "earth": "Terra / Ouros (Matéria & Realização)"
  },
  "image": {
    "advice": "CONSELHO DO ORÁCULO",
    "fileName": "lumina-leitura",
    "shareText": "Minha leitura no Lumina Tarot · luminatarot.app"
  },
  "yesno": {
    "interpreting": "Interpretando {name} para a sua dúvida",
    "dialog": "Oráculo sim ou não",
    "kicker": "Uma carta, uma resposta",
    "title": "Sim ou Não",
    "intro": "Faça sua pergunta e explore uma orientação simbólica com conselhos práticos. O resultado não é uma certeza sobre os fatos.",
    "inputLabel": "Pergunta para o oráculo sim ou não",
    "placeholder": "Mentalize ou digite sua pergunta objetiva...",
    "suggestions": "Sugestões",
    "s1": "Devo tomar essa iniciativa agora?",
    "s2": "É uma oportunidade favorável?",
    "s3": "Esse projeto vai dar certo?",
    "s4": "Devo ter cautela e esperar?",
    "s5": "Essa pessoa é sincera comigo?",
    "drawing": "Embaralhando",
    "draw": "Tirar a carta",
    "loading": "Sintonizando a energia das cartas...",
    "unavailableHint": "O arcano {name} continua reservado para a sua pergunta. Tente de novo em alguns instantes.",
    "another": "Outra pergunta",
    "yourQuestion": "Sua Pergunta:",
    "cardTitle": "Clique para ver detalhes do Arcano",
    "answer": "Resposta Direta do Oráculo:",
    "tip": "Dica Prática / Condição:",
    "copy": "Copiar Resposta",
    "done": "Concluir",
    "positionName": "Oráculo do Sim ou Não",
    "positionMeaning": "Resposta direta e conselho",
    "text": {
      "header": "🔮 LUMINA TAROT · SIM OU NÃO",
      "question": "Pergunta: \"{question}\"",
      "card": "Carta: {name}",
      "verdict": "Veredito: {verdict}",
      "answer": "Resposta: {answer}",
      "tip": "💡 Dica: {tip}"
    }
  },
  "card": {
    "artUnavailableFor": "Arte de {name} indisponível",
    "artUnavailable": "Arte indisponível",
    "fallbackName": "Carta"
  },
  "daily": {
    "dialog": "Carta do dia",
    "title": "Carta do dia",
    "subtitle": "Um arcano para acompanhar o seu dia.",
    "streak": {
      "one": "{count} dia seguido",
      "other": "{count} dias seguidos"
    },
    "cardTitle": "Clique para ver detalhes completos",
    "focus": "Foco e Energia do Dia:",
    "advice": "Conselho Prático para Hoje:",
    "notifyUnsupported": "Notificações não são suportadas neste navegador.",
    "notifyOn": "Lembrete diário ativado com sucesso!",
    "notifyTitle": "Lumina · Carta do dia",
    "notifyBody": "Sua carta do dia está esperando por você.",
    "notifyDenied": "Permissão para notificações foi recusada.",
    "reminderOn": "Lembrete diário ativado",
    "remind": "Lembrar todos os dias"
  },
  "grimoire": {
    "dialog": "Grimório",
    "title": "Grimório · {count} cartas",
    "subtitle": "Significados, correspondências e símbolos de cada carta",
    "all": "Todas as {count}",
    "major": "22 Maiores",
    "wands": "Paus (Fogo)",
    "cups": "Copas (Água)",
    "swords": "Espadas (Ar)",
    "pentacles": "Ouros (Terra)",
    "search": "Buscar no grimório",
    "searchPlaceholder": "Buscar por nome, arquétipo ou palavra-chave...",
    "inspect": "Clique para inspecionar"
  },
  "guide": {
    "dialog": "Guia de leitura",
    "title": "Como ler",
    "intro": "O Tarot é um espelho simbólico. Formule a pergunta com calma e escolha as cartas sem pressa: a leitura é um convite à reflexão, não uma previsão.",
    "lenormandTitle": "Baralho Cigano · Petit Lenormand",
    "lenormandText": "Selecione o baralho antes da tiragem. Suas 36 cartas usam símbolos cotidianos e são lidas sem inversões. Na linha de três cartas, leia também os pares vizinhos como uma sequência; na carta única, use o símbolo como foco de reflexão. A Torre representa estruturas e autonomia; a Lua, emoção e reconhecimento. Seus significados diferem do Tarot. Aqui, Sim ou Não é uma adaptação simbólica, não uma probabilidade.",
    "q": {
      "title": "1. Como formular sua pergunta",
      "text": "Prefira perguntas abertas que convidem à reflexão:",
      "ex1": "\"Quais energias devo cultivar para resolver este impasse?\"",
      "or": "ou",
      "ex2": "\"O que preciso compreender sobre esta fase?\""
    },
    "s": {
      "title": "2. A estrutura das 78 cartas",
      "major": "22 Arcanos Maiores:",
      "majorText": "Grandes lições, marcos espirituais e transformações profundas de vida.",
      "wands": "14 de Paus (Fogo):",
      "wandsText": "Vontade, energia criativa, paixão, trabalho e novos projetos.",
      "cups": "14 de Copas (Água):",
      "cupsText": "Emoções, amor, intuição, família e relacionamentos.",
      "swords": "14 de Espadas (Ar):",
      "swordsText": "Clareza mental, desafios, verdade, justiça e decisões intelectuais.",
      "pentacles": "14 de Ouros (Terra):",
      "pentaclesText": "Prosperidade material, finanças, saúde física e paciência na colheita."
    },
    "t": {
      "title": "3. A tiragem de 3 cartas (padrão)",
      "a": "Na leitura de 3 cartas, a primeira representa as",
      "b": "raízes e causas passadas",
      "c": "; a segunda o",
      "d": "momento presente e suas forças ativas",
      "e": "; e a terceira a",
      "f": "tendência futura e conselho de ação"
    },
    "done": "Entendi, voltar à mesa"
  },
  "themes": {
    "dialog": "Temas",
    "title": "Atmosferas",
    "subtitle": "O tom de fundo da mesa.",
    "apply": "Aplicar",
    "cosmic": "Tinta e ouro champanhe",
    "lunar": "Azul de meia-noite e prata",
    "solar": "Âmbar escuro e latão",
    "crimson": "Vinho profundo e marfim",
    "ivoire": "Marfim, tinta e ouro velho"
  },
  "detail": {
    "dialog": "Detalhes de {name}",
    "close": "Fechar detalhes da carta",
    "position": "Posição: {name}",
    "reversed": "Carta invertida",
    "influence": "Influência na posição ({name})",
    "light": "Luz & Potencial Positivo:",
    "shadowReversed": "⚡ Manifestação invertida (sombra e bloqueio ativo):",
    "shadow": "Sombra & Ponto de Atenção:",
    "advice": "Conselho do Oráculo:"
  },
  "confirm": {
    "dialog": "Trocar tiragem",
    "cancelAria": "Cancelar troca de tiragem",
    "title": "Alterar tipo de tiragem",
    "text": "As cartas da mesa serão recolhidas e o baralho, embaralhado de novo. Deseja continuar?",
    "keep": "Manter mesa atual",
    "ok": "Confirmar mudança"
  },
  "ritual": {
    "dialog": "Cartas tiradas ao acaso",
    "cancel": "Cancelar",
    "skip": "Pular",
    "kicker": "O ORÁCULO ESCOLHEU",
    "done": "O destino respondeu.",
    "aligning": "Alinhando as cartas…",
    "chosen": {
      "one": "{count} carta escolhida para “{spread}”",
      "other": "{count} cartas escolhidas para “{spread}”"
    },
    "toTable": "Levar à mesa"
  },
  "shuffle": {
    "cut": "Cortando o baralho...",
    "riffle": "Embaralhando",
    "fan": "Alinhando as cartas...",
    "ready": "Pronto",
    "sr": "Baralho embaralhado"
  },
  "deckSel": {
    "label": "Escolha do baralho",
    "eyebrow": "SEU ORÁCULO",
    "title": "Qual baralho guia sua leitura?",
    "hintLenormand": "Leia os símbolos em conjunto, da esquerda para a direita. Neste baralho, as cartas são sempre diretas.",
    "hintTarot": "Explore os arquétipos do Tarot. Escolha uma tiragem e, se desejar, ative as cartas invertidas.",
    "switchTitle": "Trocar para {name}?",
    "switchText": "As cartas na mesa serão recolhidas. Leituras salvas no diário serão preservadas.",
    "keep": "Continuar leitura",
    "switch": "Trocar baralho",
    "tarotSubtitle": "78 cartas · Arcanos maiores e menores",
    "lenormandSubtitle": "36 cartas · Petit Lenormand"
  },
  "error": {
    "title": "Algo saiu do lugar",
    "text": "Um erro interrompeu a mesa. Não se preocupe: seu diário e suas leituras salvas continuam guardados.",
    "reload": "Recarregar a mesa",
    "reset": "Recomeçar",
    "details": "Detalhes técnicos"
  },
  "oracle": {
    "fill": {
      "advice2": "O conselho principal é manter a calma, ser honesto com você mesmo e não tomar decisões por impulso.",
      "dynamics1": "A situação atual pede paciência para enxergar as coisas com mais clareza.",
      "advice1": "Dê um passo de cada vez e confie na sua intuição.",
      "dynamics": "A situação atual pede calma e observação atenta.",
      "advice": "Mantenha os pés no chão e faça escolhas conscientes.",
      "ynAnswer": "As cartas mostram um movimento direto para a sua questão.",
      "ynTip": "Mantenha a firmeza nas suas decisões e observe os detalhes práticos."
    },
    "fb": {
      "lenormandIntro": "Leitura simbólica de Petit Lenormand: {cards}",
      "lenormandPair": "{a} + {b}: observe como {x} se relaciona com {y}.",
      "lenormandSingle": "Uma carta oferece um foco de reflexão; combinações ampliam o contexto.",
      "lenormandAdvice": "{advice} Use esta leitura como reflexão, sem tratá-la como previsão garantida.",
      "qReversed": "Para a sua consulta (\"{question}\"): {name} ({reversed}) indica entraves e falta de transparência no momento. A carta alerta para {shadow}.",
      "q": "Para a sua consulta (\"{question}\"): {name} traz a energia de {light}. As cartas indicam que os acontecimentos estão ligados a esse movimento.",
      "reversed": "{name} ({reversed}) aponta um momento de atenção no seu caminho. A energia atual reflete {shadow}.",
      "plain": "{name} destaca que o seu momento atual é movido por {light}.",
      "shadow": "Por trás desse cenário, {name} revela o ponto de maior atenção: {meaning}. Junto com {middle}, isso mostra a necessidade de analisar os detalhes antes de agir.",
      "pair": "Na dinâmica das cartas, {first} e {middle} atuam juntas. Enquanto a primeira define o tom da situação, {middle} reforça a importância de focar em {light}.",
      "advice": "Orientação prática de {name}: {advice}. Analise a situação com discernimento e decida com base nos fatos concretos.",
      "defaultLight": "recomeço e clareza",
      "defaultShadow": "dúvidas e bloqueios",
      "defaultMiddle": "estabilidade e ação",
      "defaultShadowMeaning": "desafios práticos",
      "defaultAdvice": "Aja com firmeza, clareza e pés no chão"
    }
  },
  "yn": {
    "v": {
      "facts": "BUSQUE ORIENTAÇÃO BASEADA EM FATOS",
      "maybe": "TALVEZ",
      "condYes": "SIM, COM CONDIÇÃO",
      "noAlert": "NÃO / ALERTA",
      "depends": "DEPENDE DE VOCÊ",
      "noBlock": "NÃO / BLOQUEIO",
      "yesCourage": "SIM, COM CORAGEM",
      "yesSure": "SIM CONVICTO",
      "yes": "SIM",
      "yesSecret": "SIM, COM SIGILO",
      "notNow": "NÃO POR AGORA",
      "pause": "PAUSA / TALVEZ",
      "noCaution": "NÃO / CAUTELA",
      "yesClarity": "SIM, COM CLAREZA",
      "noTension": "NÃO / TENSÃO",
      "dependsReason": "DEPENDE DA RAZÃO",
      "yesEffort": "SIM, COM ESFORÇO",
      "yesEnergy": "SIM ENÉRGICO",
      "noDisillusion": "NÃO / DESILUSÃO",
      "yesHeart": "SIM AFETIVO",
      "noScarcity": "NÃO / ESCASSEZ",
      "yesPatience": "SIM, COM PACIÊNCIA",
      "yesSolid": "SIM CONCRETO",
      "support": "BUSQUE APOIO PROFISSIONAL",
      "self": "FOCO NO AUTOCONHECIMENTO"
    },
    "none": {
      "summary": "O momento pede reflexão e observação antes de qualquer definição.",
      "tip": "Depende de você analisar os fatos com calma e não se precipitar."
    },
    "lenormand": {
      "summary": "Como reflexão simbólica: {light}"
    },
    "revGood": {
      "summary": "A essência de {name} permanece favorável, mas a inversão alerta para atrasos ou falta de alinhamento.",
      "tip": "Sim, mas depende de você ajustar o foco, ter paciência e não forçar os acontecimentos antes da hora."
    },
    "revHeavy": {
      "summary": "A energia invertida de {name} aponta para apegos, ilusões ou risco de frustração se insistir agora.",
      "tip": "Não, a não ser que você faça uma limpeza profunda e rompa de vez com velhos padrões."
    },
    "revDefault": {
      "summary": "A inversão de {name} indica resistências internas, falta de clareza ou momento inoportuno.",
      "tip": "Não no momento. A não ser que você reveja suas premissas e mude de estratégia radicalmente."
    },
    "fool": {
      "summary": "Os caminhos estão abertos para o novo e a energia é de liberdade e recomeço.",
      "tip": "Sim, mas depende de você dar o primeiro passo sem medo, cuidando para não ser imprudente com os detalhes práticos."
    },
    "sun": {
      "summary": "Clareza total, sucesso, vitalidade e verdade absoluta a seu favor.",
      "tip": "Sim! Seja autêntico, aja com transparência e aproveite o momento favorável com confiança."
    },
    "world": {
      "summary": "Ciclo favorável de realização, coroação e expansão plena.",
      "tip": "Sim! Conclua o que começou e confie na plenitude dos seus resultados."
    },
    "majorYes": {
      "summary": "A energia de {name} favorece diretamente a sua intenção e impulsiona seu caminho.",
      "tipAdvice": "Sim, mas lembre-se: {advice}",
      "tip": "Sim, mas depende de você manter a constância e agir com firmeza."
    },
    "justice": {
      "summary": "O desfecho será a consequência exata das suas escolhas e do seu senso ético.",
      "tip": "Depende de você agir com total retidão, analisar contratos ou acordos e ser 100% justo."
    },
    "priestess": {
      "summary": "As respostas estão se maturando no oculto; a intuição aponta para uma direção favorável.",
      "tip": "Sim, mas depende de você guardar segredo sobre seus planos e confiar mais no seu pressentimento."
    },
    "hermit": {
      "summary": "O momento pede pausa, reflexão solitária e prudência antes de qualquer avanço público.",
      "tip": "Não de imediato. Depende de você amadurecer a ideia sozinho antes de tomar a decisão final."
    },
    "hanged": {
      "summary": "Há um compasso de espera necessário para mudar a sua perspectiva sobre o assunto.",
      "tip": "Depende de você abrir mão da teimosia e enxergar a situação por outro ângulo."
    },
    "majorNo": {
      "summary": "A energia de {name} avisa sobre riscos, desilusões, rompimentos ou conflitos ocultos.",
      "tip": "Não, a não ser que você esteja disposto a enfrentar verdades duras e mudar tudo do zero."
    },
    "swordsYes": {
      "summary": "A lucidez mental, a verdade e a razão apontam para uma resolução favorável.",
      "tip": "Sim, mas depende de você ter uma conversa honesta e não alimentar meias-palavras."
    },
    "swordsNo": {
      "summary": "O cenário aponta para desgastes, desconfiança, frustração ou excesso de preocupação.",
      "tip": "Não. A não ser que você se proteja de influências tóxicas e evite agir no calor da emoção."
    },
    "swordsMaybe": {
      "summary": "A resposta exige estratégia, equilíbrio emocional e análise lógica da realidade.",
      "tip": "Depende de você decidir com a cabeça, cortando dúvidas que estão te paralisando."
    },
    "wandsEffort": {
      "summary": "Há potencial positivo, porém acompanhado de sobrecarga, concorrência ou cansaço.",
      "tip": "Sim, mas depende de você delegar tarefas e não carregar o peso do mundo nas costas."
    },
    "wandsYes": {
      "summary": "Entusiasmo, motivação e movimento direto aceleram os acontecimentos a seu favor.",
      "tip": "Sim! Tome a iniciativa agora e não deixe a chama da sua motivação esfriar."
    },
    "cupsNo": {
      "summary": "Expectativas irreais, apego ao passado ou ilusões emocionais estão bloqueando o fluxo.",
      "tip": "Não por enquanto. A não ser que você supere as frustrações antigas e encare a realidade como ela é."
    },
    "cupsYes": {
      "summary": "Harmonia nos sentimentos, acolhimento sincero e sintonia positiva para o seu pedido.",
      "tip": "Sim, mas depende de você expressar o que sente com sinceridade e empatia."
    },
    "pentNo": {
      "summary": "Sensação de desamparo, aperto financeiro ou falta de apoio no momento.",
      "tip": "Não neste instante. A não ser que você busque ajuda e reestruture suas bases materiais primeiro."
    },
    "pentPatience": {
      "summary": "A semente foi plantada com segurança, mas o resultado precisa de tempo para amadurecer.",
      "tip": "Sim, mas depende de você ter paciência para colher no tempo certo, sem tentar apressar o ritmo natural."
    },
    "pentYes": {
      "summary": "Estabilidade, ganho prático e solo firme para a concretização dos seus planos.",
      "tip": "Sim! Mantenha a disciplina, organize seus recursos e avance com pés no chão."
    },
    "default": {
      "summary": "As correntes energéticas sopram favoravelmente para a sua questão.",
      "tip": "Sim, mas depende de você manter a dedicação e focar nas suas metas."
    },
    "offline": {
      "withQuestion": "Para a sua dúvida (\"{question}\"): {name} indica {summary}",
      "noQuestion": "{name} mostra que {summary}",
      "revealed": "a carta revelada"
    }
  },
  "meta": {
    "title": "Lumina Tarot • Santuário dos Arcanos",
    "description": "Oráculo e mesa virtual de leitura de Tarot com 78 cartas clássicas, tiragens guiadas, Mesa 3D, diário de leituras e interpretações personalizadas para a sua pergunta."
  },
  "reading": {
    "dialog": "Interpretação da leitura",
    "kicker": "A leitura",
    "openTitle1": "Uma leitura",
    "openTitle2": "aberta",
    "loading": "As cartas estão sendo lidas",
    "unavailable": "Não foi possível consultar o oráculo agora.",
    "unavailableHint": "Suas cartas continuam aqui. Tente de novo em alguns instantes.",
    "section1": "O que as cartas mostram",
    "section2": "O que age por trás",
    "section3": "O conselho",
    "cards": "As cartas",
    "inspectHint": "Clique em qualquer carta para inspecionar",
    "viewCard": "Ver carta",
    "cardAdvice": "Conselho da carta:",
    "balance": "Balanço Elemental da Tiragem",
    "majors": {
      "one": "{count} Arcano Maior",
      "other": "{count} Arcanos Maiores"
    },
    "fire": "{count} Fogo / Paus (Ação & Paixão)",
    "water": "{count} Água / Copas (Coração & Intuição)",
    "air": "{count} Ar / Espadas (Mente & Verdade)",
    "earth": "{count} Terra / Ouros (Matéria & Prática)",
    "copy": "Copiar Texto",
    "copiedText": "Copiada!",
    "shareTitle": "Compartilhar leitura no WhatsApp ou outros aplicativos",
    "share": "Compartilhar",
    "imageTitle": "Gerar uma imagem da leitura no formato dos Stories",
    "image": "Gerar Imagem",
    "imageWorking": "Gerando...",
    "imageSaved": "Imagem salva!",
    "imageFailed": "Tente de novo",
    "save": "Salvar no Diário",
    "saved": "Salvo!",
    "saveFailed": "Falha ao salvar. Tente novamente.",
    "newSpread": "Nova Tiragem",
    "finish": "Concluir Leitura",
    "text": {
      "header": "🔮 LUMINA TAROT · LEITURA",
      "spread": "Tiragem: {name}",
      "question": "Pergunta: \"{question}\"",
      "date": "Data: {date}",
      "light": "Luz",
      "advice": "Conselho",
      "synthesis": "🌌 A LEITURA DO ORÁCULO:"
    }
  },
  "spreads": {
    "navLabel": "Tipos de tiragem",
    "prev": "Ver tiragens anteriores",
    "next": "Ver mais tiragens",
    "freeCount": "Quantidade de cartas",
    "freeHint": "Sem posições fixas. Você pode ampliar a leitura até 10 cartas sem perder as já tiradas."
  },
  "area": {
    "label": "Mesa de leitura",
    "crossed": "Cruzada",
    "removeCrossed": "Remover carta cruzada",
    "cross": "2. Cruzar",
    "crossTitle": "A cruz · presente e circunstâncias",
    "staffTitle": "O bastão · o caminho",
    "apex": "Vértice: Resultado",
    "progress": "{filled} de {total} cartas na mesa",
    "clearTitle": "Recolher as cartas da mesa",
    "clear": "Recolher",
    "mobileGuidance": "Deslize a mesa para explorar todas as posições. Toque nas cartas reveladas para ampliar.",
    "celticTitle": "As dez posições",
    "celticHint": "O mapa acima preserva a cruz e o bastão. Explore cada posição abaixo; toque em uma carta para ampliar ou use × para recolhê-la.",
    "read": "Ler as cartas",
    "complete": {
      "one": "A carta está na mesa.",
      "other": "As {count} cartas estão na mesa."
    }
  },
  "slot": {
    "crossing": "Cruzamento",
    "details": "Ver detalhes",
    "remove": "Remover {name} da posição {position}",
    "removeTitle": "Remover carta da posição",
    "focal": "Carta Focal",
    "position": "Posição {position}",
    "choose": "Escolha no baralho"
  },
  "deck": {
    "label": "Seleção de cartas",
    "count": "{available} de {total}",
    "switchToLenormandTitle": "Trocar para o Baralho Cigano (Petit Lenormand)",
    "switchToTarotTitle": "Trocar para o Tarot Tradicional (78 Cartas)",
    "useLenormand": "Usar o Baralho Cigano",
    "useTarot": "Usar o Tarot",
    "layoutLabel": "Disposição do baralho",
    "classic": "Clássica",
    "row": "Fileira única",
    "rowTitle": "Uma fileira que embaralha a cada carta puxada",
    "classicTitle": "Distribuir cartas em várias fileiras",
    "shufflingStatus": "Embaralhando as cartas...",
    "pickRow": {
      "one": "Puxe da fileira. Falta uma carta.",
      "other": "Puxe da fileira. Faltam {count} cartas."
    },
    "pick": {
      "one": "Escolha mais uma carta.",
      "other": "Escolha mais {count} cartas."
    },
    "full": "A mesa está completa.",
    "shuffling": "Embaralhando",
    "shuffle": "Embaralhar",
    "random": "Tirar ao acaso",
    "search": "Buscar carta por nome",
    "searchPlaceholder": "Buscar carta por nome...",
    "none": "Nenhuma carta encontrada para os filtros selecionados.",
    "filter": {
      "all": "Todas",
      "major": "Maiores",
      "wands": "Paus",
      "cups": "Copas",
      "swords": "Espadas",
      "pentacles": "Ouros"
    }
  },
  "fan": {
    "guideMobile": "Toque ou arraste para destacar uma carta. Depois, toque em Confirmar carta.",
    "guideDesktop": "Explore o leque com o mouse e clique para puxar. No celular, arraste para explorar e toque na carta destacada para confirmar.",
    "label": "Baralho em leque",
    "drawAria": "Puxar carta {index} de {total} do leque",
    "reshuffling": "Reorganizando o leque…",
    "position": "Carta {index} de {total}",
    "count": "{count} cartas no leque",
    "reshufflingShort": "Reorganizando…",
    "confirm": "Confirmar carta",
    "keyboard": "Teclado: ← → para explorar · Home / End para ir às pontas · Enter para puxar"
  },
  "safety": {
    "crisis": "No Brasil, ligue gratuitamente para o CVV no número 188 (24 horas) ou procure um serviço de emergência de saúde mental.",
    "yn": {
      "answer": "O Tarot não realiza leituras sobre morte ou autodestruição. Sua vida tem valor, e você não precisa enfrentar essa dor sozinho.",
      "tip": "Por favor, procure ajuda humana imediata. {crisis}"
    },
    "ynNecro": {
      "answer": "O Tarot é um espelho de orientação e autoconhecimento para os vivos, não uma ferramenta de contato com os mortos.",
      "tip": "Honre a memória e o amor de quem partiu, cuidando da sua própria cura emocional, do luto e do momento presente."
    },
    "read": {
      "diagnosis": "O Lumina Tarot é dedicado à preservação da vida, ao autoconhecimento e à esperança. Não fazemos leituras sobre autodestruição, morte ou ideação suicida. O momento pode estar trazendo uma dor imensa, mas você não precisa carregar esse sofrimento sozinho.",
      "dynamics": "Momentos de escuridão e desamparo pedem acolhimento humano real, escuta atenta e apoio profissional. Há caminhos de alívio quando permitimos que pessoas preparadas nos estendam a mão.",
      "advice": "Por favor, busque ajuda humana imediata. {crisis}"
    },
    "necro": {
      "diagnosis": "O Tarot é um espelho de reflexão para os vivos. Não funciona como canal mediúnico ou psicografia para se comunicar com quem já faleceu.",
      "dynamics": "O vínculo com quem partiu continua vivo na memória, no legado e no amor compartilhado. O simbolismo das cartas convida você a acolher o luto e cuidar das suas emoções no presente.",
      "advice": "Direcione sua energia para a sua própria cura e paz. Honre a memória de quem partiu vivendo com dignidade e amor no aqui e agora."
    }
  }
};
