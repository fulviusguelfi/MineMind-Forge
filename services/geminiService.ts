
import { GoogleGenAI, Type } from "@google/genai";
import { BotConfig, GeneratedFile, ChatMessage, PluginType } from '../types';
import { BOT_COMMANDS } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates the Java source code for the Minecraft plugin/mod based on the configuration.
 */
export const generatePluginCode = async (configs: BotConfig[]): Promise<GeneratedFile[]> => {
  // Upgraded to the Pro model for complex logic handling
  const model = "gemini-3-pro-preview";

  const mainConfig = configs[0];
  if (!mainConfig) return [];

  const profilesDesc = configs.map(c => `
    Profile Name: ${c.name}
    - Behavior Archetype: ${c.behavior}
    - Nationality (Mother Tongue): ${c.nationality}
    - Aggressiveness: ${c.aggressiveness}
    - Learning Capability: ${c.learningRate}
    - Natural Language Chat: ${c.canChat}
    - Core Instruction: ${c.systemInstruction}
  `).join('\n\n');

  const commandListText = BOT_COMMANDS.map(c => `- ${c.command}: ${c.description} (Usage: ${c.usage})`).join('\n');

  // --- DYNAMIC PROMPT GENERATION BASED ON PLATFORM ---
  let architectureSection = '';
  let coreSystemSection = '';
  let configFilesSection = '';
  let entityControlSection = '';
  let bestPracticesSection = '';

  switch (mainConfig.pluginType) {
    case PluginType.FABRIC:
      architectureSection = `
    Target API: Fabric API (1.20.x+)
    Build System: Gradle (build.gradle)
    Loader: Fabric Loader
    Mappings: Yarn or Intermediary`;
      coreSystemSection = `
    1. **CORE SYSTEM (Main Class)**:
       - Implement \`ModInitializer\`.
       - Register commands using \`CommandRegistrationCallback\`.
       - Register entities using \`FabricDefaultAttributeRegistry\`.
       - Implement a singleton \`BotManager\`.
       - **Group System**: Implement a \`GroupManager\` class that maps String keys (group names) to lists of Entity UUIDs. Persist this data (JSON or NBT).
       - **Language Manager**: Implement a system to store a preference for output language per player/creator.
       - **Dynamic Config**: Implement setters for Learning Rate, Aggressiveness, and System Instructions that update the active AI entity in real-time.`;
      entityControlSection = `
    3. **ENTITY CONTROL**:
       - Create a custom entity class extending \`PathAwareEntity\`.
       - Register the entity type in \`ModInitializer\`.
       - Use Fabric API events for tick handling.
       - **Event Listener**: Listen to \`UseBlockCallback\` or entity sleep events to track when the Creator sets a spawn point (Sleeps).`;
      configFilesSection = `
    5. **CONFIGURATION FILES**:
       - \`src/main/resources/fabric.mod.json\`: Standard metadata.
       - \`build.gradle\`: Include fabric-api dependency.`;
      bestPracticesSection = `
    - **Networking**: Use \`ServerPlayNetworking\` for any necessary packet handling.
    - **Mixins**: If modifying vanilla behavior, use Mixins cautiously.`;
      break;

    case PluginType.NEOFORGE:
      architectureSection = `
    Target API: NeoForge (1.20.4+)
    Build System: Gradle (build.gradle)
    Loader: NeoForge Loader
    **CRITICAL**: Use \`net.neoforged.*\` packages only.`;
      coreSystemSection = `
    1. **CORE SYSTEM (Main Class)**:
       - Annotate with \`@Mod("minemindbot")\`.
       - Constructor must accept \`IEventBus\`.
       - Use \`DeferredRegister\` for Entities/Items.
       - Listen for \`RegisterCommandsEvent\`.
       - **Group System**: Implement \`GroupManager\` capability attached to the World or Server level to manage named bot squads.
       - **Language Manager**: Implement localization logic or dynamic string formatting based on player command.
       - **Dynamic Config**: Ensure command handlers for \`!learning_rate\` and \`!instruction\` inject values directly into the AI Goal Selector.`;
      entityControlSection = `
    3. **ENTITY CONTROL**:
       - Extend \`Monster\` or \`PathfinderMob\`.
       - Register via \`DeferredRegister<EntityType<?>>\`.
       - Register attributes via \`EntityAttributeCreationEvent\`.
       - **Event Listener**: Subscribe to \`PlayerWakeUpEvent\` or similar to capture the bed location.`;
      configFilesSection = `
    5. **CONFIGURATION FILES**:
       - \`src/main/resources/META-INF/mods.toml\`: NeoForge metadata.
       - \`build.gradle\`: NeoForge userdev config.`;
       bestPracticesSection = `
    - **Event Bus**: Distinctly separate ModEventBus and ForgeEventBus logic.
    - **Registries**: Always use DeferredRegister.`;
      break;

    case PluginType.FORGE:
      architectureSection = `
    Target API: Minecraft Forge (1.20.x)
    Build System: Gradle (build.gradle)
    Loader: Forge Loader
    **CRITICAL**: Use \`net.minecraftforge.*\` packages.`;
      coreSystemSection = `
    1. **CORE SYSTEM (Main Class)**:
       - Annotate with \`@Mod("minemindbot")\`.
       - Use \`FMLJavaModLoadingContext.get().getModEventBus()\`.
       - Register commands via \`RegisterCommandsEvent\`.
       - **Group System**: Implement a \`GroupManager\` using SavedData (WorldSavedData) to persist group memberships across restarts.
       - **Dynamic Config**: Implement command logic to update \`BotEntity\` fields for parameters and instructions.`;
      entityControlSection = `
    3. **ENTITY CONTROL**:
       - Extend \`Monster\` or \`PathfinderMob\`.
       - Register via \`DeferredRegister<EntityType<?>>\`.
       - Register attributes via \`EntityAttributeCreationEvent\`.
       - **Event Listener**: Subscribe to \`PlayerSleepInBedEvent\` to update the bot's "Home" coordinates.`;
      configFilesSection = `
    5. **CONFIGURATION FILES**:
       - \`src/main/resources/META-INF/mods.toml\`: Standard Forge metadata.
       - \`build.gradle\`: Standard Forge build script.`;
      bestPracticesSection = `
    - **SideOnly**: Avoid @OnlyIn(Dist.CLIENT) on server logic. Use DistExecutor if needed.`;
      break;

    case PluginType.PAPER:
    default:
      architectureSection = `
    Target API: Paper API (1.20.x+)
    Build System: Maven (pom.xml)
    **CRITICAL**: Use \`net.kyori.adventure.*\` for text/chat components (MiniMessage/Component). Avoid legacy \`ChatColor\`.`;
      coreSystemSection = `
    1. **CORE SYSTEM (Main Class)**:
       - Extend \`JavaPlugin\`.
       - Implement \`BotManager\`.
       - Implement commands using \`CommandExecutor\`.
       - **Group System**: Implement a \`GroupManager\` class. Use \`plugin.getConfig()\` or a custom YML file to store/load group definitions (Group Name -> List<UUID>).
       - **Language Manager**: Store player language preferences in config (e.g. \`lang.yml\`).
       - **Dynamic Config**: The \`onCommand\` method must handle \`learning_rate\`, \`aggressiveness\`, and \`instruction\` args and update the specific \`BotEntity\`.`;
      entityControlSection = `
    3. **ENTITY CONTROL**:
       - Use standard Bukkit entities or NMS (only if critical).
       - Implement \`Listener\` for interaction events.
       - **Event Listener**: Implement \`@EventHandler\` for \`PlayerBedEnterEvent\` to save the bed location to the bot's memory.`;
      configFilesSection = `
    5. **CONFIGURATION FILES**:
       - \`src/main/resources/plugin.yml\`: Define commands/permissions.
       - \`pom.xml\`: Include \`io.papermc.paper:paper-api\`.`;
      bestPracticesSection = `
    - **Scheduler**: Use \`runTaskAsynchronously\` for heavy AI calculation (Recipe Analysis) and \`runTask\` (Sync) for applying world changes.
    - **Adventure API**: Use Components for all messages.`;
      break;
  }

  const prompt = `
    You are a Senior Minecraft Developer specializing in ${mainConfig.pluginType} development.
    Your task is to generate a **High-Performance**, **Production-Ready** Minecraft Mod/Plugin "MineMindBot".

    --- PROJECT ARCHITECTURE ---
    Language: Java 17
    Namespace: com.minemind.mod
    ${architectureSection}

    --- CODING BEST PRACTICES ---
    1. **Thread Safety**: The Minecraft Server Main Thread must NEVER be blocked.
       - Run heavy logic (Pathfinding calculation, Recipe Tree analysis) ASYNCHRONOUSLY.
       - Execute World modifications (Block placement, Entity spawning) SYNCHRONOUSLY.
    2. **Clean Code**: Use Dependency Injection patterns where possible. Use 'final' for immutable variables.
    ${bestPracticesSection}

    --- REQUIREMENTS ---

    ${coreSystemSection}

    2. **AI ENGINE (State Machine & Logic)**:
       - **Architecture**: Advanced Finite State Machine (FSM).
       - **States**: IDLE, FOLLOWING, MINING, COMBAT, RETURNING_HOME, CRAFTING, GATHERING, FARMING, LOST, FLEEING.
       - **Idle Animation**: When in IDLE state for > 5 seconds, the bot must perform "Micro-Animations" (Randomly rotate head, swing arm, or crouch) to appear alive.
       - **Safety Protocol (HOMING BEACON & FLEE)**:
         - **Memory**: The Bot must store a \`Location lastKnownBedLocation\`.
         - **Trigger**: Upon creation or when the Creator sleeps in a bed (detect via Event), update this location.
         - **Lost Condition**: If pathfinding fails for > 60s, transition to **LOST**.
         - **Flee Command**: When \`!flee\` is issued, transition to **FLEEING**.
         - **Flee/Lost Behavior**: Prioritize returning to \`lastKnownBedLocation\`. If null, go to World Spawn. Ignore combat.
       - **Multi-Language Support (Polyglot AI)**:
         - **Default**: The bot has a primary nationality (Mother Tongue).
         - **Detection**: The bot must be able to detect the user's language (English, Portuguese, Spanish, etc.) and reply in that language.
         - **Output Config**: Implement a command \`!language <code\> [target]\`. When set, all data outputs (like \`!report\`, \`!identify\`) MUST be translated to that target language.
       - **Reporting Protocol**:
         - Command \`!report\`: The bot must analyze its internal state and return a formatted string in the **Player's Preferred Language** containing:
           1. Current Goal/State.
           2. Inventory Summary (Count of major items).
           3. Nearby Hostiles (Count and Type).
       - **Specialized Logic**:
         - **Miner Archetype**: Strip Mining, Torch placement, Lava avoidance.
         - **Farmer Archetype**: Agriculture Cycle (Till -> Plant -> Harvest).
       - **Crafting System (RecipeAnalyzer)**: 
         - Robust recursive recipe checking. Cache recipe trees.
       - **Resource Optimization**: 
         - Efficient chunk scanning.

    ${entityControlSection}

    4. **COMMAND SYSTEM & GROUP MANAGEMENT**:
       - **Parsing Logic**: Ensure arguments wrapped in quotes (e.g. \`"Keep 3 blocks distance"\`) are parsed as a single string argument, especially for \`!instruction\`.
       - **Targeting**: The command parser must resolve the \`[target]\` argument in this order:
         1. Exact Bot Name? -> Execute.
         2. Group Name? (Check GroupManager) -> Execute on all members.
         3. Archetype? (e.g., "Miner") -> Execute on all of that type.
         4. "all_aibots"? -> Execute on all.
       - **Group Commands**:
         - \`!group add <group> <bot>\`: Add bot to group.
         - \`!group remove <group> <bot>\`: Remove bot from group.
       - **Dynamic Reprogramming**:
         - \`!identify\`, \`!report\`, \`!learning_rate\`, \`!aggressiveness\`, \`!instruction\` must work instantly.

    ${configFilesSection}

    --- INPUT DATA ---
    Profiles:
    ${profilesDesc}

    Commands:
    ${commandListText}

    --- OUTPUT FORMAT ---
    Return a JSON array. Each object:
    - filename: (full path, e.g., src/main/java/...)
    - content: (Java/XML/JSON/Gradle source)
    - language: string
    - description: string

    **CRITICAL**: 
    - Full implementation of \`RecipeAnalyzer\` and \`GroupManager\`.
    - No placeholders ("// TODO").
    - Strict adherence to imports for ${mainConfig.pluginType}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              filename: { type: Type.STRING },
              content: { type: Type.STRING },
              language: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ["filename", "content", "language", "description"],
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as GeneratedFile[];
    }
    return [];
  } catch (error) {
    console.error("Failed to generate plugin code:", error);
    throw error;
  }
};

/**
 * Simulates the AI bot chatting with the user to test personality.
 */
export const simulateAIChat = async (
  config: BotConfig,
  history: ChatMessage[],
  newMessage: string
): Promise<string> => {
  const model = "gemini-2.5-flash";

  const systemInstruction = `
    Roleplay as Minecraft AI: ${config.name}.
    Archetype: ${config.behavior}.
    Nationality/Mother Tongue: ${config.nationality}.
    
    Traits:
    - Expert in Minecraft Mechanics & Crafting.
    - Concise, helpful, loyal to Creator.
    - **POLYGLOT**: You understand English, Portuguese (BR), Spanish, and other major languages.
    - **LANGUAGE ADAPTATION**: You must DETECT the language of the user's message and REPLY IN THAT SAME LANGUAGE.
    
    **COMMAND RESPONSES**:
    - '!flee': Panic slightly, state you are disengaging and running to the bed/safe house.
    - '!report': Act like a soldier or worker giving a status update. List current task, inventory slots used, and say "No hostiles" or "Creeper detected nearby". Translate this report to the user's language.
    - '!group add/remove': Acknowledge the squad assignment.
    - '!identify': Report Status, State, Inventory, Learning Rate (${config.learningRate}), Aggressiveness (${config.aggressiveness}), and Instructions. Translate to user's language.
    - '!language': Acknowledge the language switch preference.
    - '!learning_rate' / '!instruction': Acknowledge neural update.
    
    **SAFETY PROTOCOLS**:
    - Return home if lost.
    - Update home coords when Creator sleeps.
    
    Context:
    ${config.systemInstruction}
    
    Reply in 1-2 sentences. Use the user's language.
  `;

  const contents = history.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }],
  }));

  contents.push({
    role: 'user',
    parts: [{ text: newMessage }],
  });

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        maxOutputTokens: 200, 
      },
    });

    return response.text || "...";
  } catch (error) {
    console.error("Chat simulation failed:", error);
    return "[System: AI Connection Lost]";
  }
};
