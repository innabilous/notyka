import { CHORD_ROOTS, COUNT_ITEMS, NOTES } from '@/constants/stamps.constants';
import { StampCategory, StampItem } from '@/types/editor.types';

export function getStampCategory(stamp: StampItem): StampCategory {
	if (stamp.category) return stamp.category;
	if (stamp.shapeType) return 'shapes';
	if (stamp.isDrawing) return 'draw';
	if (stamp.isAutoCount) return 'count';
	const t = (stamp.text || '').trim();
	if (NOTES.some((n) => t.startsWith(n))) return 'notes';
	if (COUNT_ITEMS.includes(t)) return 'count';
	if (CHORD_ROOTS.some((r) => t.startsWith(r))) return 'chords';
	return 'custom';
}

export function getStampFont(size: number, U: number): string {
	return `bold ${size * 2 * U}px system-ui, -apple-system, sans-serif`;
}
