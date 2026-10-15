import type {Atlas, Concept} from './anatomy';
import type {Lang} from './i18n';
import {translateConceptName} from './anatomy-translation';

export function normalizeText(s: string): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface SynonymEntry {
  terms: string[];
  targetIds: string[];
  label: string;
}

export const SYNONYM_ENTRIES: SynonymEntry[] = [
  // Corazón / Heart
  {
    terms: ['corazon', 'corazoncito', 'patata', 'miocardio', 'cardiaco', 'cardio', 'bomba cardiaca'],
    targetIds: ['FMA7088', 'FMA7165', 'FMA7166', 'FMA9496'],
    label: 'Corazón'
  },
  // Cerebro / Brain
  {
    terms: ['cerebro', 'sesos', 'coco', 'encefalo', 'mente', 'cabeza', 'materia gris'],
    targetIds: ['FMA50801', 'FMA55676', 'FMA61815'],
    label: 'Cerebro'
  },
  // Estómago / Stomach
  {
    terms: ['estomago', 'panza', 'vientre', 'barriga', 'mondongo', 'buche', 'guata'],
    targetIds: ['FMA7148'],
    label: 'Estómago'
  },
  // Cráneo / Skull
  {
    terms: ['craneo', 'calavera', 'chola', 'casco', 'morra', 'cabeza osea'],
    targetIds: ['FMA46565'],
    label: 'Cráneo'
  },
  // Hígado / Liver
  {
    terms: ['higado', 'hepatico', 'bife'],
    targetIds: ['FMA7197', 'FMA13365', 'FMA14495'],
    label: 'Hígado'
  },
  // Pulmones / Lungs
  {
    terms: ['pulmon', 'pulmones', 'bofe', 'bofes', 'pulmonar', 'respiratorio'],
    targetIds: ['FMA7309', 'FMA7310', 'FMA7333', 'FMA7337', 'FMA7370', 'FMA7371'],
    label: 'Pulmones'
  },
  // Riñones / Kidneys
  {
    terms: ['rinon', 'rinones', 'renal', 'renales', 'lomos'],
    targetIds: ['FMA7203', 'FMA7204', 'FMA7205'],
    label: 'Riñones'
  },
  // Bazo / Spleen
  {
    terms: ['bazo', 'esplenico'],
    targetIds: ['FMA7196'],
    label: 'Bazo'
  },
  // Páncreas / Pancreas
  {
    terms: ['pancreas', 'pancreatico'],
    targetIds: ['FMA7198'],
    label: 'Páncreas'
  },
  // Vejiga / Bladder
  {
    terms: ['vejiga', 'vejiga urinaria', 'orina', 'pis', 'vesical'],
    targetIds: ['FMA15900'],
    label: 'Vejiga urinaria'
  },
  // Tráquea / Trachea
  {
    terms: ['traquea', 'gaznate', 'viento', 'via aerea'],
    targetIds: ['FMA7394'],
    label: 'Tráquea'
  },
  // Diafragma / Diaphragm
  {
    terms: ['diafragma', 'musculo respiratorio'],
    targetIds: ['FMA13295'],
    label: 'Diafragma'
  },
  // Vesícula biliar / Gallbladder
  {
    terms: ['vesicula', 'vesicula biliar', 'hiel', 'colecisto'],
    targetIds: ['FMA7202'],
    label: 'Vesícula biliar'
  },
  // Fémur / Muslo
  {
    terms: ['femur', 'muslo', 'hueso del muslo'],
    targetIds: ['FMA9611', 'FMA24474', 'FMA24475'],
    label: 'Fémur'
  },
  // Tibia / Espinilla
  {
    terms: ['tibia', 'espinilla', 'canilla'],
    targetIds: ['FMA24476'],
    label: 'Tibia'
  },
  // Peroné / Fibula
  {
    terms: ['perone', 'fibula', 'pantorrilla', 'chamorro'],
    targetIds: ['FMA24479'],
    label: 'Peroné'
  },
  // Rótula / Patella
  {
    terms: ['rotula', 'patela', 'rodilla', 'choquezuela'],
    targetIds: ['FMA24485'],
    label: 'Rótula'
  },
  // Húmero / Brazo
  {
    terms: ['humero', 'brazo', 'hueso del brazo'],
    targetIds: ['FMA13303'],
    label: 'Húmero'
  },
  // Radio / Antebrazo
  {
    terms: ['radio', 'antebrazo'],
    targetIds: ['FMA23463'],
    label: 'Radio'
  },
  // Cúbito / Ulna / Codo
  {
    terms: ['cubito', 'ulna', 'codo', 'olecranon'],
    targetIds: ['FMA23466'],
    label: 'Cúbito'
  },
  // Escápula / Omóplato / Hombro
  {
    terms: ['escapula', 'omoplato', 'paleta', 'paletilla', 'hombro'],
    targetIds: ['FMA13394'],
    label: 'Escápula'
  },
  // Clavícula / Clavicle
  {
    terms: ['clavicula'],
    targetIds: ['FMA13321'],
    label: 'Clavícula'
  },
  // Esternón / Sternum / Pecho
  {
    terms: ['esternon', 'pecho', 'pechera', 'quijada del pecho', 'torax'],
    targetIds: ['FMA7485'],
    label: 'Esternón'
  },
  // Mandíbula / Mandible
  {
    terms: ['mandibula', 'quijada', 'menton', 'barbilla'],
    targetIds: ['FMA52748'],
    label: 'Mandíbula'
  },
  // Maxilar / Upper jaw
  {
    terms: ['maxilar', 'maxilar superior'],
    targetIds: ['FMA9711'],
    label: 'Maxilar superior'
  },
  // Dientes / Muelas / Teeth
  {
    terms: ['diente', 'dientes', 'muela', 'muelas', 'dentadura', 'colmillo', 'paleta'],
    targetIds: ['FMA55704', 'FMA55703', 'FMA55693'],
    label: 'Dientes / Muelas'
  },
  // Encía / Gingiva
  {
    terms: ['encia', 'encias'],
    targetIds: ['FMA59763', 'FMA59764'],
    label: 'Encía'
  },
  // Lengua / Tongue
  {
    terms: ['lengua', 'lingual'],
    targetIds: ['FMA54640'],
    label: 'Lengua'
  },
  // Ojo / Globo ocular / Eye
  {
    terms: ['ojo', 'ojos', 'vista', 'globo ocular'],
    targetIds: ['FMA59764'],
    label: 'Ojo'
  },
  // Próstata / Prostate
  {
    terms: ['prostata'],
    targetIds: ['FMA9600'],
    label: 'Próstata'
  },
  // Testículo / Testis
  {
    terms: ['testiculo', 'testiculos', 'huevos', 'cojones', 'pelotas', 'gonadas'],
    targetIds: ['FMA7210'],
    label: 'Testículo'
  },
  // Pene / Penis
  {
    terms: ['pene', 'miembro', 'falo'],
    targetIds: ['FMA19600'],
    label: 'Pene'
  },
  // Esófago / Esophagus
  {
    terms: ['esofago', 'tragadero'],
    targetIds: ['FMA7131'],
    label: 'Esófago'
  },
  // Duodeno / Duodenum
  {
    terms: ['duodeno'],
    targetIds: ['FMA7206'],
    label: 'Duodeno'
  },
  // Apéndice / Appendix
  {
    terms: ['apendice', 'apendice cecal', 'apendice vermiforme'],
    targetIds: ['FMA14542'],
    label: 'Apéndice'
  },
  // Recto / Rectum
  {
    terms: ['recto', 'trasero', 'ano'],
    targetIds: ['FMA14544'],
    label: 'Recto'
  },
  // Aorta
  {
    terms: ['aorta', 'arteria aorta', 'cayado'],
    targetIds: ['FMA3734', 'FMA3736', 'FMA3768', 'FMA3784'],
    label: 'Aorta'
  },
  // Cuello / Garganta / Laringe / Faringe
  {
    terms: ['cuello', 'pescuezo', 'garganta', 'laringe', 'faringe', 'nuez', 'manzana de adan'],
    targetIds: ['FMA55099'],
    label: 'Cartílago tiroides'
  }
];

export interface SearchResultItem {
  concept: Concept;
  displayName: string;
  matchedSynonym?: string;
}

export function searchConceptsWithSynonyms(
  atlas: Atlas | null,
  query: string,
  lang: Lang
): SearchResultItem[] {
  if (!atlas) return [];

  const rawTerm = query.trim();
  const normQ = normalizeText(rawTerm);

  // Default suggestions when no query is typed
  if (!normQ) {
    const defaultOrgans = [
      'heart',
      'brain',
      'liver',
      'stomach',
      'spleen',
      'pancreas',
      'urinary bladder',
      'trachea',
      'femur',
      'skull',
      'kidney',
      'right lung'
    ];

    return defaultOrgans
      .map(name => {
        const c = atlas.concepts.find(item => item.name.toLowerCase() === name);
        if (!c) return null;
        return {
          concept: c,
          displayName: translateConceptName(c.name, lang)
        };
      })
      .filter((x): x is SearchResultItem => !!x);
  }

  // Look for matching synonyms
  const matchedSynonymTargetIds = new Map<string, string>();
  for (const entry of SYNONYM_ENTRIES) {
    for (const term of entry.terms) {
      const normTerm = normalizeText(term);
      if (normTerm === normQ || normTerm.includes(normQ) || (normQ.length >= 4 && normTerm.startsWith(normQ))) {
        for (const id of entry.targetIds) {
          if (!matchedSynonymTargetIds.has(id)) {
            matchedSynonymTargetIds.set(id, entry.label);
          }
        }
      }
    }
  }

  const scored: { concept: Concept; score: number; displayName: string; matchedSynonym?: string }[] = [];

  for (const c of atlas.concepts) {
    const enName = c.name;
    const esName = translateConceptName(enName, 'es');
    const displayName = lang === 'es' ? esName : enName;

    const normEn = normalizeText(enName);
    const normEs = normalizeText(esName);
    const normId = normalizeText(c.id);

    let score = 0;
    const synLabel = matchedSynonymTargetIds.get(c.id);

    if (synLabel) {
      score += 900;
    }

    // Exact matches
    if (normEs === normQ || normEn === normQ) {
      score += 1000;
    } else if (normId === normQ) {
      score += 950;
    }
    // Prefix matches
    else if (normEs.startsWith(normQ) || normEn.startsWith(normQ)) {
      score += 650;
    }
    // Substring matches
    else if (normEs.includes(normQ) || normEn.includes(normQ)) {
      score += 400;
    }
    // Concept ID substring
    else if (normId.includes(normQ)) {
      score += 350;
    }
    // Word tokens match
    else {
      const qTokens = normQ.split(' ');
      const matchAllTokens = qTokens.length > 1 && qTokens.every(tok => normEs.includes(tok) || normEn.includes(tok));
      if (matchAllTokens) {
        score += 300;
      }
    }

    if (score > 0) {
      // Shorter names receive a slight bonus so main structures appear first
      const lengthBonus = Math.max(0, 80 - Math.min(displayName.length, 80));
      scored.push({
        concept: c,
        score: score + lengthBonus,
        displayName,
        matchedSynonym: synLabel
      });
    }
  }

  // Sort by score descending, then by length ascending
  scored.sort((a, b) => b.score - a.score || a.displayName.length - b.displayName.length);

  return scored.slice(0, 80).map(s => ({
    concept: s.concept,
    displayName: s.displayName,
    matchedSynonym: s.matchedSynonym
  }));
}
