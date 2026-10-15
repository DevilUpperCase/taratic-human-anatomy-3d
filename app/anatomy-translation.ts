import type {Lang} from './i18n';
import type {Concept, Part} from './anatomy';

// Known exact anatomical translations for high-priority organs and body parts
const EXACT_TRANSLATIONS: Record<string, string> = {
  // Organs
  'heart': 'Corazón',
  'brain': 'Cerebro',
  'liver': 'Hígado',
  'stomach': 'Estómago',
  'spleen': 'Bazo',
  'pancreas': 'Páncreas',
  'urinary bladder': 'Vejiga urinaria',
  'trachea': 'Tráquea',
  'diaphragm': 'Diafragma',
  'gallbladder': 'Vesícula biliar',
  'kidney': 'Riñón',
  'right kidney': 'Riñón derecho',
  'left kidney': 'Riñón izquierdo',
  'right lung': 'Pulmón derecho',
  'left lung': 'Pulmón izquierdo',
  'prostate': 'Próstata',
  'penis': 'Pene',
  'testis': 'Testículo',
  'right testis': 'Testículo derecho',
  'left testis': 'Testículo izquierdo',
  'esophagus': 'Esófago',
  'duodenum': 'Duodeno',
  'appendix': 'Apéndice vermiforme',
  'rectum': 'Recto',
  'tongue': 'Lengua',
  'eyeball': 'Globo ocular',
  'eyebrow': 'Ceja',
  'spinal cord': 'Médula espinal',
  'cerebellum': 'Cerebelo',
  'brainstem': 'Tronco encefálico',
  'parenchyma of pancreas': 'Parénquima del páncreas',
  'thyroid cartilage': 'Cartílago tiroides',

  // Skeleton
  'skull': 'Cráneo',
  'mandible': 'Mandíbula',
  'maxilla': 'Maxilar superior',
  'right maxilla': 'Maxilar superior derecho',
  'left maxilla': 'Maxilar superior izquierdo',
  'sternum': 'Esternón',
  'body of sternum': 'Cuerpo del esternón',
  'clavicle': 'Clavícula',
  'right clavicle': 'Clavícula derecha',
  'left clavicle': 'Clavícula izquierda',
  'scapula': 'Escápula (omóplato)',
  'humerus': 'Húmero',
  'right humerus': 'Húmero derecho',
  'left humerus': 'Húmero izquierdo',
  'radius': 'Radio',
  'right radius': 'Radio derecho',
  'left radius': 'Radio izquierdo',
  'ulna': 'Cúbito',
  'right ulna': 'Cúbito derecho',
  'left ulna': 'Cúbito izquierdo',
  'femur': 'Fémur',
  'right femur': 'Fémur derecho',
  'left femur': 'Fémur izquierdo',
  'patella': 'Rótula',
  'right patella': 'Rótula derecha',
  'left patella': 'Rótula izquierda',
  'tibia': 'Tibia',
  'right tibia': 'Tibia derecha',
  'left tibia': 'Tibia izquierda',
  'fibula': 'Peroné',
  'right fibula': 'Peroné derecho',
  'left fibula': 'Peroné izquierdo',
  'pelvis': 'Pelvis',
  'hip bone': 'Hueso coxal',
  'sacrum': 'Sacro',
  'coccyx': 'Cóccix',
  'vertebral column': 'Columna vertebral',

  // Vasculature
  'aorta': 'Aorta',
  'ascending aorta': 'Aorta ascendente',
  'arch of aorta': 'Arco aórtico (cayado)',
  'descending aorta': 'Aorta descendente',
  'abdominal aorta': 'Aorta abdominal',
  'thoracic aorta': 'Aorta torácica',
  'superior vena cava': 'Vena cava superior',
  'inferior vena cava': 'Vena cava inferior',
  'pulmonary trunk': 'Tronco pulmonar',
  'pulmonary artery': 'Arteria pulmonar',
  'pulmonary vein': 'Vena pulmonar',
  'vascular tree': 'Árbol vascular',
  'segment of artery': 'Segmento de arteria',
  'variant artery': 'Arteria variante',
  'anastomosis': 'Anastomosis',
  'vascular anastomosis': 'Anastomosis vascular',
  'arterial anastomosis': 'Anastomosis arterial',
  'venous anastomosis': 'Anastomosis venosa',
  'trunk of right coronary artery': 'Tronco de la arteria coronaria derecha',
  'trunk of left coronary artery': 'Tronco de la arteria coronaria izquierda',

  // Teeth
  'gingiva of upper jaw': 'Encía del maxilar superior',
  'gingiva of lower jaw': 'Encía de la mandíbula'
};

interface NounMeta {
  es: string;
  f: boolean;
}

const NOUN_MAP: Record<string, NounMeta> = {
  'artery': { es: 'arteria', f: true },
  'vein': { es: 'vena', f: true },
  'nerve': { es: 'nervio', f: false },
  'muscle': { es: 'músculo', f: false },
  'bone': { es: 'hueso', f: false },
  'cartilage': { es: 'cartílago', f: false },
  'ligament': { es: 'ligamento', f: false },
  'tendon': { es: 'tendón', f: false },
  'branch': { es: 'rama', f: true },
  'trunk': { es: 'tronco', f: false },
  'segment': { es: 'segmento', f: false },
  'region': { es: 'región', f: true },
  'lobe': { es: 'lóbulo', f: false },
  'wall': { es: 'pared', f: true },
  'tree': { es: 'árbol', f: false },
  'arch': { es: 'arco', f: false },
  'anastomosis': { es: 'anastomosis', f: true },
  'phalanx': { es: 'falange', f: true },
  'tooth': { es: 'diente', f: false },
  'molar': { es: 'molar', f: false },
  'premolar': { es: 'premolar', f: false },
  'incisor': { es: 'incisivo', f: false },
  'canine': { es: 'canino', f: false },
  'gingiva': { es: 'encía', f: true },
  'jaw': { es: 'mandíbula', f: true },
  'upper jaw': { es: 'maxilar superior', f: false },
  'lower jaw': { es: 'mandíbula', f: true },
  'root': { es: 'raíz', f: true },
  'plexus': { es: 'plexo', f: false },
  'tract': { es: 'tracto', f: false },
  'canal': { es: 'conducto', f: false },
  'duct': { es: 'conducto', f: false },
  'cavity': { es: 'cavidad', f: true },
  'organ': { es: 'órgano', f: false },
  'head': { es: 'cabeza', f: true },
  'neck': { es: 'cuello', f: false },
  'body': { es: 'cuerpo', f: false },
  'base': { es: 'base', f: true },
  'apex': { es: 'vértice', f: false },
  'part': { es: 'porción', f: true },
  'subdivision': { es: 'subdivisión', f: true },
  'finger': { es: 'dedo de la mano', f: false },
  'toe': { es: 'dedo del pie', f: false },
  'foot': { es: 'pie', f: false },
  'hand': { es: 'mano', f: true },
  'forebrain': { es: 'prosencéfalo', f: false },
  'fornix': { es: 'fórnix', f: false },
  'gyrus': { es: 'giro', f: false },
  'sulcus': { es: 'surco', f: false },
  'ventricle': { es: 'ventrículo', f: false },
  'atrium': { es: 'aurícula', f: true },
  'valve': { es: 'válvula', f: true },
  'rib': { es: 'costilla', f: true },
  'vertebra': { es: 'vértebra', f: true },
  'sector': { es: 'sector', f: false },
  'zone': { es: 'zona', f: true },
  'extremity': { es: 'extremidad', f: true },
  'fossa': { es: 'fosa', f: true },
  'crest': { es: 'cresta', f: true },
  'process': { es: 'apófisis', f: true },
  'condyle': { es: 'cóndilo', f: false },
  'epicondyle': { es: 'epicóndilo', f: false },
  'tubercle': { es: 'tubérculo', f: false },
  'tuberosity': { es: 'tuberosidad', f: true },
  'sinus': { es: 'seno', f: false },
  'ganglion': { es: 'ganglio', f: false },
  'node': { es: 'nódulo', f: false },
  'cortex': { es: 'corteza', f: true },
  'medulla': { es: 'médula', f: true },
  'aorta': { es: 'aorta', f: true },
  'heart': { es: 'corazón', f: false },
  'brain': { es: 'cerebro', f: false },
  'liver': { es: 'hígado', f: false },
  'stomach': { es: 'estómago', f: false },
  'lung': { es: 'pulmón', f: false },
  'kidney': { es: 'riñón', f: false },
  'spleen': { es: 'bazo', f: false },
  'pancreas': { es: 'páncreas', f: false },
  'bladder': { es: 'vejiga', f: true },
  'skull': { es: 'cráneo', f: false },
  'femur': { es: 'fémur', f: false },
  'tibia': { es: 'tibia', f: true },
  'fibula': { es: 'peroné', f: false }
};

interface AdjMeta {
  m: string;
  f: string;
  tier: number;
}

const ADJ_MAP: Record<string, AdjMeta> = {
  // Tier 1: Medical / anatomical specific type
  'coronary': { m: 'coronario', f: 'coronaria', tier: 1 },
  'cardiac': { m: 'cardíaco', f: 'cardíaca', tier: 1 },
  'pulmonary': { m: 'pulmonar', f: 'pulmonar', tier: 1 },
  'ventricular': { m: 'ventricular', f: 'ventricular', tier: 1 },
  'interventricular': { m: 'interventricular', f: 'interventricular', tier: 1 },
  'hepatic': { m: 'hepático', f: 'hepática', tier: 1 },
  'cerebral': { m: 'cerebral', f: 'cerebral', tier: 1 },
  'femoral': { m: 'femoral', f: 'femoral', tier: 1 },
  'tibial': { m: 'tibial', f: 'tibial', tier: 1 },
  'radial': { m: 'radial', f: 'radial', tier: 1 },
  'ulnar': { m: 'cubital', f: 'cubital', tier: 1 },
  'fibular': { m: 'peroneo', f: 'peronea', tier: 1 },
  'marginal': { m: 'marginal', f: 'marginal', tier: 1 },
  'septal': { m: 'septal', f: 'septal', tier: 1 },
  'diagonal': { m: 'diagonal', f: 'diagonal', tier: 1 },
  'segmental': { m: 'segmentario', f: 'segmentaria', tier: 1 },
  'vascular': { m: 'vascular', f: 'vascular', tier: 1 },
  'arterial': { m: 'arterial', f: 'arterial', tier: 1 },
  'venous': { m: 'venoso', f: 'venosa', tier: 1 },
  'thoracic': { m: 'torácico', f: 'torácica', tier: 1 },
  'abdominal': { m: 'abdominal', f: 'abdominal', tier: 1 },
  'cranial': { m: 'craneal', f: 'craneal', tier: 1 },
  'spinal': { m: 'espinal', f: 'espinal', tier: 1 },
  'pelvic': { m: 'pélvico', f: 'pélvica', tier: 1 },
  'palmar': { m: 'palmar', f: 'palmar', tier: 1 },
  'plantar': { m: 'plantar', f: 'plantar', tier: 1 },
  'digital': { m: 'digital', f: 'digital', tier: 1 },
  'flexor': { m: 'flexor', f: 'flexora', tier: 1 },
  'extensor': { m: 'extensor', f: 'extensora', tier: 1 },
  'bronchial': { m: 'bronquial', f: 'bronquial', tier: 1 },
  'intervertebral': { m: 'intervertebral', f: 'intervertebral', tier: 1 },
  'conus': { m: 'del cono', f: 'del cono', tier: 1 },
  'caudate': { m: 'caudado', f: 'caudada', tier: 1 },
  'secondary': { m: 'definitivo', f: 'definitiva', tier: 1 },
  'primary': { m: 'primario', f: 'primaria', tier: 1 },
  'variant': { m: 'variante', f: 'variante', tier: 1 },
  'fibrous': { m: 'fibroso', f: 'fibrosa', tier: 1 },

  // Tier 2: Positional & directional
  'ascending': { m: 'ascendente', f: 'ascendente', tier: 2 },
  'descending': { m: 'descendente', f: 'descendente', tier: 2 },
  'transverse': { m: 'transverso', f: 'transversa', tier: 2 },
  'superior': { m: 'superior', f: 'superior', tier: 2 },
  'inferior': { m: 'inferior', f: 'inferior', tier: 2 },
  'anterior': { m: 'anterior', f: 'anterior', tier: 2 },
  'posterior': { m: 'posterior', f: 'posterior', tier: 2 },
  'medial': { m: 'medial', f: 'medial', tier: 2 },
  'lateral': { m: 'lateral', f: 'lateral', tier: 2 },
  'middle': { m: 'medio', f: 'media', tier: 2 },
  'internal': { m: 'interno', f: 'interna', tier: 2 },
  'external': { m: 'externo', f: 'externa', tier: 2 },
  'deep': { m: 'profundo', f: 'profunda', tier: 2 },
  'superficial': { m: 'superficial', f: 'superficial', tier: 2 },
  'basal': { m: 'basal', f: 'basal', tier: 2 },
  'apical': { m: 'apical', f: 'apical', tier: 2 },
  'proximal': { m: 'proximal', f: 'proximal', tier: 2 },
  'distal': { m: 'distal', f: 'distal', tier: 2 },
  'upper': { m: 'superior', f: 'superior', tier: 2 },
  'lower': { m: 'inferior', f: 'inferior', tier: 2 },
  'common': { m: 'común', f: 'común', tier: 2 },
  'proper': { m: 'propio', f: 'propia', tier: 2 },

  // Tier 3: Laterality
  'right': { m: 'derecho', f: 'derecha', tier: 3 },
  'left': { m: 'izquierdo', f: 'izquierda', tier: 3 }
};

const ORDINAL_MAP: Record<string, { m: string; f: string }> = {
  'first': { m: 'primer', f: 'primera' },
  'second': { m: 'segundo', f: 'segunda' },
  'third': { m: 'tercer', f: 'tercera' },
  'fourth': { m: 'cuarto', f: 'cuarta' },
  'fifth': { m: 'quinto', f: 'quinta' },
  'sixth': { m: 'sexto', f: 'sexta' },
  'seventh': { m: 'séptimo', f: 'séptima' },
  'eighth': { m: 'octavo', f: 'octava' }
};

export function translateAnatomyName(englishName: string): string {
  const norm = englishName.toLowerCase().trim();
  if (!norm) return '';
  if (EXACT_TRANSLATIONS[norm]) return EXACT_TRANSLATIONS[norm];

  // Handle preposition "of"
  if (norm.includes(' of ')) {
    const parts = norm.split(' of ');
    const left = translateAnatomyName(parts[0]);
    const right = translateAnatomyName(parts.slice(1).join(' of '));
    const rightLower = right.toLowerCase();

    // Check if right has explicit article
    if (rightLower.startsWith('el ') || rightLower.startsWith('del ')) {
      return `${left} del ${right.slice(3).trim()}`;
    }
    if (rightLower.startsWith('la ')) {
      return `${left} de ${right}`;
    }

    // Determine article based on common masculine / feminine beginnings
    const isMascRight = [
      'corazón', 'hígado', 'cerebro', 'estómago', 'bazo', 'páncreas', 'fémur',
      'cráneo', 'esqueleto', 'prosencéfalo', 'antebrazo', 'brazo', 'pie', 'muslo',
      'maxilar', 'tórax', 'abdomen', 'cuello', 'tronco', 'seno', 'riñón', 'ojo',
      'oído', 'pulmón', 'recto', 'duodeno', 'esófago', 'pene', 'testículo'
    ].some(w => rightLower.startsWith(w));

    const isFemRight = [
      'aorta', 'mandíbula', 'cabeza', 'cara', 'mano', 'tibia', 'arteria', 'vena',
      'pared', 'pelvis', 'lengua', 'vejiga', 'vesícula', 'clavícula', 'escápula',
      'rótula', 'columna', 'zona', 'región', 'porción', 'cavidad', 'fosa'
    ].some(w => rightLower.startsWith(w));

    if (isMascRight) {
      return `${left} del ${right.charAt(0).toLowerCase() + right.slice(1)}`;
    }
    if (isFemRight) {
      return `${left} de la ${right.charAt(0).toLowerCase() + right.slice(1)}`;
    }
    return `${left} de ${right.charAt(0).toLowerCase() + right.slice(1)}`;
  }

  // Tokenize phrase
  const words = norm.split(/\s+/);
  let nounFound: NounMeta | null = null;

  // Try 2-word noun pairs first
  for (let i = 0; i < words.length - 1; i++) {
    const pair = `${words[i]} ${words[i + 1]}`;
    if (NOUN_MAP[pair]) {
      nounFound = NOUN_MAP[pair];
      words.splice(i, 2, '__NOUN__');
      break;
    }
  }

  // Then 1-word nouns
  if (!nounFound) {
    for (let i = 0; i < words.length; i++) {
      if (NOUN_MAP[words[i]]) {
        nounFound = NOUN_MAP[words[i]];
        words.splice(i, 1, '__NOUN__');
        break;
      }
    }
  }

  const isFem = nounFound ? nounFound.f : false;
  let prefix = '';
  const adjectives: { word: string; tier: number }[] = [];
  const leftovers: string[] = [];

  for (const w of words) {
    if (w === '__NOUN__') continue;
    if (ORDINAL_MAP[w]) {
      prefix = `${isFem ? ORDINAL_MAP[w].f : ORDINAL_MAP[w].m} `;
    } else if (ADJ_MAP[w]) {
      const meta = ADJ_MAP[w];
      adjectives.push({
        word: isFem ? meta.f : meta.m,
        tier: meta.tier
      });
    } else {
      leftovers.push(w);
    }
  }

  // Sort adjectives by linguistic tier: type -> position -> laterality
  adjectives.sort((a, b) => a.tier - b.tier);

  const baseNoun = nounFound ? nounFound.es : (leftovers.shift() || englishName);
  const adjStr = adjectives.map(a => a.word).join(' ');
  const leftoverStr = leftovers.join(' ');

  let result = prefix + baseNoun;
  if (adjStr) result += ` ${adjStr}`;
  if (leftoverStr) result += ` ${leftoverStr}`;

  result = result.trim();
  return result.charAt(0).toUpperCase() + result.slice(1);
}

export function translateConceptName(name: string, lang: Lang): string {
  if (lang === 'en') return name;
  return translateAnatomyName(name);
}

export function translatePartName(name: string, lang: Lang): string {
  if (lang === 'en') return name;
  return translateAnatomyName(name);
}

export function getConceptDisplayName(concept: Concept | null | undefined, lang: Lang): string {
  if (!concept) return '';
  return translateConceptName(concept.name, lang);
}

export function getPartDisplayName(part: Part | null | undefined, lang: Lang): string {
  if (!part) return '';
  return translatePartName(part.name, lang);
}
