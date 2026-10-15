import * as T from 'three';
import type { Concept, Atlas, SystemId } from './anatomy';
import { SYSTEMS } from './anatomy';

const partGeometries = new Map<string, T.BufferGeometry>();
const thumbnailCache = new Map<string, string>();
const listeners = new Set<() => void>();

let sharedRenderer: T.WebGLRenderer | null = null;
let sharedScene: T.Scene | null = null;
let sharedCamera: T.PerspectiveCamera | null = null;

function getSharedThreeContext() {
  if (typeof window === 'undefined') return null;
  if (!sharedRenderer) {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 112;
      canvas.height = 112;
      sharedRenderer = new T.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
        preserveDrawingBuffer: true
      });
      sharedRenderer.setSize(112, 112);
      sharedRenderer.setPixelRatio(1);
      sharedRenderer.setClearColor(0x000000, 0);

      sharedScene = new T.Scene();
      sharedCamera = new T.PerspectiveCamera(32, 1, 0.005, 50);

      const hemi = new T.HemisphereLight(0xffffff, 0x8899aa, 1.6);
      const key = new T.DirectionalLight(0xfff8ee, 2.2);
      key.position.set(1.5, 2.5, 2.5);
      const fill = new T.DirectionalLight(0xddf0ff, 1.2);
      fill.position.set(-2, 1, -2);

      sharedScene.add(hemi, key, fill);
    } catch {
      return null;
    }
  }
  return { renderer: sharedRenderer, scene: sharedScene!, camera: sharedCamera! };
}

let notifyScheduled = false;
function scheduleNotify() {
  if (notifyScheduled) return;
  notifyScheduled = true;
  setTimeout(() => {
    notifyScheduled = false;
    listeners.forEach(fn => fn());
  }, 60);
}

export function subscribeThumbnails(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function registerPartGeometry(partId: string, geometry: T.BufferGeometry): void {
  partGeometries.set(partId, geometry);
  scheduleNotify();
}

export function hasPartGeometry(partId: string): boolean {
  return partGeometries.has(partId);
}

export function getConceptThumbnailUrl(
  concept: Concept,
  atlas: Atlas | null,
  customColor?: string
): string | null {
  if (!concept || !concept.elements || concept.elements.length === 0) return null;

  const cacheKey = `${concept.id}:${customColor || 'default'}`;
  if (thumbnailCache.has(cacheKey)) {
    return thumbnailCache.get(cacheKey)!;
  }

  const ctx = getSharedThreeContext();
  if (!ctx) return null;

  // Collect available geometries for this concept
  const availableParts: { id: string; geometry: T.BufferGeometry; system: SystemId }[] = [];
  const partsMap = atlas ? new Map(atlas.parts.map(p => [p.id, p])) : null;

  for (const elemId of concept.elements) {
    const geo = partGeometries.get(elemId);
    if (geo) {
      const partInfo = partsMap?.get(elemId);
      availableParts.push({
        id: elemId,
        geometry: geo,
        system: partInfo?.system ?? 'skeletal'
      });
    }
  }

  if (availableParts.length === 0) {
    return null;
  }

  const { renderer, scene, camera } = ctx;

  // Create temporary meshes and compute collective bounds
  const meshes: T.Mesh[] = [];
  const collectiveBox = new T.Box3();

  for (const item of availableParts) {
    const colorHex = customColor || SYSTEMS.find(s => s.id === item.system)?.color || '#c4b78a';
    const mat = new T.MeshStandardMaterial({
      color: new T.Color(colorHex),
      metalness: 0.1,
      roughness: 0.46,
      side: T.DoubleSide
    });

    const mesh = new T.Mesh(item.geometry, mat);
    meshes.push(mesh);
    scene.add(mesh);

    if (item.geometry.boundingBox) {
      collectiveBox.union(item.geometry.boundingBox);
    } else {
      item.geometry.computeBoundingBox();
      if (item.geometry.boundingBox) collectiveBox.union(item.geometry.boundingBox);
    }
  }

  if (collectiveBox.isEmpty()) {
    meshes.forEach(m => {
      scene.remove(m);
      (m.material as T.Material).dispose();
    });
    return null;
  }

  const center = collectiveBox.getCenter(new T.Vector3());
  const size = collectiveBox.getSize(new T.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 0.015);

  const fovRad = T.MathUtils.degToRad(camera.fov / 2);
  const distance = (maxDim / 2 / Math.tan(fovRad)) * 1.35;

  camera.position.set(
    center.x + distance * 0.35,
    center.y + distance * 0.22,
    center.z + distance * 0.92
  );
  camera.lookAt(center);
  camera.updateMatrixWorld();

  renderer.render(scene, camera);
  const dataUrl = renderer.domElement.toDataURL('image/png');

  // Clean up
  meshes.forEach(m => {
    scene.remove(m);
    (m.material as T.Material).dispose();
  });

  thumbnailCache.set(cacheKey, dataUrl);
  return dataUrl;
}
