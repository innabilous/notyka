export function buildChordText(
	root: string,
	accidental: string,
	modifier: string,
	hasSlash: boolean,
	bassRoot: string,
	bassAccidental: string,
): string {
	const base = `${root}${accidental}${modifier}`;
	if (!hasSlash || !bassRoot) {
		return base;
	}
	return `${base}/${bassRoot}${bassAccidental}`;
}
