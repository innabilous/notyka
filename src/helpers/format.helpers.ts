export function formatDate(timestamp: number): string {
	const d = new Date(timestamp);
	return d.toLocaleString('uk-UA', {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

export function formatElementsCount(count: number): string {
	const mod10 = count % 10;
	const mod100 = count % 100;
	if (mod100 >= 11 && mod100 <= 14) return `${count} елементів`;
	if (mod10 === 1) return `${count} елемент`;
	if (mod10 >= 2 && mod10 <= 4) return `${count} елементи`;
	return `${count} елементів`;
}
