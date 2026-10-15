import type {SystemId} from './anatomy';

export type Lang = 'es' | 'en';
export const DEFAULT_LANG: Lang = 'es';

export interface SystemInfo {
  id: SystemId;
  name: string;
  color: string;
  description: string;
}

export const SYSTEMS_I18N: Record<Lang, SystemInfo[]> = {
  es: [
    {
      id: 'skeletal',
      name: 'Esqueleto',
      color: '#e2d9ba',
      description: 'Los huesos forman el armazón estructural del cuerpo, protegen órganos vitales y proporcionan puntos de anclaje para los músculos. Su tejido interno almacena minerales y aloja la médula ósea que produce células sanguíneas.'
    },
    {
      id: 'muscular',
      name: 'Músculos',
      color: '#a85b50',
      description: 'Los músculos esqueléticos generan movimiento mediante la tracción sobre sus inserciones óseas. Junto con los tendones, articulan el movimiento, estabilizan la postura y producen calor corporal.'
    },
    {
      id: 'cardiac',
      name: 'Corazón',
      color: '#b96760',
      description: 'El corazón es una bomba muscular hueca de cuatro cavidades. Sus válvulas aseguran el flujo unidireccional continuo de la sangre a través de los circuitos pulmonar y sistémico.'
    },
    {
      id: 'sensory',
      name: 'Órganos sensoriales',
      color: '#b0c8ce',
      description: 'Estructuras anatómicas dedicadas a los sentidos especiales, como la vista, el oído y el equilibrio. Sus tejidos especializados captan estímulos y los transmiten al sistema nervioso.'
    },
    {
      id: 'arterial',
      name: 'Arterias',
      color: '#c05245',
      description: 'El corazón impulsa la sangre a través del árbol vascular. Las arterias transportan sangre oxigenada y nutrientes hacia los tejidos periféricos o, en la circulación pulmonar, hacia los pulmones.'
    },
    {
      id: 'venous',
      name: 'Venas',
      color: '#527c9f',
      description: 'Las venas conducen la sangre de retorno al corazón. Redes superficiales y profundas recogen los fluidos de los tejidos; las venas pulmonares devuelven sangre oxigenada desde los pulmones.'
    },
    {
      id: 'nervous',
      name: 'Sistema nervioso',
      color: '#d8b565',
      description: 'El encéfalo, la médula espinal y los nervios periféricos procesan y transmiten impulsos. Coordinan la sensibilidad, el movimiento voluntario y la regulación autónoma de las funciones corporales.'
    },
    {
      id: 'respiratory',
      name: 'Respiratorio',
      color: '#b98991',
      description: 'Las vías aéreas conducen el aire hacia los pulmones, donde se produce el intercambio de oxígeno y dióxido de carbono. La ventilación depende de gradientes de presión generados por los músculos respiratorios.'
    },
    {
      id: 'digestive',
      name: 'Digestivo',
      color: '#b8916b',
      description: 'El tracto digestivo descompone los alimentos, absorbe nutrientes y agua, y compacta los desechos para su eliminación. Glándulas anexas como el hígado y el páncreas aportan bilis y enzimas digestivas.'
    },
    {
      id: 'urinary',
      name: 'Urinario',
      color: '#b47961',
      description: 'Los riñones filtran el plasma sanguíneo y regulan el equilibrio hídrico, electrolítico y acidobásico. La orina discurre por los uréteres hacia la vejiga urinaria y se evacúa mediante la uretra.'
    },
    {
      id: 'lymphatic',
      name: 'Linfático',
      color: '#879f7c',
      description: 'Los vasos linfáticos drenan el exceso de líquido intersticial de vuelta al torrente sanguíneo. Los ganglios linfáticos y órganos linfoides albergan células inmunitarias clave para la defensa biológica.'
    },
    {
      id: 'endocrine',
      name: 'Endocrino',
      color: '#c5a09a',
      description: 'Las glándulas endocrinas secretan hormonas al torrente circulatorio para regular funciones complejas como el metabolismo, el crecimiento, la respuesta al estrés y la reproducción.'
    },
    {
      id: 'reproductive',
      name: 'Reproductor',
      color: '#bda098',
      description: 'Las estructuras del aparato reproductor masculino representadas intervienen en la espermatogénesis, maduración y transporte de espermatozoides, así como en la producción de testosterona.'
    },
    {
      id: 'integumentary',
      name: 'Superficie corporal',
      color: '#ba9b7d',
      description: 'La piel y la superficie corporal delimitan el contorno anatómico exterior. Forman una barrera protectora fundamental contra agresiones externas, regulan la temperatura y albergan receptores sensoriales.'
    },
    {
      id: 'connective',
      name: 'Tejido conectivo',
      color: '#aec3bb',
      description: 'Cartílagos, ligamentos, fascias y tendones unen, amortiguan y separan las estructuras anatómicas. Su función es estabilizar articulaciones y distribuir las fuerzas mecánicas.'
    }
  ],
  en: [
    {
      id: 'skeletal',
      name: 'Skeleton',
      color: '#e2d9ba',
      description: 'Bones form the supporting framework of the body, protect organs, and provide attachment points for muscles. Their internal tissue also stores minerals and produces blood cells.'
    },
    {
      id: 'muscular',
      name: 'Muscles',
      color: '#a85b50',
      description: 'Skeletal muscles generate movement by pulling on their attachments. Together with tendons, they move joints, stabilize posture, and produce heat.'
    },
    {
      id: 'cardiac',
      name: 'Heart',
      color: '#b96760',
      description: 'The heart is a muscular pump with four chambers. Its valves direct blood forward through the pulmonary and systemic circuits.'
    },
    {
      id: 'sensory',
      name: 'Sensory organs',
      color: '#b0c8ce',
      description: 'These structures contribute to special senses, including sight, hearing, and balance. Their specialized tissues detect stimuli and work with the nervous system to convey information.'
    },
    {
      id: 'arterial',
      name: 'Arteries',
      color: '#c05245',
      description: 'The heart drives blood through the circulation. Arteries carry blood away from the heart to supply tissues or, in the pulmonary circuit, to the lungs.'
    },
    {
      id: 'venous',
      name: 'Veins',
      color: '#527c9f',
      description: 'Veins return blood toward the heart. Superficial and deep networks collect blood from the tissues; the pulmonary veins bring oxygenated blood back from the lungs.'
    },
    {
      id: 'nervous',
      name: 'Nervous system',
      color: '#d8b565',
      description: 'The brain, spinal cord, and peripheral nerves carry and process signals. They support sensation, movement, coordination, and automatic regulation of body functions.'
    },
    {
      id: 'respiratory',
      name: 'Respiratory',
      color: '#b98991',
      description: 'The airways conduct air to the lungs, where oxygen and carbon dioxide move between air and blood. Breathing depends on pressure changes produced by respiratory muscles.'
    },
    {
      id: 'digestive',
      name: 'Digestive',
      color: '#b8916b',
      description: 'The digestive tract breaks down food, absorbs nutrients and water, and moves waste onward. Accessory organs contribute bile and digestive enzymes.'
    },
    {
      id: 'urinary',
      name: 'Urinary',
      color: '#b47961',
      description: 'The kidneys filter blood and regulate fluid, electrolyte, and acid–base balance. Urine travels through the ureters to the bladder and exits through the urethra.'
    },
    {
      id: 'lymphatic',
      name: 'Lymphatic',
      color: '#879f7c',
      description: 'Lymphatic vessels return excess tissue fluid to the circulation. Lymph nodes and other lymphoid organs support immune surveillance and responses.'
    },
    {
      id: 'endocrine',
      name: 'Endocrine',
      color: '#c5a09a',
      description: 'Endocrine organs release hormones into the blood to coordinate processes such as metabolism, growth, stress responses, and reproduction.'
    },
    {
      id: 'reproductive',
      name: 'Reproductive',
      color: '#bda098',
      description: 'The male reproductive structures represented here contribute to sperm production, maturation, transport, and the production of sex hormones.'
    },
    {
      id: 'integumentary',
      name: 'Body surface',
      color: '#ba9b7d',
      description: 'The body surface provides an outer anatomical reference. The integumentary system forms a protective barrier and contributes to sensation and temperature regulation.'
    },
    {
      id: 'connective',
      name: 'Connective tissue',
      color: '#aec3bb',
      description: 'Cartilage, ligaments, and other connective tissues support, connect, and separate structures. Their roles include stabilizing joints and distributing mechanical loads.'
    }
  ]
};

export const EXPLANATIONS_I18N: Record<Lang, Record<string, string>> = {
  es: {
    'heart': 'Bomba muscular situada en el tórax. Su lado derecho envía la sangre a los pulmones y su lado izquierdo la distribuye con fuerza por toda la circulación sistémica.',
    'liver': 'Órgano voluminoso situado bajo el hemidiafragma derecho. Procesa nutrientes absorbidos, produce bilis y sintetiza numerosas proteínas plasmáticas indispensables.',
    'brain': 'Órgano central del encéfalo y del sistema nervioso. Sus complejas áreas corticales y subcorticales gobiernan la percepción, motricidad, cognición, memoria y homeostasis corporal.',
    'stomach': 'Cámara muscular en forma de "J" situada entre el esófago y el duodeno. Almacena los alimentos y los mezcla con jugo gástrico y enzimas para formar el quimo.',
    'spleen': 'Órgano linfoide en el hipocondrio izquierdo. Filtra la sangre periférica, destruye eritrocitos envejecidos y alberga linfocitos activos frente a patógenos.',
    'pancreas': 'Glándula mixta abdominal. Su porción exocrina vierte enzimas digestivas al duodeno, mientras que sus islotes endocrinos liberan insulina y glucagón a la sangre.',
    'urinary bladder': 'Reservorio muscular elástico en la cavidad pélvica que almacena la orina procedente de los riñones antes de su micción voluntaria.',
    'trachea': 'Conducto cartilaginoso semirrígido que conecta la laringe con los bronquios principales, manteniendo despejada la vía aérea en todo momento.',
    'diaphragm': 'Músculo cúpular que independiza la cavidad torácica de la abdominal. Su contracción es el motor principal de la inspiración pulmonar.',
    'gallbladder': 'Pequeña bolsa muscular bajo el hígado que almacena y concentra la bilis antes de liberarla al duodeno para la digestión de las grasas.',
    'kidney': 'Órgano par con forma de habichuela en el retroperitoneo. Filtra la sangre, elimina toxinas metabólicas y regula el volumen y la presión arterial.',
    'femur': 'El hueso más largo, pesado y resistente del cuerpo humano, situado en el muslo; articula con la pelvis en la cadera y con la tibia en la rodilla.',
    'skull': 'Estructura ósea que protege el encéfalo y los órganos de los sentidos, además de configurar la arquitectura facial y albergar los dientes.',
    'tibia': 'Hueso principal y de soporte de peso de la pierna (espinilla), que articula con el fémur en la rodilla y con el astrágalo en el tobillo.',
    'fibula': 'Hueso lateral y delgado de la pierna (peroné), crucial para la inserción de músculos del pie y la estabilización del tobillo.',
    'humerus': 'Hueso largo del brazo que conecta la escápula en el hombro con el radio y cúbito en el codo.',
    'scapula': 'Hueso plano triangular en la parte posterosuperior del tórax (omóplato), clave para la movilidad y anclaje del hombro.',
    'clavicle': 'Hueso con forma de "S" que actúa como puntal entre el esternón y el hombro, transmitiendo fuerzas del miembro superior al esqueleto axial.',
    'sternum': 'Hueso plano en la línea media anterior del tórax, donde se unen las clavículas y los cartílagos costales para proteger el corazón y pulmones.',
    'mandible': 'El hueso más grande y fuerte de la cara, y el único hueso móvil del cráneo, que aloja los dientes inferiores y articula en la ATM.',
    'patella': 'Hueso sesamoideo en el tendón del cuádriceps (rótula) que protege la articulación de la rodilla y optimiza la fuerza de extensión de la pierna.',
    'esophagus': 'Tubo muscular que impulsa el bolo alimenticio desde la faringe hasta el estómago mediante ondas de contracción peristáltica.',
    'appendix': 'Pequeño divertículo tubular unido al ciego en el intestino grueso; contiene tejido linfoide y reservorio de microbiota beneficiosa.',
    'prostate': 'Glándula del aparato reproductor masculino situada bajo la vejiga; secreta líquido seminal alcalino que nutre y transporta los espermatozoides.'
  },
  en: {
    'heart': 'A muscular pump in the chest. Its right side sends blood to the lungs; its left side sends blood through the systemic circulation.',
    'liver': 'A large organ beneath the right side of the diaphragm. It processes absorbed nutrients, produces bile, and synthesizes many proteins carried in the blood.',
    'brain': 'The central organ of the nervous system. Its interconnected regions support perception, movement, memory, language, and the regulation of bodily functions.',
    'stomach': 'A muscular chamber between the esophagus and small intestine. It stores and mixes food with acid and enzymes before releasing it into the duodenum.',
    'spleen': 'A lymphoid organ in the upper left abdomen. It filters blood, removes aging blood cells, and participates in immune responses.',
    'pancreas': 'An abdominal organ with digestive and endocrine roles. It supplies enzymes to the small intestine and releases hormones including insulin and glucagon.',
    'urinary bladder': 'A muscular reservoir in the pelvis that stores urine arriving from the kidneys through the ureters.',
    'trachea': 'The main airway connecting the larynx to the bronchi. Its cartilage supports keep the airway open during breathing.',
    'diaphragm': 'A broad muscle separating the chest and abdomen. When it contracts, it increases chest volume and helps draw air into the lungs.'
  }
};

export const UI_TEXT = {
  es: {
    eyebrow: 'ANATOMÍA INTERACTIVA',
    title: 'Atlas Humano',
    edition: '3D',
    piecesModeled: (n: number) => `${n.toLocaleString('es-ES')} piezas modeladas`,
    sourceCredit: 'BodyParts3D',
    findStructure: 'Buscar estructura',
    searchAria: 'Buscar anatomía',
    searchPlaceholder: 'Corazón, fémur, nervio craneal…',
    searchAriaInput: 'Buscar estructuras anatómicas con nombre o sinónimos',
    searchEmpty: 'No se encontraron estructuras que coincidan con la búsqueda.',
    searchNoteMatching: (max: number) => `Mostrando hasta ${max} coincidencias. Afina tu búsqueda para encontrar estructuras más pequeñas.`,
    searchNoteInitial: 'Comienza con un órgano principal o busca por nombre científico, vulgar o sinónimos.',
    pieceSingle: 'pieza',
    piecePlural: 'piezas',
    aboutAtlas: 'Acerca de este atlas',
    closeSearch: 'Cerrar búsqueda',
    closeSystems: 'Cerrar sistemas',
    systems: 'Sistemas',
    layersAria: 'Capas anatómicas',
    presetAll: 'Todos',
    presetSkeleton: 'Esqueleto',
    presetMuscles: 'Músculos',
    presetOrgans: 'Órganos',
    presetCirculatory: 'Circulatorio',
    presetNervous: 'Nervioso',
    showOnlyPrefix: 'Mostrar solo',
    showPrefix: 'Mostrar',
    showAll: 'Mostrar todo',
    hideAll: 'Ocultar todo',
    piecesVisible: (n: number) => `${n.toLocaleString('es-ES')} piezas visibles`,
    piecesVisibleSuffix: 'piezas visibles',
    dragToReorder: 'Arrastrar para reordenar',
    dragToMoveControls: 'Arrastrar para mover controles',
    dragToMovePanel: 'Arrastrar para mover panel',
    resetPosition: 'Restablecer posición',
    resetOrder: 'Restablecer orden',
    cameraControls: 'Controles de cámara',
    views: [
      { id: 'three-quarter', label: '¾', tag: '3D', name: 'Vista tres cuartos (perspectiva)' },
      { id: 'front', label: 'F', tag: 'Frente', name: 'Vista frontal (de frente)' },
      { id: 'side', label: 'L', tag: 'Lado', name: 'Vista lateral (de lado)' },
      { id: 'back', label: 'P', tag: 'Atrás', name: 'Vista posterior (de espaldas)' }
    ],
    rotateBody: 'Rotar cuerpo',
    pauseRotation: 'Pausar rotación',
    autoRotate: 'Autorrotación',
    reset: 'Restablecer',
    resetViewAndLayers: 'Restablecer vista y capas',
    captionSelected: 'ESTRUCTURA SELECCIONADA',
    captionInventory: 'INVENTARIO ANATÓMICO',
    captionSeparated: 'ESTRUCTURAS SEPARADAS',
    captionDefault: 'HUMANO ADULTO · MASCULINO',
    dockSystems: 'Sistemas',
    dockSystemsAria: 'Abrir capas del sistema',
    explodeAnatomy: 'Despiezar anatomía',
    assembled: 'Ensamblado',
    everyPiece: 'Cada pieza',
    dragToOrbit: 'Arrastrar para orbitar',
    dragToPan: 'Arrastrar para desplazar',
    pinchToZoom: 'Pellizcar para zoom',
    tapToInspect: 'Tocar para inspeccionar',
    sourceCredits: 'Fuente y créditos',
    preparingAnatomy: 'Preparando la anatomía',
    loadingPieces: (pct: number, count: number) => `${pct}% · Cargando ${count.toLocaleString('es-ES')} piezas`,
    reloadViewer: 'Recargar visor',
    webglError: 'Este navegador no pudo iniciar el visor 3D. Por favor, prueba un navegador con WebGL habilitado.',
    contextLostError: 'La sesión 3D fue pausada por tu dispositivo. Recarga para continuar.',
    anatomy: 'ANATOMÍA',
    systemOverview: 'Visión general del sistema · estructura identificada de la fuente anatómica',
    atlasReference: 'Referencia del atlas',
    selectedPieces: 'Piezas seleccionadas',
    includedStructures: 'Estructuras incluidas',
    andMorePieces: (n: number) => `Y ${n} piezas modeladas más.`,
    viewAnatomicalSource: 'Ver fuente anatómica',
    isolateStructure: 'Aislar estructura',
    showSurroundingAnatomy: 'Mostrar anatomía circundante',
    clearSelection: 'Limpiar selección',
    canvasAria: 'Anatomía humana interactiva. Arrastra para orbitar, pellizca o haz scroll para zoom, y toca una estructura para inspeccionarla.',
    langPillsAria: 'Cambiar idioma',
    darkMode: 'Modo oscuro',
    lightMode: 'Modo claro',
    searchBottomPlaceholder: 'Buscar huesos, órganos, músculos, nervios... (presiona /)',
    clearSearch: 'Limpiar búsqueda',
    verticalExplode: 'Desplazamiento',
    verticalExplodeDesc: 'Despiezar anatomía',
    resetExplode: 'Restablecer explosión',
    searchResultsTitle: 'Estructuras encontradas',
    synonymTagPrefix: '≈',
    // About sheet
    aboutScope: 'FUENTE Y ALCANCE',
    aboutTitle: 'El cuerpo humano al descubierto.',
    aboutDescription: 'Explora la anatomía de referencia de un varón adulto de BodyParts3D.',
    aboutP1Title: 'Varón adulto · BodyParts3D',
    aboutP1Text: '2.234 mallas individuales y 3.432 conceptos anatómicos con nombre basados en la anatomía de referencia humana.',
    aboutP2Text: 'Esta referencia no contiene todas las variantes o estructuras humanas. Los conceptos con nombre pueden agrupar múltiples piezas; cada malla de origen se renderiza una vez.',
    aboutP3Text: 'Los colores y agrupaciones por sistemas están optimizados para la exploración visual. La geometría se ha aligerado para la web y las descripciones ofrecen contexto educativo general. Se trata de una referencia anatómica divulgativa, no de una herramienta de diagnóstico clínico o quirúrgico.',
    aboutSourceTitle: 'Fuente',
    aboutSourceText: 'BodyParts3D, © The Database Center for Life Science (DBCLS).',
    aboutOriginalGeometry: 'Geometría original y metadatos',
    aboutReadPublication: 'Leer la publicación científica oficial'
  },
  en: {
    eyebrow: 'INTERACTIVE ANATOMY',
    title: 'Human Atlas',
    edition: '3D',
    piecesModeled: (n: number) => `${n.toLocaleString('en-US')} modeled pieces`,
    sourceCredit: 'BodyParts3D',
    findStructure: 'Find a structure',
    searchAria: 'Search anatomy',
    searchPlaceholder: 'Heart, femur, cranial nerve…',
    searchAriaInput: 'Search named anatomical structures',
    searchEmpty: 'No structures match your search.',
    searchNoteMatching: (max: number) => `Showing up to ${max} matches. Refine your search to find smaller structures.`,
    searchNoteInitial: 'Start with a major organ, or search every named structure.',
    pieceSingle: 'piece',
    piecePlural: 'pieces',
    aboutAtlas: 'About this atlas',
    closeSearch: 'Close search',
    closeSystems: 'Close systems',
    systems: 'Systems',
    layersAria: 'Anatomical layers',
    presetAll: 'All',
    presetSkeleton: 'Skeleton',
    presetMuscles: 'Muscles',
    presetOrgans: 'Organs',
    presetCirculatory: 'Circulatory',
    presetNervous: 'Nervous',
    showOnlyPrefix: 'Show only',
    showPrefix: 'Show',
    showAll: 'Show all',
    hideAll: 'Hide all',
    piecesVisible: (n: number) => `${n.toLocaleString('en-US')} pieces visible`,
    piecesVisibleSuffix: 'pieces visible',
    dragToReorder: 'Drag to reorder',
    dragToMoveControls: 'Drag to move controls',
    dragToMovePanel: 'Drag to move panel',
    resetPosition: 'Reset position',
    resetOrder: 'Reset order',
    cameraControls: 'Camera controls',
    views: [
      { id: 'three-quarter', label: '¾', tag: '3D', name: 'Three-quarter view (angle)' },
      { id: 'front', label: 'F', tag: 'Front', name: 'Front view' },
      { id: 'side', label: 'S', tag: 'Side', name: 'Side view' },
      { id: 'back', label: 'B', tag: 'Back', name: 'Back view' }
    ],
    rotateBody: 'Rotate body',
    pauseRotation: 'Pause rotation',
    autoRotate: 'Auto rotate',
    reset: 'Reset',
    resetViewAndLayers: 'Reset view and layers',
    captionSelected: 'SELECTED STRUCTURE',
    captionInventory: 'ANATOMICAL INVENTORY',
    captionSeparated: 'SEPARATED STRUCTURES',
    captionDefault: 'ADULT HUMAN · MALE',
    dockSystems: 'Systems',
    dockSystemsAria: 'Open system layers',
    explodeAnatomy: 'Explode anatomy',
    assembled: 'Assembled',
    everyPiece: 'Every piece',
    dragToOrbit: 'Drag to orbit',
    dragToPan: 'Drag to pan',
    pinchToZoom: 'Pinch to zoom',
    tapToInspect: 'Tap to inspect',
    sourceCredits: 'Source & credits',
    preparingAnatomy: 'Preparing the anatomy',
    loadingPieces: (pct: number, count: number) => `${pct}% · Loading ${count.toLocaleString('en-US')} pieces`,
    reloadViewer: 'Reload viewer',
    webglError: 'This browser could not start the 3D viewer. Please try a browser with WebGL enabled.',
    contextLostError: 'The 3D session was paused by your device. Reload to continue.',
    anatomy: 'ANATOMY',
    systemOverview: 'System overview · structure identified from source anatomy',
    atlasReference: 'Atlas reference',
    selectedPieces: 'Selected pieces',
    includedStructures: 'Included structures',
    andMorePieces: (n: number) => `And ${n} more modeled pieces.`,
    viewAnatomicalSource: 'View anatomical source',
    isolateStructure: 'Isolate structure',
    showSurroundingAnatomy: 'Show surrounding anatomy',
    clearSelection: 'Clear selection',
    canvasAria: 'Interactive human anatomy. Drag to orbit, pinch or scroll to zoom, and tap a structure to inspect it.',
    langPillsAria: 'Change language',
    darkMode: 'Dark mode',
    lightMode: 'Light mode',
    searchBottomPlaceholder: 'Search bones, organs, muscles, nerves... (press /)',
    clearSearch: 'Clear search',
    verticalExplode: 'Displacement',
    verticalExplodeDesc: 'Explode anatomy',
    resetExplode: 'Reset displacement',
    searchResultsTitle: 'Structures found',
    synonymTagPrefix: '≈',
    // About sheet
    aboutScope: 'SOURCE & SCOPE',
    aboutTitle: 'A body, revealed.',
    aboutDescription: 'Explore the adult male reference anatomy from BodyParts3D.',
    aboutP1Title: 'Male · BodyParts3D',
    aboutP1Text: '2,234 individual meshes and 3,432 named concepts from an adult male reference anatomy.',
    aboutP2Text: 'This reference does not contain every human structure or variation. Named concepts can contain multiple pieces; each source mesh is rendered once.',
    aboutP3Text: 'Colors and system groupings are designed for exploration. The geometry is simplified for the web, and short explanations provide general educational context. This is an anatomical reference, not a diagnostic or surgical tool.',
    aboutSourceTitle: 'Source',
    aboutSourceText: 'BodyParts3D, © The Database Center for Life Science (DBCLS).',
    aboutOriginalGeometry: 'Original geometry & metadata',
    aboutReadPublication: 'Read the source publication'
  }
};

export function getSystemInfo(id: SystemId, lang: Lang): SystemInfo | undefined {
  return SYSTEMS_I18N[lang].find(s => s.id === id);
}

export function getExplanation(name: string, system: SystemId, lang: Lang): string {
  const norm = name.toLowerCase().trim();
  const expl = EXPLANATIONS_I18N[lang][norm];
  if (expl) return expl;
  const sys = getSystemInfo(system, lang);
  return sys?.description ?? '';
}
