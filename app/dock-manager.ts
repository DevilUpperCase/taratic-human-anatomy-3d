'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export type DockSide = 'left' | 'right' | 'float';

export interface PanelDefinition {
  id: string;
  defaultDock: DockSide;
  defaultWidth: number;
  expandedWidth: number;
  minWidth: number;
  maxWidth: number;
}

export interface PanelInstanceState {
  dock: DockSide;
  width: number;
  isExpanded: boolean;
  isMinimized?: boolean;
  floatPos: { x: number; y: number } | null;
  floatHeight?: number;
  zIndex: number;
}

export interface DockComputedLayout {
  style: React.CSSProperties;
  dock: DockSide;
  width: number;
  isExpanded: boolean;
  isMinimized: boolean;
  order: number;
}

export const REGISTERED_PANELS: Record<string, PanelDefinition> = {
  layers: {
    id: 'layers',
    defaultDock: 'left',
    defaultWidth: 264,
    expandedWidth: 384,
    minWidth: 220,
    maxWidth: 520,
  },
  detail: {
    id: 'detail',
    defaultDock: 'right',
    defaultWidth: 336,
    expandedWidth: 496,
    minWidth: 280,
    maxWidth: 640,
  },
};

const LEFT_START_PX = 0; // Flush to left edge with 0px margin
const RIGHT_START_PX = 0; // Flush to right edge with 0px margin
const PANEL_GAP_PX = 8;
const TOP_OFFSET_PX = 48; // Right underneath the 48px top bar
const BOTTOM_OFFSET_PX = 0; // Down to bottom edge without margin

export function usePanelDockManager(initialActivePanels: Record<string, boolean>) {
  const [panelStates, setPanelStates] = useState<Record<string, PanelInstanceState>>(() => {
    const initial: Record<string, PanelInstanceState> = {};
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('human_atlas_panels_state');
        if (saved) {
          const parsed = JSON.parse(saved);
          return parsed;
        }
      } catch {}
    }

    Object.entries(REGISTERED_PANELS).forEach(([id, def], idx) => {
      initial[id] = {
        dock: def.defaultDock,
        width: def.defaultWidth,
        isExpanded: false,
        floatPos: null,
        zIndex: 30 + idx,
      };
    });
    return initial;
  });

  const [activeSnapZone, setActiveSnapZone] = useState<'left' | 'right' | null>(null);
  const [draggingPanelId, setDraggingPanelId] = useState<string | null>(null);
  const [resizingPanelId, setResizingPanelId] = useState<string | null>(null);

  // Highest z-index tracking for window focus
  const nextZIndexRef = useRef(40);

  // Drag ref tracking
  const dragRef = useRef<{
    panelId: string;
    startX: number;
    startY: number;
    initLeft: number;
    initTop: number;
    pointerId: number;
    panelEl: HTMLElement;
    hasMoved: boolean;
  } | null>(null);

  // Resize ref tracking
  const resizeRef = useRef<{
    panelId: string;
    edge: 'left' | 'right' | 'corner';
    startX: number;
    startY: number;
    initWidth: number;
    initHeight?: number;
    pointerId: number;
  } | null>(null);

  // Save states to session storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('human_atlas_panels_state', JSON.stringify(panelStates));
      } catch {}
    }
  }, [panelStates]);

  const bringToFront = useCallback((panelId: string) => {
    nextZIndexRef.current += 1;
    const newZ = nextZIndexRef.current;
    setPanelStates(prev => ({
      ...prev,
      [panelId]: {
        ...(prev[panelId] ?? {
          dock: REGISTERED_PANELS[panelId]?.defaultDock ?? 'left',
          width: REGISTERED_PANELS[panelId]?.defaultWidth ?? 300,
          isExpanded: false,
          floatPos: null,
          zIndex: 30,
        }),
        zIndex: newZ,
      },
    }));
  }, []);

  const dockTo = useCallback((panelId: string, side: DockSide) => {
    bringToFront(panelId);
    setPanelStates(prev => {
      const current = prev[panelId] || {
        dock: side,
        width: REGISTERED_PANELS[panelId]?.defaultWidth ?? 300,
        isExpanded: false,
        floatPos: null,
        zIndex: 35,
      };

      let nextFloatPos = current.floatPos;
      if (side === 'float' && !nextFloatPos) {
        // Compute reasonable center-left or center-right float coordinates
        const def = REGISTERED_PANELS[panelId];
        const w = current.width || def?.defaultWidth || 320;
        const screenW = typeof window !== 'undefined' ? window.innerWidth : 1200;
        const screenH = typeof window !== 'undefined' ? window.innerHeight : 800;
        nextFloatPos = {
          x: Math.max(40, Math.min(screenW - w - 40, current.dock === 'right' ? screenW - w - 120 : 120)),
          y: Math.max(TOP_OFFSET_PX, Math.min(screenH - 450, 140)),
        };
      }

      return {
        ...prev,
        [panelId]: {
          ...current,
          dock: side,
          floatPos: nextFloatPos,
        },
      };
    });
  }, [bringToFront]);

  const toggleExpand = useCallback((panelId: string) => {
    const def = REGISTERED_PANELS[panelId];
    if (!def) return;
    bringToFront(panelId);
    setPanelStates(prev => {
      const current = prev[panelId];
      if (!current) return prev;
      const nextExpanded = !current.isExpanded;
      const nextWidth = nextExpanded ? def.expandedWidth : def.defaultWidth;
      return {
        ...prev,
        [panelId]: {
          ...current,
          isExpanded: nextExpanded,
          isMinimized: false,
          width: nextWidth,
        },
      };
    });
  }, [bringToFront]);

  const toggleMinimize = useCallback((panelId: string) => {
    bringToFront(panelId);
    setPanelStates(prev => {
      const current = prev[panelId];
      if (!current) return prev;
      return {
        ...prev,
        [panelId]: {
          ...current,
          isMinimized: !current.isMinimized,
        },
      };
    });
  }, [bringToFront]);

  const setPanelWidth = useCallback((panelId: string, newWidth: number) => {
    const def = REGISTERED_PANELS[panelId];
    const minW = def?.minWidth ?? 200;
    const maxW = def?.maxWidth ?? 700;
    const clamped = Math.max(minW, Math.min(maxW, newWidth));
    setPanelStates(prev => {
      const current = prev[panelId];
      if (!current) return prev;
      return {
        ...prev,
        [panelId]: {
          ...current,
          width: clamped,
          isExpanded: clamped >= (def?.expandedWidth ?? 450) * 0.95,
        },
      };
    });
  }, []);

  // Drag panel by header
  const handleDragStart = useCallback((panelId: string, e: React.PointerEvent) => {
    // Prevent drag if interacting with buttons, inputs, switches or controls
    if ((e.target as HTMLElement).closest('button, input, [role="switch"], .conn-item-card, .system-row, .panel-window-controls')) {
      return;
    }

    const panelEl = (e.currentTarget.closest('.layers-panel, .detail-sheet, [data-dock-panel]') as HTMLElement);
    if (!panelEl) return;

    bringToFront(panelId);
    try {
      panelEl.setPointerCapture(e.pointerId);
    } catch {}

    const rect = panelEl.getBoundingClientRect();
    dragRef.current = {
      panelId,
      startX: e.clientX,
      startY: e.clientY,
      initLeft: rect.left,
      initTop: rect.top,
      pointerId: e.pointerId,
      panelEl,
      hasMoved: false,
    };
  }, [bringToFront]);

  const handleDragMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const { panelId, startX, startY, initLeft, initTop } = dragRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    // Only start dragging if moved by at least 6 pixels (prevents accidental float on simple click)
    if (!dragRef.current.hasMoved) {
      if (Math.hypot(dx, dy) < 6) return;
      dragRef.current.hasMoved = true;
      setDraggingPanelId(panelId);
    }

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    // Detect snap zones near borders
    // Detect snap zones near borders (narrow 30px threshold as requested)
    const SNAP_THRESHOLD = 30;
    if (e.clientX <= SNAP_THRESHOLD) {
      setActiveSnapZone('left');
    } else if (e.clientX >= screenW - SNAP_THRESHOLD) {
      setActiveSnapZone('right');
    } else {
      setActiveSnapZone(null);
    }

    const panelState = panelStates[panelId];
    const currentW = panelState?.width ?? 300;

    const newX = Math.max(8, Math.min(screenW - currentW - 8, initLeft + dx));
    const newY = Math.max(TOP_OFFSET_PX - 8, Math.min(screenH - 120, initTop + dy));

    setPanelStates(prev => {
      const curr = prev[panelId];
      if (!curr) return prev;
      return {
        ...prev,
        [panelId]: {
          ...curr,
          dock: 'float', // While dragging, transition to float coordinates
          floatPos: { x: newX, y: newY },
        },
      };
    });
  }, [panelStates]);

  const handleDragEnd = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const { panelId, pointerId, panelEl, hasMoved } = dragRef.current;

    try {
      panelEl.releasePointerCapture(pointerId);
    } catch {}

    dragRef.current = null;
    setDraggingPanelId(null);

    // Only change docking if user actually dragged
    if (hasMoved) {
      if (activeSnapZone === 'left') {
        dockTo(panelId, 'left');
      } else if (activeSnapZone === 'right') {
        dockTo(panelId, 'right');
      }
    }
    setActiveSnapZone(null);
  }, [activeSnapZone, dockTo]);

  // Resize panel by edge
  const handleResizeStart = useCallback((panelId: string, edge: 'left' | 'right' | 'corner', e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    bringToFront(panelId);

    const handleEl = e.currentTarget as HTMLElement;
    handleEl.setPointerCapture(e.pointerId);

    const currState = panelStates[panelId];
    const initW = currState?.width ?? REGISTERED_PANELS[panelId]?.defaultWidth ?? 300;

    resizeRef.current = {
      panelId,
      edge,
      startX: e.clientX,
      startY: e.clientY,
      initWidth: initW,
      initHeight: currState?.floatHeight,
      pointerId: e.pointerId,
    };

    setResizingPanelId(panelId);
  }, [bringToFront, panelStates]);

  const handleResizeMove = useCallback((e: React.PointerEvent) => {
    if (!resizeRef.current) return;
    const { panelId, edge, startX, startY, initWidth, initHeight } = resizeRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    const currState = panelStates[panelId];
    if (!currState) return;

    let nextW = initWidth;
    if (currState.dock === 'left') {
      // Docked on left: dragging right edge to right expands width
      nextW = initWidth + dx;
    } else if (currState.dock === 'right') {
      // Docked on right: dragging left edge to left expands width
      nextW = initWidth - dx;
    } else {
      // Floating: edge === 'right' or 'corner'
      nextW = edge === 'left' ? initWidth - dx : initWidth + dx;
    }

    const def = REGISTERED_PANELS[panelId];
    const minW = def?.minWidth ?? 220;
    const maxW = Math.min(def?.maxWidth ?? 650, window.innerWidth - 120);
    const clampedW = Math.max(minW, Math.min(maxW, nextW));

    let nextH = initHeight;
    if (edge === 'corner' && initHeight) {
      nextH = Math.max(300, Math.min(window.innerHeight - 150, initHeight + dy));
    }

    setPanelStates(prev => {
      const c = prev[panelId];
      if (!c) return prev;
      return {
        ...prev,
        [panelId]: {
          ...c,
          width: clampedW,
          floatHeight: nextH,
          isExpanded: clampedW >= (def?.expandedWidth ?? 450) * 0.95,
        },
      };
    });
  }, [panelStates]);

  const handleResizeEnd = useCallback((e: React.PointerEvent) => {
    if (!resizeRef.current) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(resizeRef.current.pointerId);
    } catch {}
    resizeRef.current = null;
    setResizingPanelId(null);
  }, []);

  // Compute non-overlapping collision-free positions for all active panels
  const computeLayouts = useCallback((activePanels: Record<string, boolean>): Record<string, DockComputedLayout> => {
    const layouts: Record<string, DockComputedLayout> = {};

    // 1. Collect panels docked to 'left'
    const leftPanels = Object.entries(panelStates).filter(
      ([id, state]) => state.dock === 'left' && activePanels[id] !== false
    );

    // 2. Collect panels docked to 'right'
    const rightPanels = Object.entries(panelStates).filter(
      ([id, state]) => state.dock === 'right' && activePanels[id] !== false
    );

    // 3. Collect floating panels
    const floatPanels = Object.entries(panelStates).filter(
      ([id, state]) => state.dock === 'float' && activePanels[id] !== false
    );

    // Layout left panels sequentially from left border without collision
    let currentLeftOffset = LEFT_START_PX;
    leftPanels.forEach(([id, state], idx) => {
      const def = REGISTERED_PANELS[id];
      const isMin = !!state.isMinimized;
      const width = isMin ? 42 : (state.width || def?.defaultWidth || 270);

      layouts[id] = {
        dock: 'left',
        width,
        isExpanded: state.isExpanded,
        isMinimized: isMin,
        order: idx,
        style: {
          position: 'absolute',
          left: `${currentLeftOffset}px`,
          right: 'auto',
          top: `${TOP_OFFSET_PX}px`,
          bottom: `${BOTTOM_OFFSET_PX}px`,
          width: `${width}px`,
          maxHeight: `calc(100dvh - ${TOP_OFFSET_PX + BOTTOM_OFFSET_PX}px)`,
          zIndex: state.zIndex,
        },
      };

      currentLeftOffset += width + PANEL_GAP_PX;
    });

    // Layout right panels sequentially from right border (outside right HUD) without collision
    let currentRightOffset = RIGHT_START_PX;
    rightPanels.forEach(([id, state], idx) => {
      const def = REGISTERED_PANELS[id];
      const isMin = !!state.isMinimized;
      const width = isMin ? 42 : (state.width || def?.defaultWidth || 340);

      layouts[id] = {
        dock: 'right',
        width,
        isExpanded: state.isExpanded,
        isMinimized: isMin,
        order: idx,
        style: {
          position: 'absolute',
          right: `${currentRightOffset}px`,
          left: 'auto',
          top: `${TOP_OFFSET_PX}px`,
          bottom: `${BOTTOM_OFFSET_PX}px`,
          width: `${width}px`,
          maxHeight: `calc(100dvh - ${TOP_OFFSET_PX + BOTTOM_OFFSET_PX}px)`,
          zIndex: state.zIndex,
        },
      };

      currentRightOffset += width + PANEL_GAP_PX;
    });

    // Layout float panels at their stored coordinates
    floatPanels.forEach(([id, state], idx) => {
      const def = REGISTERED_PANELS[id];
      const isMin = !!state.isMinimized;
      const width = isMin ? 42 : (state.width || def?.defaultWidth || 320);
      const posX = state.floatPos?.x ?? (150 + idx * 30);
      const posY = state.floatPos?.y ?? (120 + idx * 25);

      layouts[id] = {
        dock: 'float',
        width,
        isExpanded: state.isExpanded,
        isMinimized: isMin,
        order: idx,
        style: {
          position: 'absolute',
          left: `${posX}px`,
          top: `${posY}px`,
          right: 'auto',
          bottom: 'auto',
          width: `${width}px`,
          maxHeight: isMin
            ? 'auto'
            : state.floatHeight
            ? `${state.floatHeight}px`
            : `calc(100dvh - ${TOP_OFFSET_PX + BOTTOM_OFFSET_PX}px)`,
          zIndex: state.zIndex,
        },
      };
    });

    return layouts;
  }, [panelStates]);

  // Compute camera view insets for 3D viewport centering
  const computeSceneInsets = useCallback((activePanels: Record<string, boolean>) => {
    let leftInset = 20;
    let rightInset = 84; // base right HUD width

    Object.entries(panelStates).forEach(([id, state]) => {
      if (activePanels[id] === false) return;
      const def = REGISTERED_PANELS[id];
      const w = state.isMinimized ? 42 : (state.width || def?.defaultWidth || 300);
      if (state.dock === 'left') {
        leftInset += w + PANEL_GAP_PX;
      } else if (state.dock === 'right') {
        rightInset += w + PANEL_GAP_PX;
      }
    });

    return { left: leftInset, right: rightInset };
  }, [panelStates]);

  return {
    panelStates,
    activeSnapZone,
    draggingPanelId,
    resizingPanelId,
    dockTo,
    toggleExpand,
    toggleMinimize,
    setPanelWidth,
    bringToFront,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleResizeStart,
    handleResizeMove,
    handleResizeEnd,
    computeLayouts,
    computeSceneInsets,
  };
}
