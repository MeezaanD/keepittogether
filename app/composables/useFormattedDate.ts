export function useFormattedDate() {
	return (dateStr: string | null) =>
		dateStr
			? new Date(dateStr).toLocaleDateString(undefined, {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
			})
			: '';
}