import { AppearanceConfig } from '@/types/appearance.types';
import { AppearanceConfigSchema } from '@/schemas/appearance.schema';
import { DEFAULT_APPEARANCE_CONFIG } from '@/constants/appearance.constants';

export function parseAppearanceConfig(raw: unknown): AppearanceConfig {
	let target = raw;
	if (typeof raw === 'string') {
		try {
			target = JSON.parse(raw);
		} catch {
			return DEFAULT_APPEARANCE_CONFIG;
		}
	}
	const parsed = AppearanceConfigSchema.safeParse(target);
	if (parsed.success) {
		return parsed.data;
	}
	return DEFAULT_APPEARANCE_CONFIG;
}
