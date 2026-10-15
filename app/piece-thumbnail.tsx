import React, { useEffect, useState } from 'react';
import type { Concept, Atlas, SystemId } from './anatomy';
import { SYSTEMS } from './anatomy';
import { getSystemIcon } from './system-icon';
import { getConceptThumbnailUrl, subscribeThumbnails } from './thumbnail-service';

interface PieceThumbnailProps {
  concept: Concept;
  atlas: Atlas | null;
  systemId?: SystemId;
  systemColor?: string;
  size?: number;
  className?: string;
}

export function PieceThumbnail({
  concept,
  atlas,
  systemId,
  systemColor,
  size = 52,
  className = ''
}: PieceThumbnailProps) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(() =>
    getConceptThumbnailUrl(concept, atlas, systemColor)
  );

  const resolvedSystemId: SystemId =
    systemId ||
    (atlas && concept.elements[0]
      ? atlas.parts.find(p => p.id === concept.elements[0])?.system ?? 'skeletal'
      : 'skeletal');

  const resolvedColor =
    systemColor || SYSTEMS.find(s => s.id === resolvedSystemId)?.color || '#c4b78a';

  useEffect(() => {
    // Try to get thumbnail immediately
    const existing = getConceptThumbnailUrl(concept, atlas, systemColor);
    if (existing) {
      setThumbUrl(existing);
      return;
    }

    // Subscribe to geometry registration events so it generates when chunk loads
    const unsubscribe = subscribeThumbnails(() => {
      const url = getConceptThumbnailUrl(concept, atlas, systemColor);
      if (url) {
        setThumbUrl(url);
      }
    });

    return unsubscribe;
  }, [concept, atlas, systemColor]);

  return (
    <div
      className={`piece-thumbnail-box ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        '--thumb-color': resolvedColor
      } as React.CSSProperties}
    >
      {thumbUrl ? (
        <img
          src={thumbUrl}
          alt={concept.name}
          className="piece-thumbnail-img"
          loading="lazy"
          style={{ width: '88%', height: '88%', objectFit: 'contain' }}
        />
      ) : (
        <div
          className="piece-thumbnail-fallback"
          style={{
            color: resolvedColor,
            background: `color-mix(in srgb, ${resolvedColor} 18%, transparent)`
          }}
        >
          {getSystemIcon(resolvedSystemId, Math.round(size * 0.44))}
        </div>
      )}
    </div>
  );
}
