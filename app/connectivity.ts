import { type Atlas, type Concept, type Part, type SystemId } from './anatomy';
import { translatePartName } from './anatomy-translation';
import { type Lang } from './i18n';

export type ConnectionDegree = 1 | 2 | 3 | 4;

export type ConnectionType = 
  | 'tendon_insertion'   // Músculo ↔ Hueso (Inserción tendinosa / Origen)
  | 'joint_articulation' // Hueso ↔ Hueso (Articulación / Ligamento)
  | 'vascular_pedicle'   // Órgano/Músculo ↔ Arteria / Vena
  | 'innervation'        // Estructura ↔ Nervio
  | 'visceral_continuity'// Órgano ↔ Órgano continuo (ej. Riñón-Uréter)
  | 'direct_contact'     // Contacto anatómico íntimo (0 mm)
  | 'immediate_neighbor' // Vecindad inmediata (< 20 mm)
  | 'regional_proximity';// Proximidad regional (< 50 mm)

export interface ConnectedStructure {
  id: string;             // Part ID or Concept ID
  conceptId?: string;
  name: string;
  translatedName: string;
  system: SystemId;
  distanceMm: number;     // Distancia mínima en mm entre bounding boxes
  centerDistanceMm: number; // Distancia entre centros en mm
  proximityScore: number; // 0 - 100%
  degree: ConnectionDegree;
  connectionType: ConnectionType;
  connectionLabel: string;
  isDirectContact: boolean;
}

// Bounding box distance calculation in meters
export function computeBoxDistance(b1: [number[], number[]], b2: [number[], number[]]): number {
  const dx = Math.max(0, b1[0][0] - b2[1][0], b2[0][0] - b1[1][0]);
  const dy = Math.max(0, b1[0][1] - b2[1][1], b2[0][1] - b1[1][1]);
  const dz = Math.max(0, b1[0][2] - b2[1][2], b2[0][2] - b1[1][2]);
  return Math.hypot(dx, dy, dz);
}

// Combined bounds for multiple parts
export function combineBounds(partsList: Part[]): [number[], number[]] {
  if (partsList.length === 0) return [[0, 0, 0], [0, 0, 0]];
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (const p of partsList) {
    for (let c = 0; c < 3; c++) {
      if (p.bounds[0][c] < min[c]) min[c] = p.bounds[0][c];
      if (p.bounds[1][c] > max[c]) max[c] = p.bounds[1][c];
    }
  }
  return [min, max];
}

// Center of a bounding box
export function boxCenter(b: [number[], number[]]): [number, number, number] {
  return [
    (b[0][0] + b[1][0]) * 0.5,
    (b[0][1] + b[1][1]) * 0.5,
    (b[0][2] + b[1][2]) * 0.5
  ];
}

/**
 * Determine connection degree & type between two anatomical systems & distance
 */
function classifyConnection(
  sys1: SystemId,
  sys2: SystemId,
  name1: string,
  name2: string,
  distanceMm: number,
  lang: Lang
): { degree: ConnectionDegree; type: ConnectionType; label: string } {
  const isEs = lang === 'es';
  const n1 = name1.toLowerCase();
  const n2 = name2.toLowerCase();

  // Muscle ↔ Skeleton: Tendon Insertion / Origin
  if ((sys1 === 'muscular' && sys2 === 'skeletal') || (sys1 === 'skeletal' && sys2 === 'muscular')) {
    if (distanceMm <= 12) {
      return {
        degree: 1,
        type: 'tendon_insertion',
        label: isEs ? 'Inserción / Origen Tendinoso' : 'Tendon Insertion / Origin'
      };
    }
  }

  // Skeleton ↔ Skeleton: Joint / Articulation
  if (sys1 === 'skeletal' && sys2 === 'skeletal') {
    if (distanceMm <= 15) {
      return {
        degree: 1,
        type: 'joint_articulation',
        label: isEs ? 'Articulación Ósea' : 'Joint Articulation'
      };
    }
  }

  // Structure ↔ Vascular (Arterial / Venous): Pedicle / Irrigation
  if (sys1 === 'arterial' || sys2 === 'arterial') {
    if (distanceMm <= 20) {
      return {
        degree: 1,
        type: 'vascular_pedicle',
        label: isEs ? 'Irrigación Arterial' : 'Arterial Supply'
      };
    }
  }
  if (sys1 === 'venous' || sys2 === 'venous') {
    if (distanceMm <= 20) {
      return {
        degree: 1,
        type: 'vascular_pedicle',
        label: isEs ? 'Drenaje Venoso' : 'Venous Drainage'
      };
    }
  }

  // Structure ↔ Nervous: Innervation
  if (sys1 === 'nervous' || sys2 === 'nervous') {
    if (distanceMm <= 20) {
      return {
        degree: 1,
        type: 'innervation',
        label: isEs ? 'Inervación Nerviosa' : 'Neural Innervation'
      };
    }
  }

  // Organ ↔ Organ of the same visceral system (Urinary, Digestive, Respiratory, Cardiac)
  if (
    sys1 === sys2 &&
    ['urinary', 'digestive', 'respiratory', 'cardiac'].includes(sys1)
  ) {
    if (distanceMm <= 25) {
      return {
        degree: 1,
        type: 'visceral_continuity',
        label: isEs ? 'Continuidad Visceral / Conducto' : 'Visceral Continuity / Duct'
      };
    }
  }

  // Direct contact
  if (distanceMm <= 2) {
    return {
      degree: 2,
      type: 'direct_contact',
      label: isEs ? 'Contacto Directo (0 mm)' : 'Direct Contact (0 mm)'
    };
  }

  // Immediate neighbor
  if (distanceMm <= 20) {
    return {
      degree: 3,
      type: 'immediate_neighbor',
      label: isEs ? 'Vecindad Inmediata' : 'Immediate Proximity'
    };
  }

  // Regional proximity
  return {
    degree: 4,
    type: 'regional_proximity',
    label: isEs ? 'Proximidad Regional' : 'Regional Proximity'
  };
}

/**
 * Find all connected and neighboring structures for a selected concept or part
 */
export function findConnectedStructures(
  targetElementIds: string[],
  atlas: Atlas,
  lang: Lang = 'es',
  limit: number = 30
): ConnectedStructure[] {
  if (!atlas || !atlas.parts || targetElementIds.length === 0) return [];

  const targetIdSet = new Set(targetElementIds);
  const targetParts = atlas.parts.filter(p => targetIdSet.has(p.id));
  if (targetParts.length === 0) return [];

  const targetBounds = combineBounds(targetParts);
  const targetCenter = boxCenter(targetBounds);
  const targetPrimarySystem = targetParts[0].system;
  const targetName = targetParts[0].name;

  // Group candidate parts by concept or part to avoid excessive duplicate subdivisions
  const conceptByElement = new Map<string, Concept>();
  if (atlas.concepts) {
    for (const c of atlas.concepts) {
      for (const elId of c.elements) {
        if (!conceptByElement.has(elId)) {
          conceptByElement.set(elId, c);
        }
      }
    }
  }

  const results: ConnectedStructure[] = [];
  const processedKeys = new Set<string>();

  for (const p of atlas.parts) {
    if (targetIdSet.has(p.id)) continue;
    // Skip general surface skin for proximity analysis
    if (p.system === 'integumentary') continue;

    const concept = conceptByElement.get(p.id);
    const key = concept ? concept.id : p.id;
    if (processedKeys.has(key)) continue;

    const distM = computeBoxDistance(targetBounds, p.bounds);
    const distMm = Math.round(distM * 1000);

    // Filter within 140 mm (14 cm) radius
    if (distMm > 140) continue;

    const pCenter = boxCenter(p.bounds);
    const centerDistM = Math.hypot(
      targetCenter[0] - pCenter[0],
      targetCenter[1] - pCenter[1],
      targetCenter[2] - pCenter[2]
    );
    const centerDistMm = Math.round(centerDistM * 1000);

    // Calculate proximity score: 100% down to ~15%
    let proximityScore: number;
    if (distMm <= 1) {
      proximityScore = Math.max(90, Math.min(100, 100 - Math.round(centerDistMm * 0.05)));
    } else {
      proximityScore = Math.max(10, Math.round(100 * Math.exp(-distM / 0.055)));
    }

    const { degree, type, label } = classifyConnection(
      targetPrimarySystem,
      p.system,
      targetName,
      p.name,
      distMm,
      lang
    );

    const displayName = concept?.name || p.name;
    const translatedName = translatePartName(displayName, lang);

    results.push({
      id: p.id,
      conceptId: concept?.id,
      name: displayName,
      translatedName,
      system: p.system,
      distanceMm: distMm,
      centerDistanceMm: centerDistMm,
      proximityScore,
      degree,
      connectionType: type,
      connectionLabel: label,
      isDirectContact: distMm <= 2
    });

    processedKeys.add(key);
  }

  // Sort by priority: Degree (1 = mechanical/functional first), then distanceMm, then proximityScore
  results.sort((a, b) => {
    if (a.degree !== b.degree) return a.degree - b.degree;
    if (a.distanceMm !== b.distanceMm) return a.distanceMm - b.distanceMm;
    return b.proximityScore - a.proximityScore;
  });

  return results.slice(0, limit);
}
