import React from 'react';
import {
  Bone,
  Dumbbell,
  Heart,
  Eye,
  Droplet,
  Waves,
  Brain,
  Wind,
  Apple,
  Droplets,
  Shield,
  Sparkles,
  Dna,
  User,
  Layers,
  Activity
} from 'lucide-react';
import type { SystemId } from './anatomy';

export function getSystemIcon(id: SystemId, size = 14): React.ReactElement {
  switch (id) {
    case 'skeletal':
      return <Bone size={size} strokeWidth={2.2} />;
    case 'muscular':
      return <Dumbbell size={size} strokeWidth={2.2} />;
    case 'cardiac':
      return <Heart size={size} strokeWidth={2.2} />;
    case 'sensory':
      return <Eye size={size} strokeWidth={2.2} />;
    case 'arterial':
      return <Droplet size={size} strokeWidth={2.2} />;
    case 'venous':
      return <Waves size={size} strokeWidth={2.2} />;
    case 'nervous':
      return <Brain size={size} strokeWidth={2.2} />;
    case 'respiratory':
      return <Wind size={size} strokeWidth={2.2} />;
    case 'digestive':
      return <Apple size={size} strokeWidth={2.2} />;
    case 'urinary':
      return <Droplets size={size} strokeWidth={2.2} />;
    case 'lymphatic':
      return <Shield size={size} strokeWidth={2.2} />;
    case 'endocrine':
      return <Sparkles size={size} strokeWidth={2.2} />;
    case 'reproductive':
      return <Dna size={size} strokeWidth={2.2} />;
    case 'integumentary':
      return <User size={size} strokeWidth={2.2} />;
    case 'connective':
      return <Layers size={size} strokeWidth={2.2} />;
    default:
      return <Activity size={size} strokeWidth={2.2} />;
  }
}
