import {flushSync} from 'react-dom';
import {registerAtlasTools} from './agent-tools';
import {useEffect, useMemo, useRef, useState} from 'react';
import {
  Activity,
  ArrowUpRight,
  Bone,
  Brain,
  ChevronRight,
  Droplets,
  Dumbbell,
  Eye,
  EyeOff,
  Focus,
  GripHorizontal,
  GripVertical,
  Heart,
  Info,
  Languages,
  Layers,
  Layers3,
  Maximize2,
  Minimize2,
  Minus,
  Move,
  PanelLeft,
  PanelRight,
  Moon,
  Pause,
  RotateCcw,
  RotateCw,
  Search,
  Sun,
  X
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Slider} from '@/components/ui/slider';
import {Switch} from '@/components/ui/switch';
import {Sheet, SheetContent, SheetTitle, SheetDescription} from '@/components/ui/sheet';
import {Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem, ComboboxEmpty} from '@/components/ui/combobox';
import AnatomyScene from './scene';
import {DEFAULT_VISIBLE, SYSTEMS, type Atlas, type Concept, type SceneState, type SystemId, type View} from './anatomy';
import {type Lang, DEFAULT_LANG, UI_TEXT, SYSTEMS_I18N, EXPLANATIONS_I18N, getExplanation, type SystemInfo} from './i18n';
import {translateConceptName, translatePartName} from './anatomy-translation';
import {searchConceptsWithSynonyms, type SearchResultItem} from './synonyms';
import {getSystemIcon} from './system-icon';
import {PieceThumbnail} from './piece-thumbnail';
import {findConnectedStructures, type ConnectedStructure} from './connectivity';
import {usePanelDockManager} from './dock-manager';

const DEFAULT_SYSTEM_ORDER: SystemId[] = [
  'skeletal',
  'muscular',
  'cardiac',
  'sensory',
  'arterial',
  'venous',
  'nervous',
  'respiratory',
  'digestive',
  'urinary',
  'lymphatic',
  'endocrine',
  'reproductive',
  'integumentary',
  'connective'
];

const initial: SceneState = {
  explode: 0,
  visible: DEFAULT_VISIBLE,
  selected: [],
  isolate: false,
  view: 'three-quarter',
  rotate: false,
  reset: 0
};

export default function Home() {
  const detailTitle = useRef<HTMLHeadingElement>(null);
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('human_atlas_lang');
      if (saved === 'es' || saved === 'en') return saved;
    }
    return DEFAULT_LANG;
  });

  const [systemOrder, setSystemOrder] = useState<SystemId[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('anatomy_systems_order');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const unique = Array.from(new Set([...parsed, ...DEFAULT_SYSTEM_ORDER])) as SystemId[];
            return unique;
          }
        }
      } catch {}
    }
    return DEFAULT_SYSTEM_ORDER;
  });

  const [draggingId, setDraggingId] = useState<SystemId | null>(null);
  const [dragOverId, setDragOverId] = useState<SystemId | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);

  const [atlas, setAtlas] = useState<Atlas | null>(null);
  const [state, setState] = useState(initial);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [panel, setPanel] = useState<'layers' | 'search' | null>(null);
  const [details, setDetails] = useState(false);
  const [about, setAbout] = useState(false);
  const [query, setQuery] = useState('');
  const [chosen, setChosen] = useState<Concept | null>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('human_atlas_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'light';
  });

  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDockRef = useRef<HTMLDivElement>(null);

  const t = UI_TEXT[lang];
  const currentSystems = SYSTEMS_I18N[lang];

  // Floating Draggable Right HUD Dock
  const [rightDockPos, setRightDockPos] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const rightDragRef = useRef<{ startX: number; startY: number; initX: number; initY: number; pointerId: number } | null>(null);

  const [activeRelatedItemIds, setActiveRelatedItemIds] = useState<Set<string>>(new Set());
  const [isRelationalIsolate, setIsRelationalIsolate] = useState(false);

  // Unified Panel Docking, Floating, Resizing & Collision Manager
  const {
    panelStates,
    activeSnapZone,
    draggingPanelId,
    resizingPanelId,
    dockTo,
    toggleExpand,
    toggleMinimize,
    bringToFront,
    handleDragStart: handlePanelDragStart,
    handleDragMove: handlePanelDragMove,
    handleDragEnd: handlePanelDragEnd,
    handleResizeStart,
    handleResizeMove,
    handleResizeEnd,
    computeLayouts,
    computeSceneInsets,
  } = usePanelDockManager({
    layers: panel !== null,
    detail: details && (chosen !== null || state.selected.length > 0),
  });

  const isDetailOpen = details && (chosen !== null || state.selected.length > 0);
  const isLayersOpen = panel === 'layers' || (typeof window !== 'undefined' && window.innerWidth >= 768);

  const layouts = useMemo(() => {
    return computeLayouts({
      layers: isLayersOpen,
      detail: isDetailOpen,
    });
  }, [computeLayouts, isLayersOpen, isDetailOpen]);

  const sceneInsets = useMemo(() => {
    return computeSceneInsets({
      layers: isLayersOpen,
      detail: isDetailOpen,
    });
  }, [computeSceneInsets, isLayersOpen, isDetailOpen]);

  const activeRelatedPartIds = useMemo(() => {
    if (activeRelatedItemIds.size === 0 || !atlas) return [];
    const partIds: string[] = [];
    activeRelatedItemIds.forEach(id => {
      const c = atlas.concepts.find(x => x.id === id);
      if (c) {
        partIds.push(...c.elements);
      } else {
        partIds.push(id);
      }
    });
    return partIds;
  }, [activeRelatedItemIds, atlas]);

  const sceneStateComputed = useMemo<SceneState>(() => {
    return {
      ...state,
      relatedSelected: activeRelatedPartIds,
      relationalIsolate: isRelationalIsolate && activeRelatedPartIds.length > 0
    };
  }, [state, activeRelatedPartIds, isRelationalIsolate]);

  const toggleRelatedItem3D = (item: ConnectedStructure) => {
    setActiveRelatedItemIds(prev => {
      const next = new Set(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.add(item.id);
      }
      setIsRelationalIsolate(next.size > 0);
      return next;
    });
  };

  const toggleAllRelated3D = () => {
    const allIds = filteredConnectedList.map(x => x.id);
    const allActive = allIds.length > 0 && allIds.every(id => activeRelatedItemIds.has(id));
    if (allActive) {
      setActiveRelatedItemIds(new Set());
      setIsRelationalIsolate(false);
    } else {
      setActiveRelatedItemIds(new Set(allIds));
      setIsRelationalIsolate(true);
    }
  };

  const handleRightPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, input, [role="slider"]')) return;
    const dockEl = e.currentTarget.closest('.right-hud-dock') as HTMLElement;
    if (!dockEl) return;
    const rect = dockEl.getBoundingClientRect();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    rightDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: rect.left,
      initY: rect.top,
      pointerId: e.pointerId
    };
    setIsDraggingRight(true);
  };

  const handleRightPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRight || !rightDragRef.current) return;
    const dx = e.clientX - rightDragRef.current.startX;
    const dy = e.clientY - rightDragRef.current.startY;
    const newX = Math.max(10, Math.min(window.innerWidth - 85, rightDragRef.current.initX + dx));
    const newY = Math.max(10, Math.min(window.innerHeight - 380, rightDragRef.current.initY + dy));
    setRightDockPos({ x: newX, y: newY });
  };

  const handleRightPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (rightDragRef.current) {
      try {
        (e.target as HTMLElement).releasePointerCapture(rightDragRef.current.pointerId);
      } catch {}
      rightDragRef.current = null;
    }
    setIsDraggingRight(false);
  };



  const changeLang = (next: Lang) => {
    setLang(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('human_atlas_lang', next);
    }
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('human_atlas_theme', next);
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      document.body.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  const saveSystemOrder = (newOrder: SystemId[]) => {
    setSystemOrder(newOrder);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('anatomy_systems_order', JSON.stringify(newOrder));
      } catch {}
    }
  };

  const resetSystemOrder = () => {
    saveSystemOrder(DEFAULT_SYSTEM_ORDER);
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.title = lang === 'es' ? 'Atlas Humano 3D' : 'Human Atlas 3D';
    }
  }, [lang]);

  useEffect(() => {
    const abort = new AbortController();
    setProgress(0);
    setError('');
    setAtlas(null);
    setChosen(null);
    setDetails(false);
    setState({ ...initial, visible: DEFAULT_VISIBLE });
    fetch('/models/atlas.json', { signal: abort.signal })
      .then(r => {
        if (!r.ok) throw new Error(t.webglError);
        return r.json();
      })
      .then(data => setAtlas(data as Atlas))
      .catch(e => {
        if (e.name !== 'AbortError') setError(e.message);
      });
    return () => abort.abort();
  }, [t.webglError]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === '/' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchFocused(true);
      }
      if (e.key === 'Escape') {
        setSearchFocused(false);
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchDockRef.current && !searchDockRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const parts = useMemo(() => new Map(atlas?.parts.map(p => [p.id, p])), [atlas]);
  const counts = useMemo(
    () => Object.fromEntries(SYSTEMS.map(s => [s.id, atlas?.parts.filter(p => p.system === s.id).length ?? 0])),
    [atlas]
  );

  const activeSystems = useMemo(() => {
    const map = new Map(currentSystems.map(s => [s.id, s]));
    return systemOrder
      .map(id => map.get(id))
      .filter((s): s is SystemInfo => !!s && (counts[s.id] ?? 0) > 0);
  }, [currentSystems, systemOrder, counts]);

  const selectedParts = state.selected.map(id => parts.get(id)).filter(p => !!p);
  const selected = selectedParts[0];
  const system = currentSystems.find(s => s.id === selected?.system);
  const chosenDisplayName = chosen ? translateConceptName(chosen.name, lang) : '';

  const [connFilter, setConnFilter] = useState<'all' | 'skeletal' | 'muscular' | 'visceral' | 'vascular' | 'nervous'>('all');

  const targetElementIds = useMemo(() => {
    if (chosen && chosen.elements && chosen.elements.length > 0) return chosen.elements;
    if (state.selected && state.selected.length > 0) return state.selected;
    return [];
  }, [chosen, state.selected]);

  const connectedList = useMemo(() => {
    if (!atlas || targetElementIds.length === 0) return [];
    return findConnectedStructures(targetElementIds, atlas, lang, 36);
  }, [targetElementIds, atlas, lang]);

  const filteredConnectedList = useMemo(() => {
    if (connFilter === 'all') return connectedList;
    if (connFilter === 'skeletal') return connectedList.filter(x => x.system === 'skeletal');
    if (connFilter === 'muscular') return connectedList.filter(x => x.system === 'muscular');
    if (connFilter === 'visceral') {
      return connectedList.filter(x =>
        ['cardiac', 'digestive', 'urinary', 'respiratory', 'endocrine', 'reproductive', 'sensory'].includes(x.system)
      );
    }
    if (connFilter === 'vascular') return connectedList.filter(x => ['arterial', 'venous', 'lymphatic'].includes(x.system));
    if (connFilter === 'nervous') return connectedList.filter(x => x.system === 'nervous');
    return connectedList;
  }, [connectedList, connFilter]);

  const visibleCount =
    atlas?.parts.filter(p =>
      state.isolate
        ? state.selected.includes(p.id)
        : state.visible.includes(p.system) || state.selected.includes(p.id)
    ).length ?? 0;

  const results = useMemo(() => {
    return searchConceptsWithSynonyms(atlas, query, lang);
  }, [atlas, query, lang]);

  const choose = (c: Concept) => {
    setChosen(c);
    setState(s => ({ ...s, selected: c.elements, isolate: false, rotate: false }));
    setActiveRelatedItemIds(new Set());
    setIsRelationalIsolate(false);
    setDetails(true);
    setSearchFocused(false);
    setQuery('');
    setPanel(null);
  };

  useEffect(() => {
    if (!atlas) return;
    return registerAtlasTools(atlas, c => flushSync(() => choose(c)));
  }, [atlas]);

  const choosePart = (id: string) => {
    const p = parts.get(id);
    if (!p) return;
    setChosen({ id: p.conceptId, name: p.name, elements: [id] });
    setState(s => ({ ...s, selected: [id], isolate: false, rotate: false }));
    setActiveRelatedItemIds(new Set());
    setIsRelationalIsolate(false);
    setDetails(true);
    setSearchFocused(false);
    setQuery('');
    setPanel(null);
  };

  const toggle = (id: SystemId) => {
    setDetails(false);
    setState(s => ({
      ...s,
      selected: [],
      isolate: false,
      visible: s.visible.includes(id) ? s.visible.filter(x => x !== id) : [...s.visible, id]
    }));
  };

  const reset = () => {
    setState(s => ({ ...initial, visible: DEFAULT_VISIBLE, reset: s.reset + 1 }));
    setChosen(null);
    setDetails(false);
    setPanel(null);
    setActiveRelatedItemIds(new Set());
    setIsRelationalIsolate(false);
  };

  const openPanel = (next: 'layers' | 'search') => {
    setDetails(false);
    setPanel(p => (p === next ? null : next));
  };

  // Drag and drop handlers for reordering systems
  const handleDragStart = (e: React.DragEvent, id: SystemId) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: SystemId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (id === draggingId) return;

    const targetRect = e.currentTarget.getBoundingClientRect();
    const relY = e.clientY - targetRect.top;
    const isAfter = relY > targetRect.height / 2;

    setDragOverId(id);
    setDropPosition(isAfter ? 'after' : 'before');
  };

  const handleDragLeave = (e: React.DragEvent, id: SystemId) => {
    if (dragOverId === id) {
      setDragOverId(null);
      setDropPosition(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: SystemId) => {
    e.preventDefault();
    const sourceId = draggingId || (e.dataTransfer.getData('text/plain') as SystemId);
    if (!sourceId || sourceId === targetId) {
      setDraggingId(null);
      setDragOverId(null);
      setDropPosition(null);
      return;
    }

    const nextOrder = [...systemOrder];
    const fromIdx = nextOrder.indexOf(sourceId);
    if (fromIdx === -1) return;
    nextOrder.splice(fromIdx, 1);

    let toIdx = nextOrder.indexOf(targetId);
    if (dropPosition === 'after') {
      toIdx += 1;
    }
    nextOrder.splice(toIdx, 0, sourceId);

    saveSystemOrder(nextOrder);
    setDraggingId(null);
    setDragOverId(null);
    setDropPosition(null);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverId(null);
    setDropPosition(null);
  };

  return (
    <main className="studio">
      {atlas && (
        <AnatomyScene
          atlas={atlas}
          state={{ ...sceneStateComputed, inspectorOpen: isDetailOpen, panelInsets: sceneInsets }}
          lang={lang}
          theme={theme}
          onSelect={choosePart}
          onProgress={n => {
            setProgress(n);
            if (n === 100) setError('');
          }}
          onError={setError}
        />
      )}
      <div className="vignette" />

      {/* Unified Compact Top Bar (Title and action controls in a single clean layer) */}
      <header className="studio-top-bar glass" aria-label="Top navigation">
        <div className="top-bar-brand-group">
          <div className="top-bar-brand-title">
            <span className="status-dot" />
            <span className="brand-heading">{t.title}</span>
            <Badge variant="outline" className="edition-badge">
              {t.edition}
            </Badge>
          </div>
          <div className="top-bar-meta-row">
            <span className="top-bar-eyebrow">{t.eyebrow}</span>
            <span className="meta-sep">·</span>
            <span className="meta-count">
              {atlas ? t.piecesModeled(atlas.parts.length) : t.piecesModeled(2234)}
            </span>
          </div>
        </div>

        <nav className="top-bar-actions" aria-label="Atlas top actions">
          {/* Improved Language Switcher */}
          <div className="lang-switcher" role="radiogroup" aria-label={t.langPillsAria}>
            <div className="lang-icon-wrap" title={t.langPillsAria}>
              <Languages size={13} />
            </div>
            <div className="lang-segmented">
              <button
                type="button"
                role="radio"
                aria-checked={lang === 'es'}
                className={`lang-pill ${lang === 'es' ? 'active' : ''}`}
                onClick={() => changeLang('es')}
                title="Cambiar a Español"
              >
                ES
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={lang === 'en'}
                className={`lang-pill ${lang === 'en' ? 'active' : ''}`}
                onClick={() => changeLang('en')}
                title="Switch to English"
              >
                EN
              </button>
            </div>
          </div>

          {/* Dark mode toggle (persisted in session) */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'light' ? t.darkMode : t.lightMode}
            aria-label={theme === 'light' ? t.darkMode : t.lightMode}
          >
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} style={{ color: '#f59e0b' }} />}
          </button>

          <Button
            variant="ghost"
            className="icon-button"
            aria-label={t.aboutAtlas}
            title={t.aboutAtlas}
            onClick={() => {
              setDetails(false);
              setPanel(null);
              setAbout(true);
            }}
          >
            <Info size={17} />
          </Button>
        </nav>
      </header>

      {/* Lateral Dock Snap Indicator Zones (visible only while dragging a panel) */}
      {draggingPanelId && (
        <>
          <div className={`dock-snap-zone left ${activeSnapZone === 'left' ? 'is-active' : ''}`}>
            <div className="dock-snap-badge">
              <PanelLeft size={18} />
              <span>{lang === 'es' ? 'Borde Lateral Izquierdo' : 'Left Lateral Dock'}</span>
            </div>
          </div>
          <div className={`dock-snap-zone right ${activeSnapZone === 'right' ? 'is-active' : ''}`}>
            <div className="dock-snap-badge">
              <PanelRight size={18} />
              <span>{lang === 'es' ? 'Borde Lateral Derecho' : 'Right Lateral Dock'}</span>
            </div>
          </div>
        </>
      )}

      {/* Floating HUD View & Camera Tools Dock (Movable & Draggable) */}
      <aside
        className={`right-hud-dock glass ${isDraggingRight ? 'is-dragging' : ''}`}
        aria-label={t.cameraControls}
        style={
          rightDockPos
            ? { left: `${rightDockPos.x}px`, top: `${rightDockPos.y}px`, right: 'auto', bottom: 'auto' }
            : (isDetailOpen && panelStates.detail?.dock === 'right' && !layouts.detail?.isMinimized)
              ? { right: `${(layouts.detail?.width || 336) + 12}px` }
              : undefined
        }
      >
        {/* Top edge drag handle with noticeable design change */}
        <div
          className="hud-drag-handle"
          onPointerDown={handleRightPointerDown}
          onPointerMove={handleRightPointerMove}
          onPointerUp={handleRightPointerUp}
          onPointerCancel={handleRightPointerUp}
          onDoubleClick={() => setRightDockPos(null)}
          title={t.dragToMoveControls}
        >
          <GripHorizontal size={14} className="hud-drag-icon" />
          <span className="hud-drag-status">{isDraggingRight ? 'Moviendo…' : 'Mover'}</span>
        </div>

        {/* Section 1: Views (¾, F, L, P with clear descriptive labels so "L", "P", etc. are immediately understood) */}
        <div className="hud-views-section" role="group" aria-label={t.cameraControls}>
          {(['three-quarter', 'front', 'side', 'back'] as View[]).map((v, i) => {
            const viewItem = t.views[i];
            const isActive = state.view === v;
            const tag = (viewItem as any).tag || viewItem.label;
            return (
              <button
                key={v}
                type="button"
                className={`hud-view-btn ${isActive ? 'active' : ''}`}
                aria-pressed={isActive}
                disabled={state.explode > 0.8 && v !== 'front'}
                onClick={() => setState(s => ({ ...s, view: v, reset: s.reset + 1, rotate: false }))}
                title={viewItem.name}
                aria-label={viewItem.name}
              >
                <span className="hud-view-letter">{viewItem.label}</span>
                <span className="hud-view-tag">{tag}</span>
              </button>
            );
          })}
        </div>

        <div className="hud-divider" />

        {/* Camera Quick Tools (Auto rotate & reset view) */}
        <div className="hud-tools-row">
          <button
            type="button"
            className={`hud-tool-btn ${state.rotate ? 'active' : ''}`}
            disabled={state.explode >= 0.4}
            onClick={() => setState(s => ({ ...s, rotate: !s.rotate }))}
            title={t.autoRotate}
            aria-label={state.rotate ? t.pauseRotation : t.rotateBody}
          >
            {state.rotate ? <Pause size={15} /> : <RotateCw size={15} />}
          </button>
          <button
            type="button"
            className="hud-tool-btn"
            onClick={reset}
            title={t.reset}
            aria-label={t.resetViewAndLayers}
          >
            <RotateCcw size={15} />
          </button>
        </div>

        <div className="hud-divider" />

        {/* Section 2: Explode / Displacement Slider */}
        <div className="hud-explode-section" title={t.verticalExplodeDesc}>
          <div className="hud-explode-header">
            <span className="hud-explode-title">{t.verticalExplode}</span>
            <span className="hud-explode-badge">{Math.round(state.explode * 100)}%</span>
          </div>
          <div className="hud-slider-wrap">
            <div className="hud-slider-line-guide" aria-hidden="true">
              <div className="guide-ticks">
                <span className="guide-tick tick-top">100%</span>
                <span className="guide-tick tick-mid">50%</span>
                <span className="guide-tick tick-bot">0%</span>
              </div>
            </div>
            <Slider
              orientation="vertical"
              aria-label={t.explodeAnatomy}
              min={0}
              max={100}
              step={1}
              value={[state.explode * 100]}
              onValueChange={v => {
                const val = (Array.isArray(v) ? v[0] : v) / 100;
                setState(s => ({
                  ...s,
                  explode: val,
                  view: val > 0.8 ? 'front' : s.view,
                  rotate: false
                }));
              }}
            />
          </div>
          <button
            type="button"
            className="hud-explode-reset"
            onClick={() => setState(s => ({ ...s, explode: 0 }))}
            title={t.assembled}
            aria-label={t.resetExplode}
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </aside>

      {/* Layers panel (Systems) */}
      {isLayersOpen && (
        layouts.layers?.isMinimized ? (
          <aside
            className={`panel-mini-dock layers-mini-dock glass ${
              panelStates.layers?.dock === 'right' ? 'dock-right' : 'dock-left'
            }`}
            style={layouts.layers.style}
            onClick={() => toggleMinimize('layers')}
            title={lang === 'es' ? 'Restaurar Sistemas' : 'Restore Systems'}
            role="button"
            tabIndex={0}
          >
            <button
              type="button"
              className="mini-dock-restore-btn"
              onClick={(e) => {
                e.stopPropagation();
                toggleMinimize('layers');
              }}
              title={lang === 'es' ? 'Expandir Sistemas' : 'Expand Systems'}
              aria-label="Expand Systems"
            >
              <Layers3 size={15} />
            </button>
            <div className="mini-dock-label-wrap">
              <span className="mini-dock-label-text">{t.systems}</span>
            </div>
            <span className="mini-dock-count-badge">{visibleCount}</span>
          </aside>
        ) : (
          <section
            className={`layers-panel glass ${panel === 'layers' ? 'mobile-open' : ''} ${
              panelStates.layers?.dock === 'float' ? 'is-floating-panel' : ''
            } ${
              draggingPanelId === 'layers' ? 'is-dragging-panel' : ''
            } ${resizingPanelId === 'layers' ? 'is-resizing-panel' : ''}`}
            aria-label={t.layersAria}
            style={layouts.layers?.style}
            onPointerDown={() => bringToFront('layers')}
          >
        {/* Top window bar with drag title, dock controls and expand */}
        <div
          className="panel-window-bar"
          onPointerDown={e => handlePanelDragStart('layers', e)}
          onPointerMove={handlePanelDragMove}
          onPointerUp={handlePanelDragEnd}
          onPointerCancel={handlePanelDragEnd}
          title={t.dragToMovePanel}
        >
          <div className="panel-drag-title">
            <GripHorizontal size={14} className="panel-drag-icon" />
            <span className="panel-drag-text">
              {draggingPanelId === 'layers'
                ? (lang === 'es' ? 'Moviendo Sistemas…' : 'Moving Systems…')
                : t.systems}
            </span>
          </div>
          <div className="panel-window-controls" onPointerDown={e => e.stopPropagation()}>
            <button
              type="button"
              className={`panel-ctrl-btn ${panelStates.layers?.dock === 'left' ? 'is-active' : ''}`}
              onClick={() => dockTo('layers', 'left')}
              title={lang === 'es' ? 'Acoplar al lateral izquierdo' : 'Dock left'}
              aria-label="Dock left"
            >
              <PanelLeft size={13} />
            </button>
            <button
              type="button"
              className={`panel-ctrl-btn ${panelStates.layers?.dock === 'float' ? 'is-active' : ''}`}
              onClick={() => dockTo('layers', 'float')}
              title={lang === 'es' ? 'Hacer flotante' : 'Make floating'}
              aria-label="Float"
            >
              <Move size={12} />
            </button>
            <button
              type="button"
              className={`panel-ctrl-btn ${panelStates.layers?.dock === 'right' ? 'is-active' : ''}`}
              onClick={() => dockTo('layers', 'right')}
              title={lang === 'es' ? 'Acoplar al lateral derecho' : 'Dock right'}
              aria-label="Dock right"
            >
              <PanelRight size={13} />
            </button>
            <button
              type="button"
              className={`panel-ctrl-btn ${panelStates.layers?.isExpanded ? 'is-active' : ''}`}
              onClick={() => toggleExpand('layers')}
              title={
                panelStates.layers?.isExpanded
                  ? lang === 'es' ? 'Reducir tamaño' : 'Reduce width'
                  : lang === 'es' ? 'Ampliar tamaño' : 'Expand width'
              }
              aria-label="Toggle width"
            >
              {panelStates.layers?.isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
            <button
              type="button"
              className="panel-ctrl-btn"
              onClick={() => toggleMinimize('layers')}
              title={lang === 'es' ? 'Minimizar al borde' : 'Minimize to edge'}
              aria-label="Minimize"
            >
              <Minus size={13} />
            </button>
          </div>
        </div>

        {/* Edge Resize Handle */}
        <div
          className={`panel-resize-handle ${
            panelStates.layers?.dock === 'right' ? 'handle-left' : 'handle-right'
          }`}
          onPointerDown={e => handleResizeStart('layers', panelStates.layers?.dock === 'right' ? 'left' : 'right', e)}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeEnd}
          onPointerCancel={handleResizeEnd}
          title={lang === 'es' ? 'Arrastrar para cambiar ancho' : 'Drag to resize width'}
        />
        {panelStates.layers?.dock === 'float' && (
          <div
            className="panel-resize-handle handle-corner"
            onPointerDown={e => handleResizeStart('layers', 'corner', e)}
            onPointerMove={handleResizeMove}
            onPointerUp={handleResizeEnd}
            onPointerCancel={handleResizeEnd}
          />
        )}

        <div className="panel-heading">
          <span>{t.systems}</span>
          <div className="panel-heading-actions">
            <button
              type="button"
              className="reset-order-btn"
              onClick={resetSystemOrder}
              title={t.resetOrder}
              aria-label={t.resetOrder}
            >
              <RotateCcw size={12} />
            </button>
            <Badge variant="secondary" className="desktop-only small-number">
              {activeSystems.length}
            </Badge>
            <Button
              variant="ghost"
              className="mobile-only icon-button"
              onClick={() => setPanel(null)}
              aria-label={t.closeSystems}
            >
              <X size={18} />
            </Button>
          </div>
        </div>

        {/* Enhanced Presets at the top - ALL with icons! */}
        <div className="layer-presets">
          <Button
            variant="ghost"
            aria-pressed={activeSystems.every(x => state.visible.includes(x.id))}
            onClick={() =>
              setState(s => ({ ...s, selected: [], isolate: false, visible: activeSystems.map(x => x.id) }))
            }
          >
            <Layers size={12} style={{ color: '#538d9a' }} />
            {t.presetAll}
          </Button>
          <Button
            variant="ghost"
            aria-pressed={state.visible.length === 1 && state.visible[0] === 'skeletal'}
            onClick={() => setState(s => ({ ...s, selected: [], isolate: false, visible: ['skeletal'] }))}
          >
            <Bone size={12} style={{ color: '#c4b78a' }} />
            {t.presetSkeleton}
          </Button>
          <Button
            variant="ghost"
            aria-pressed={state.visible.length === 1 && state.visible[0] === 'muscular'}
            onClick={() => setState(s => ({ ...s, selected: [], isolate: false, visible: ['muscular'] }))}
          >
            <Dumbbell size={12} style={{ color: '#a85b50' }} />
            {t.presetMuscles}
          </Button>
          <Button
            variant="ghost"
            aria-pressed={
              state.visible.length === 6 &&
              ['cardiac', 'respiratory', 'digestive', 'urinary', 'endocrine', 'reproductive'].every(id =>
                state.visible.includes(id as SystemId)
              )
            }
            onClick={() =>
              setState(s => ({
                ...s,
                selected: [],
                isolate: false,
                visible: ['cardiac', 'respiratory', 'digestive', 'urinary', 'endocrine', 'reproductive']
              }))
            }
          >
            <Heart size={12} style={{ color: '#e05353' }} />
            {t.presetOrgans}
          </Button>
          <Button
            variant="ghost"
            aria-pressed={
              state.visible.length === 3 &&
              ['cardiac', 'arterial', 'venous'].every(id => state.visible.includes(id as SystemId))
            }
            onClick={() =>
              setState(s => ({
                ...s,
                selected: [],
                isolate: false,
                visible: ['cardiac', 'arterial', 'venous']
              }))
            }
          >
            <Droplets size={12} style={{ color: '#38bdf8' }} />
            {t.presetCirculatory}
          </Button>
          <Button
            variant="ghost"
            aria-pressed={
              state.visible.length === 2 &&
              ['nervous', 'sensory'].every(id => state.visible.includes(id as SystemId))
            }
            onClick={() =>
              setState(s => ({
                ...s,
                selected: [],
                isolate: false,
                visible: ['nervous', 'sensory']
              }))
            }
          >
            <Brain size={12} style={{ color: '#facc15' }} />
            {t.presetNervous}
          </Button>
        </div>

        {/* System list with Drag and Drop, colored badges & colored switches */}
        <div className="system-list">
          {activeSystems.map(s => {
            const isSkeletal = s.id === 'skeletal';
            const isMuscular = s.id === 'muscular';
            const isDragging = draggingId === s.id;
            const isOver = dragOverId === s.id;

            return (
              <div
                className={`system-row ${state.visible.includes(s.id) ? 'enabled' : ''} ${
                  isSkeletal ? 'is-skeletal' : ''
                } ${isMuscular ? 'is-muscular' : ''} ${isDragging ? 'is-dragging' : ''} ${
                  isOver ? (dropPosition === 'after' ? 'drop-after' : 'drop-before') : ''
                }`}
                key={s.id}
                draggable
                onDragStart={e => handleDragStart(e, s.id)}
                onDragOver={e => handleDragOver(e, s.id)}
                onDragLeave={e => handleDragLeave(e, s.id)}
                onDrop={e => handleDrop(e, s.id)}
                onDragEnd={handleDragEnd}
                style={{ '--system-color': s.color } as React.CSSProperties}
              >
                <div className="drag-handle" title={t.dragToReorder} aria-label={t.dragToReorder}>
                  <GripVertical size={13} />
                </div>

                <Button
                  variant="ghost"
                  className="system-name"
                  title={`${t.showOnlyPrefix} ${s.name.toLowerCase()}`}
                  onClick={() => setState(v => ({ ...v, visible: [s.id], isolate: false, selected: [] }))}
                >
                  <span
                    className="system-icon-badge"
                    style={{
                      background: `color-mix(in srgb, ${s.color} 22%, transparent)`,
                      color: s.color,
                      borderColor: `color-mix(in srgb, ${s.color} 40%, transparent)`
                    }}
                  >
                    {getSystemIcon(s.id, 13)}
                  </span>
                  <span className="system-label-text">{s.name}</span>
                  <span className="system-count">{counts[s.id]}</span>
                </Button>

                <Switch
                  checked={state.visible.includes(s.id)}
                  onCheckedChange={() => toggle(s.id)}
                  aria-label={`${t.showPrefix} ${s.name.toLowerCase()}`}
                />
              </div>
            );
          })}
        </div>

        {/* Panel foot with both Mostrar todo and Ocultar todo buttons */}
        <div className="panel-foot">
          <div className="foot-status">
            <span className="foot-number">{visibleCount.toLocaleString(lang === 'es' ? 'es-ES' : 'en-US')}</span>
            <span className="foot-label">{t.piecesVisibleSuffix}</span>
          </div>
          <div className="foot-actions">
            <Button
              variant="ghost"
              className="foot-btn foot-show"
              onClick={() =>
                setState(s => ({
                  ...s,
                  selected: [],
                  isolate: false,
                  visible: activeSystems.map(x => x.id)
                }))
              }
              disabled={activeSystems.every(x => state.visible.includes(x.id))}
              title={t.showAll}
              aria-label={t.showAll}
            >
              <Eye size={13} />
              <span>{t.showAll}</span>
            </Button>
            <Button
              variant="ghost"
              className="foot-btn foot-hide"
              onClick={() => setState(s => ({ ...s, visible: [], selected: [], isolate: false }))}
              disabled={state.visible.length === 0}
              title={t.hideAll}
              aria-label={t.hideAll}
            >
              <EyeOff size={13} />
              <span>{t.hideAll}</span>
            </Button>
          </div>
        </div>
      </section>
        )
      )}

      {/* Scene bottom caption */}
      <div className="scene-caption">
        <span className="caption-line" />
        <span>
          {state.isolate
            ? chosenDisplayName || t.captionSelected
            : state.explode > 0.95
              ? t.captionInventory
              : state.explode > 0.05
                ? t.captionSeparated
                : t.captionDefault}
        </span>
        <span className="caption-line" />
      </div>

      {/* Bottom Search Dock (takes previous place of horizontal displacement dock) */}
      <div className="bottom-search-dock glass" ref={searchDockRef}>
        {/* Floating Search Results Popup with piece images */}
        {(searchFocused || query.trim().length > 0) && (
          <div className="search-results-popup glass">
            <div className="search-results-header">
              <span>
                {t.searchResultsTitle} ({results.length})
              </span>
              <button
                type="button"
                className="search-dock-clear"
                onClick={() => setSearchFocused(false)}
                aria-label={t.closeSearch}
              >
                <X size={13} />
              </button>
            </div>
            <div className="search-results-scroll">
              {results.length === 0 ? (
                <div style={{ padding: '20px 12px', fontSize: '13px', color: '#8898aa', textAlign: 'center' }}>
                  {t.searchEmpty}
                </div>
              ) : (
                results.slice(0, 30).map(item => {
                  const part = atlas?.parts.find(p => p.id === item.concept.elements[0]);
                  const sysId = part?.system ?? 'skeletal';
                  const sysInfo = currentSystems.find(s => s.id === sysId);
                  const sysColor = sysInfo?.color ?? '#c4b78a';

                  return (
                    <button
                      key={item.concept.id}
                      type="button"
                      className="search-result-row"
                      onClick={() => choose(item.concept)}
                    >
                      {/* Piece Image */}
                      <PieceThumbnail
                        concept={item.concept}
                        atlas={atlas}
                        systemId={sysId}
                        systemColor={sysColor}
                        size={48}
                      />

                      <div className="search-result-info">
                        <div className="search-result-title-line">
                          <span className="search-result-title">{item.displayName}</span>
                          {item.matchedSynonym && (
                            <span className="search-synonym-tag" title={item.matchedSynonym}>
                              {t.synonymTagPrefix} {item.matchedSynonym}
                            </span>
                          )}
                        </div>
                        {lang === 'es' &&
                          item.concept.name.toLowerCase() !== item.displayName.toLowerCase() && (
                            <span className="search-result-subtitle">{item.concept.name}</span>
                          )}
                      </div>

                      <div className="search-result-meta">
                        <span
                          className="search-result-system-pill"
                          style={{
                            color: sysColor,
                            background: `color-mix(in srgb, ${sysColor} 16%, transparent)`,
                            borderColor: `color-mix(in srgb, ${sysColor} 30%, transparent)`
                          }}
                        >
                          {getSystemIcon(sysId, 11)}
                          <span>{sysInfo?.name ?? sysId}</span>
                        </span>
                        <span className="search-result-count">
                          {item.concept.elements.length}{' '}
                          {item.concept.elements.length === 1 ? t.pieceSingle : t.piecePlural}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="bottom-search-bar">
          <Button
            variant="ghost"
            className="mobile-only search-dock-layers-btn"
            onClick={() => setPanel('layers')}
            aria-label={t.dockSystemsAria}
          >
            <Layers3 size={16} />
            <span>{t.dockSystems}</span>
          </Button>
          <Search size={17} className="search-dock-icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="search-dock-input"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSearchFocused(true);
            }}
            onFocus={() => setSearchFocused(true)}
            placeholder={t.searchBottomPlaceholder}
            aria-label={t.searchAriaInput}
          />
          {query && (
            <button
              type="button"
              className="search-dock-clear"
              onClick={() => {
                setQuery('');
                searchInputRef.current?.focus();
              }}
              aria-label={t.clearSearch}
            >
              <X size={13} />
            </button>
          )}
          <kbd className="search-dock-kbd">/</kbd>
        </div>
      </div>

      {/* Studio footer */}
      <footer className="studio-footer">
        <span>
          {state.explode > 0.8 ? t.dragToPan : t.dragToOrbit} <b>·</b> {t.pinchToZoom} <b>·</b> {t.tapToInspect}
        </span>
        <Button
          variant="ghost"
          onClick={() => {
            setDetails(false);
            setPanel(null);
            setAbout(true);
          }}
        >
          {t.sourceCredits} <ArrowUpRight size={12} />
        </Button>
      </footer>

      {/* Loading overlay */}
      {progress < 100 && !error && (
        <div className="loading glass" role="status">
          <Activity size={18} />
          <div>
            <strong>{t.preparingAnatomy}</strong>
            <span>{t.loadingPieces(progress, atlas?.parts.length ?? 2234)}</span>
            <div className="loading-track">
              <i style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="loading glass error" role="alert">
          <p>{error}</p>
          <Button variant="ghost" onClick={() => location.reload()}>
            {t.reloadViewer}
          </Button>
        </div>
      )}

      {/* Structure detail dockable panel */}
      {isDetailOpen && (
        layouts.detail?.isMinimized ? (
          <aside
            className={`panel-mini-dock detail-mini-dock glass ${
              panelStates.detail?.dock === 'left' ? 'dock-left' : 'dock-right'
            }`}
            style={layouts.detail.style}
            onClick={() => toggleMinimize('detail')}
            title={lang === 'es' ? `Restaurar ${chosenDisplayName || 'Inspección'}` : `Restore ${chosenDisplayName || 'Inspection'}`}
            role="button"
            tabIndex={0}
          >
            <button
              type="button"
              className="mini-dock-restore-btn"
              onClick={(e) => {
                e.stopPropagation();
                toggleMinimize('detail');
              }}
              title={lang === 'es' ? 'Expandir' : 'Expand'}
              aria-label="Expand Inspection"
            >
              <Info size={15} />
            </button>
            <div className="mini-dock-label-wrap">
              <span className="mini-dock-label-text">
                {chosenDisplayName || (lang === 'es' ? 'INSPECCIÓN' : 'INSPECTION')}
              </span>
            </div>
            {filteredConnectedList.length > 0 && (
              <span className="mini-dock-count-badge conn-badge">
                {filteredConnectedList.length}
              </span>
            )}
          </aside>
        ) : (
          <aside
            className={`detail-sheet glass ${state.isolate ? 'is-isolated' : ''} ${
              panelStates.detail?.dock === 'float' ? 'is-floating-panel' : ''
            } ${
              draggingPanelId === 'detail' ? 'is-dragging-panel' : ''
            } ${resizingPanelId === 'detail' ? 'is-resizing-panel' : ''}`}
            style={layouts.detail?.style}
            onPointerDown={() => bringToFront('detail')}
            role="region"
            aria-label={t.anatomy}
          >
          {/* Top Window Bar with Window Controls & Close */}
          <div
            className="panel-window-bar"
            onPointerDown={e => handlePanelDragStart('detail', e)}
            onPointerMove={handlePanelDragMove}
            onPointerUp={handlePanelDragEnd}
            onPointerCancel={handlePanelDragEnd}
            title={t.dragToMovePanel}
          >
            <div className="panel-drag-title">
              <GripHorizontal size={14} className="panel-drag-icon" />
              <span className="panel-drag-text">
                {draggingPanelId === 'detail'
                  ? (lang === 'es' ? 'Moviendo Inspección…' : 'Moving Inspection…')
                  : (chosenDisplayName || (lang === 'es' ? 'Inspección' : 'Inspection'))}
              </span>
            </div>
            <div className="panel-window-controls" onPointerDown={e => e.stopPropagation()}>
              <button
                type="button"
                className={`panel-ctrl-btn ${panelStates.detail?.dock === 'left' ? 'is-active' : ''}`}
                onClick={() => dockTo('detail', 'left')}
                title={lang === 'es' ? 'Acoplar al lateral izquierdo' : 'Dock left'}
                aria-label="Dock left"
              >
                <PanelLeft size={13} />
              </button>
              <button
                type="button"
                className={`panel-ctrl-btn ${panelStates.detail?.dock === 'float' ? 'is-active' : ''}`}
                onClick={() => dockTo('detail', 'float')}
                title={lang === 'es' ? 'Hacer flotante' : 'Make floating'}
                aria-label="Float"
              >
                <Move size={12} />
              </button>
              <button
                type="button"
                className={`panel-ctrl-btn ${panelStates.detail?.dock === 'right' ? 'is-active' : ''}`}
                onClick={() => dockTo('detail', 'right')}
                title={lang === 'es' ? 'Acoplar al lateral derecho' : 'Dock right'}
                aria-label="Dock right"
              >
                <PanelRight size={13} />
              </button>
              <button
                type="button"
                className={`panel-ctrl-btn ${panelStates.detail?.isExpanded ? 'is-active' : ''}`}
                onClick={() => toggleExpand('detail')}
                title={
                  panelStates.detail?.isExpanded
                    ? lang === 'es' ? 'Reducir tamaño' : 'Reduce width'
                    : lang === 'es' ? 'Ampliar tamaño' : 'Expand width'
                }
                aria-label="Toggle width"
              >
                {panelStates.detail?.isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              </button>
              <button
                type="button"
                className="panel-ctrl-btn"
                onClick={() => toggleMinimize('detail')}
                title={lang === 'es' ? 'Minimizar al borde' : 'Minimize to edge'}
                aria-label="Minimize"
              >
                <Minus size={13} />
              </button>
              <button
                type="button"
                className="panel-ctrl-btn panel-close-btn"
                onClick={() => {
                  setDetails(false);
                  setState(s => ({ ...s, selected: [], isolate: false }));
                }}
                title={lang === 'es' ? 'Cerrar inspección' : 'Close inspection'}
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Edge Resize Handle */}
          <div
            className={`panel-resize-handle ${
              panelStates.detail?.dock === 'right' ? 'handle-left' : 'handle-right'
            }`}
            onPointerDown={e => handleResizeStart('detail', panelStates.detail?.dock === 'right' ? 'left' : 'right', e)}
            onPointerMove={handleResizeMove}
            onPointerUp={handleResizeEnd}
            onPointerCancel={handleResizeEnd}
            title={lang === 'es' ? 'Arrastrar para cambiar ancho' : 'Drag to resize width'}
          />
          {panelStates.detail?.dock === 'float' && (
            <div
              className="panel-resize-handle handle-corner"
              onPointerDown={e => handleResizeStart('detail', 'corner', e)}
              onPointerMove={handleResizeMove}
              onPointerUp={handleResizeEnd}
              onPointerCancel={handleResizeEnd}
            />
          )}

          <div className="detail-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {chosen && (
                <PieceThumbnail
                  concept={chosen}
                  atlas={atlas}
                  systemId={selected?.system}
                  systemColor={system?.color}
                  size={56}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="detail-accent" style={{ background: system?.color }} />
                <div className="eyebrow">{system?.name ?? t.anatomy}</div>
                <h2 ref={detailTitle} tabIndex={-1} className="structure-title">
                  {chosenDisplayName}
                </h2>
              </div>
            </div>
          </div>
          <div className="detail-scroll" key={`${chosen?.id}-${state.isolate}-${lang}`}>
            <p className="structure-description">
              {chosen && selected ? getExplanation(chosen.name, selected.system, lang) : ''}
            </p>
            {chosen && !EXPLANATIONS_I18N[lang][chosen.name.toLowerCase()] && (
              <span className="context-note">{t.systemOverview}</span>
            )}
            <div className="structure-meta">
              <span>
                {t.atlasReference}
                <strong>{chosen?.id}</strong>
              </span>
              <span>
                {t.selectedPieces}
                <strong>{state.selected.length.toLocaleString(lang === 'es' ? 'es-ES' : 'en-US')}</strong>
              </span>
            </div>
            {/* Anatomical Connectivity & Proximity Analysis */}
            {connectedList.length > 0 && (
              <div className="conn-section">
                <div className="conn-header">
                  <div className="conn-title-row">
                    <Activity size={14} className="conn-icon" />
                    <span className="conn-title">
                      {lang === 'es' ? 'Conexiones y Grado de Cercanía' : 'Connections & Proximity Analysis'}
                    </span>
                    <span className="conn-count-badge">{filteredConnectedList.length}</span>
                  </div>
                  <p className="conn-subtitle">
                    {lang === 'es'
                      ? 'Relaciones biomecánicas, continuidad e inserciones espaciales 3D'
                      : 'Biomechanical relationships, continuity & 3D spatial insertions'}
                  </p>
                </div>

                {/* Filter pills */}
                <div className="conn-filter-pills">
                  {[
                    { id: 'all', label: lang === 'es' ? 'Todos' : 'All' },
                    { id: 'skeletal', label: lang === 'es' ? 'Huesos' : 'Bones' },
                    { id: 'muscular', label: lang === 'es' ? 'Músculos' : 'Muscles' },
                    { id: 'visceral', label: lang === 'es' ? 'Órganos' : 'Organs' },
                    { id: 'vascular', label: lang === 'es' ? 'Vasos' : 'Vessels' },
                    { id: 'nervous', label: lang === 'es' ? 'Nervios' : 'Nerves' }
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      className={`conn-filter-btn ${connFilter === f.id ? 'active' : ''}`}
                      onClick={() => setConnFilter(f.id as any)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Global Action Button: Show / Hide All Related in 3D */}
                <div className="conn-global-actions">
                  <button
                    type="button"
                    className={`conn-global-3d-btn ${isRelationalIsolate && activeRelatedItemIds.size > 0 ? 'is-active' : ''}`}
                    onClick={toggleAllRelated3D}
                    title={lang === 'es' ? 'Aislar y ver todas estas estructuras conectadas en 3D' : 'Isolate and view all connected structures in 3D'}
                  >
                    <Eye size={14} />
                    <span>
                      {isRelationalIsolate && activeRelatedItemIds.size > 0
                        ? (lang === 'es' ? `Ocultar Relacionados 3D (${activeRelatedItemIds.size})` : `Hide 3D Related (${activeRelatedItemIds.size})`)
                        : (lang === 'es' ? `Mostrar Relacionados en 3D (${filteredConnectedList.length})` : `Show Related in 3D (${filteredConnectedList.length})`)}
                    </span>
                  </button>
                </div>

                {/* Items list with 3D Preview Thumbnail and 3D Toggle */}
                <div className="conn-items-list">
                  {filteredConnectedList.slice(0, 24).map(item => {
                    const sysColor = SYSTEMS.find(s => s.id === item.system)?.color ?? '#538d9a';
                    const isActiveIn3D = activeRelatedItemIds.has(item.id);
                    const relConcept: Concept = item.conceptId && atlas?.concepts.find(x => x.id === item.conceptId)
                      ? atlas.concepts.find(x => x.id === item.conceptId)!
                      : { id: item.id, name: item.name, elements: [item.id] };

                    return (
                      <div
                        key={item.id}
                        className={`conn-item-card ${isActiveIn3D ? 'is-active-3d' : ''}`}
                        title={lang === 'es' ? `Inspeccionar ${item.translatedName}` : `Inspect ${item.translatedName}`}
                        onClick={() => {
                          if (item.conceptId) {
                            const c = atlas?.concepts.find(x => x.id === item.conceptId);
                            if (c) {
                              choose(c);
                              return;
                            }
                          }
                          choosePart(item.id);
                        }}
                      >
                        {/* Real 3D Preview Thumbnail */}
                        <div className="conn-item-thumb-col">
                          <PieceThumbnail
                            concept={relConcept}
                            atlas={atlas}
                            size={44}
                            systemId={item.system}
                            systemColor={sysColor}
                            className="conn-card-thumbnail"
                          />
                        </div>

                        {/* Text and Proximity Information */}
                        <div className="conn-item-info-col">
                          <div className="conn-item-header">
                            <span className="conn-item-name" style={{ color: sysColor }}>
                              {getSystemIcon(item.system, 12)}
                              <span className="conn-name-text">{item.translatedName}</span>
                            </span>
                            <span className={`conn-degree-pill degree-${item.degree}`}>
                              {item.connectionLabel}
                            </span>
                          </div>

                          <div className="conn-proximity-bar-wrap">
                            <div className="conn-proximity-track">
                              <div
                                className="conn-proximity-fill"
                                style={{
                                  width: `${item.proximityScore}%`,
                                  background:
                                    item.degree === 1
                                      ? '#00e5ff'
                                      : item.proximityScore > 85
                                        ? '#538d9a'
                                        : '#788694'
                                }}
                              />
                            </div>
                            <div className="conn-proximity-labels">
                              <span className="conn-dist-label">
                                {item.distanceMm === 0
                                  ? (lang === 'es' ? 'Contacto directo (0 mm)' : 'Direct contact (0 mm)')
                                  : `${item.distanceMm} mm`}
                              </span>
                              <span className="conn-pct-label">
                                {item.proximityScore}% {lang === 'es' ? 'cercanía' : 'proximity'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Dedicated 3D Toggle Switch / Button */}
                        <div className="conn-item-toggle-col">
                          <button
                            type="button"
                            className={`conn-3d-toggle-btn ${isActiveIn3D ? 'is-active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRelatedItem3D(item);
                            }}
                            title={isActiveIn3D
                              ? (lang === 'es' ? 'Ocultar esta pieza en 3D' : 'Hide this piece in 3D')
                              : (lang === 'es' ? 'Aislar y ver esta pieza en 3D' : 'Isolate and view this piece in 3D')}
                            aria-label={isActiveIn3D ? 'Ocultar en 3D' : 'Ver en 3D'}
                            aria-pressed={isActiveIn3D}
                          >
                            {isActiveIn3D ? <Eye size={13} /> : <EyeOff size={13} />}
                            <span>3D</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedParts.length > 1 && (
              <div className="member-list">
                <h3>{t.includedStructures}</h3>
                {selectedParts.slice(0, 20).map(p => (
                  <Button variant="ghost" key={p.id} onClick={() => choosePart(p.id)}>
                    <span>{translatePartName(p.name, lang)}</span>
                    <ChevronRight size={14} />
                  </Button>
                ))}
                {selectedParts.length > 20 && (
                  <p>{t.andMorePieces(selectedParts.length - 20)}</p>
                )}
              </div>
            )}

            <a className="source-link" href="https://lifesciencedb.jp/bp3d/" target="_blank" rel="noreferrer">
              {t.viewAnatomicalSource} <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="detail-actions">
            <Button
              className={`primary-action ${state.isolate ? 'active' : ''}`}
              onClick={() => {
                setState(s => {
                  const willShowSurrounding = s.isolate;
                  let nextVisible = s.visible;
                  if (willShowSurrounding) {
                    const selectedPartSystem = chosen?.elements?.[0] ? parts.get(chosen.elements[0])?.system : null;
                    if (nextVisible.length === 0 || (selectedPartSystem && !nextVisible.includes(selectedPartSystem))) {
                      nextVisible = selectedPartSystem ? [...new Set([...nextVisible, selectedPartSystem])] : DEFAULT_VISIBLE;
                    }
                  }
                  return {
                    ...s,
                    isolate: !s.isolate,
                    visible: nextVisible,
                    explode: 0
                  };
                });
              }}
            >
              <Focus size={18} />
              {state.isolate ? t.showSurroundingAnatomy : t.isolateStructure}
              <ChevronRight size={16} />
            </Button>
            <Button
              variant="ghost"
              className="secondary-action"
              onClick={() => {
                setState(s => ({ ...s, selected: [], isolate: false }));
                setDetails(false);
              }}
            >
              {t.clearSelection}
            </Button>
          </div>
        </aside>
        )
      )}

      {/* About sheet */}
      <Sheet open={about} onOpenChange={setAbout}>
        <SheetContent className="about-sheet glass">
          <div className="eyebrow">{t.aboutScope}</div>
          <SheetTitle className="structure-title">{t.aboutTitle}</SheetTitle>
          <SheetDescription>{t.aboutDescription}</SheetDescription>
          <div className="about-copy">
            <p>
              <strong>{t.aboutP1Title}</strong>
              <br />
              {t.aboutP1Text}
            </p>
            <p>{t.aboutP2Text}</p>
            <p>{t.aboutP3Text}</p>
            <h3>{t.aboutSourceTitle}</h3>
            <p>{t.aboutSourceText}</p>
            <a href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html" target="_blank" rel="noreferrer">
              {t.aboutOriginalGeometry} <ArrowUpRight size={14} />
            </a>
            <a href="https://academic.oup.com/nar/article/37/suppl_1/D782/1000752" target="_blank" rel="noreferrer">
              {t.aboutReadPublication} <ArrowUpRight size={14} />
            </a>
          </div>
        </SheetContent>
      </Sheet>
    </main>
  );
}
