
import { BotConfig, PluginType, AIBehavior, BotCommand, Nationality, AppLanguage } from "./types";

export const INITIAL_CONFIG: BotConfig = {
  id: 'bot-1',
  name: "SteveAI",
  pluginType: PluginType.PAPER, // Paper is the standard for high-performance servers
  behavior: AIBehavior.PROTECTOR,
  nationality: Nationality.AMERICAN,
  learningRate: 0.5, // Balanced default
  aggressiveness: 0.1, // Low default to prevent accidental PvP
  canChat: true,
  systemInstruction: "Prioritize equipment durability. Craft new tools before they break. Maintain a 3-block radius from the Creator.",
};

export const UI_TEXT = {
  en: {
    title: "Server-Side AI Plugin Generator",
    commands: "Command Dictionary",
    projectConfig: "Project Configuration",
    botProfiles: "Bot Profiles",
    addProfile: "Add Profile",
    profileName: "Profile Name",
    archetype: "Archetype",
    nationality: "Nationality (Mother Tongue)",
    nationalityDesc: "Defines the bot's primary language and cultural personality. All bots are polyglot.",
    targetPlatform: "Target Platform",
    neuralParams: "Neural Parameters",
    learningRate: "Learning Rate (Adaptability)",
    rigid: "Rigid",
    adaptive: "Adaptive",
    aggressiveness: "Aggressiveness",
    pacifist: "Pacifist",
    hostile: "Hostile",
    enableChat: "Enable Natural Language Chat",
    customInstructions: "Custom System Instructions",
    customInstructionsPlaceholder: "Example: Priority is to find Diamonds. Discard Cobblestone. Flee from Creepers immediately.",
    generateBtn: "Generate Plugin (All Profiles)",
    generating: "Generating Plugin Code...",
    generatedSource: "Generated Source",
    chatSimulator: "Chat Simulator",
    sandboxTitle: "Interactive Sandbox",
    sandboxDesc: "Test your bot's Personality and Language Skills in a safe environment before generating code.",
    noCode: "No code generated",
    configureMsg: "Configure your AI and click \"Generate Plugin\" to begin.",
    zip: "ZIP",
    copy: "Copy",
    copied: "Copied",
    inputPlaceholder: "Command",
    send: "Send",
    reset: "Reset Chat",
    downloadPdf: "PDF",
    closeDict: "Close Dictionary",
    dictIntro: "These commands allow the Creator to reprogram bots in real-time. Bots are polyglot and will detect your language.",
  },
  pt: {
    title: "Gerador de Plugins IA para Servidores",
    commands: "Dicionário de Comandos",
    projectConfig: "Configuração do Projeto",
    botProfiles: "Perfis de Bot",
    addProfile: "Adicionar Perfil",
    profileName: "Nome do Perfil",
    archetype: "Arquétipo",
    nationality: "Nacionalidade (Língua Mãe)",
    nationalityDesc: "Define a língua principal e personalidade cultural. Todos os bots são poliglotas.",
    targetPlatform: "Plataforma Alvo",
    neuralParams: "Parâmetros Neurais",
    learningRate: "Taxa de Aprendizado (Adaptabilidade)",
    rigid: "Rígido",
    adaptive: "Adaptável",
    aggressiveness: "Agressividade",
    pacifist: "Pacifista",
    hostile: "Hostil",
    enableChat: "Habilitar Chat em Linguagem Natural",
    customInstructions: "Instruções de Sistema Personalizadas",
    customInstructionsPlaceholder: "Exemplo: Prioridade é encontrar Diamantes. Descarte Pedregulho. Fuja de Creepers imediatamente.",
    generateBtn: "Gerar Plugin (Todos os Perfis)",
    generating: "Gerando Código do Plugin...",
    generatedSource: "Código Gerado",
    chatSimulator: "Simulador de Chat",
    sandboxTitle: "Sandbox Interativo",
    sandboxDesc: "Teste a personalidade e habilidades linguísticas do seu bot em um ambiente seguro antes de gerar o código.",
    noCode: "Nenhum código gerado",
    configureMsg: "Configure sua IA e clique em \"Gerar Plugin\" para começar.",
    zip: "ZIP",
    copy: "Copiar",
    copied: "Copiado",
    inputPlaceholder: "Comando",
    send: "Enviar",
    reset: "Reiniciar Chat",
    downloadPdf: "PDF",
    closeDict: "Fechar Dicionário",
    dictIntro: "Estes comandos permitem ao Criador reprogramar bots em tempo real. Bots são poliglotas e detectarão seu idioma.",
  }
};

export const BOT_COMMANDS: BotCommand[] = [
  // --- Management & Status ---
  {
    command: 'spawn_bot',
    description: 'Instantly spawns a new AI bot at your location.',
    usage: '!spawn_bot <name> <type>',
    example: '!spawn_bot GuardBot Protector'
  },
  { 
    command: 'identify', 
    description: 'Reports State, Health, Inventory, Learning Rate, Aggressiveness %, and current System Instructions in your preferred language.', 
    usage: '!identify [target]', 
    example: '!identify Explorer' 
  },
  {
    command: 'report',
    description: 'Detailed sitrep: Current Goal, Inventory Summary, and Detected Threats.',
    usage: '!report [target]',
    example: '!report all_aibots'
  },
  {
    command: 'group',
    description: 'Manage custom bot groups.',
    usage: '!group <add|remove> <group_name> [bot_name]',
    example: '!group add Miners SteveBot'
  },

  // --- Behavior & Configuration ---
  {
    command: 'language',
    description: 'Sets the preferred language for bot communication (e.g., en, pt-br, es). Bots will translate data outputs to this language.',
    usage: '!language <lang_code> [target]',
    example: '!language pt-br all_aibots'
  },
  {
    command: 'instruction',
    description: 'Overwrites the Custom System Instructions for the bot logic.',
    usage: '!instruction <text> [target]',
    example: '!instruction "Prioritize mining diamonds and ignore iron." MinerBot'
  },
  { 
    command: 'mode', 
    description: 'Reprograms the bot behavior archetype.', 
    usage: '!mode <protector|explorer|builder|miner|farmer> [target]', 
    example: '!mode miner SteveBot' 
  },
  {
    command: 'learning_rate',
    description: 'Adjusts the AI adaptability percentage (0.0 to 1.0).',
    usage: '!learning_rate <0.0-1.0> [target]',
    example: '!learning_rate 0.8 SteveBot'
  },
  {
    command: 'aggressiveness',
    description: 'Sets the specific aggression probability percentage (0.0 to 1.0).',
    usage: '!aggressiveness <0.0-1.0> [target]',
    example: '!aggressiveness 0.95 all_aibots'
  },
  { 
    command: 'security_level', 
    description: 'Sets threat level presets (0=Safe, 1=Defensive, 2=Aggressive).', 
    usage: '!security <0-2> [target]', 
    example: '!security 2 SecurityTeam' 
  },

  // --- Movement & Safety ---
  { 
    command: 'follow', 
    description: 'Forces the bot to follow the creator.', 
    usage: '!follow [target]', 
    example: '!follow Protector' 
  },
  {
    command: 'home',
    description: 'Forces the bot to return to the creator\'s bed.',
    usage: '!home [target]',
    example: '!home all_aibots'
  },
  {
    command: 'flee',
    description: 'Forces the bot to disengage combat and return to safety/home immediately.',
    usage: '!flee [target]',
    example: '!flee all_aibots'
  },
  { 
    command: 'protect', 
    description: 'Sets the bot to aggressive defense mode.', 
    usage: '!protect [target]', 
    example: '!protect all_aibots' 
  },

  // --- Tasks ---
  { 
    command: 'mine', 
    description: 'Instructs the bot to mine a specific resource.', 
    usage: '!mine <block_type> [target]', 
    example: '!mine diamond_ore Miners' 
  },
  { 
    command: 'farm', 
    description: 'Instructs the bot to start a farming cycle (plant/harvest).', 
    usage: '!farm <crop_type> [target]', 
    example: '!farm wheat Farmers' 
  },
  { 
    command: 'craft', 
    description: 'Orders the bot to craft an item, gathering ingredients if necessary.', 
    usage: '!craft <item_name> [target]', 
    example: '!craft iron_sword all_aibots' 
  },
];
