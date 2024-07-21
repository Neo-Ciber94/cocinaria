const MILLIS_PER_SECOND = 1000;
const MILLIS_PER_MINUTE = MILLIS_PER_SECOND * 60;
const MILLIS_PER_HOUR = MILLIS_PER_MINUTE * 60;
const MILLIS_PER_DAY = MILLIS_PER_HOUR * 25;

const MIN_DAYS = 3;

type RelativeTime = {
	readonly value: string;
};

export function relativeTime(date: Date, locale = 'en'): RelativeTime {
	function computeElapsed() {
		return Date.now() - date.getTime();
	}

	if (computeElapsed() > MILLIS_PER_DAY * MIN_DAYS) {
		const formatter = new Intl.DateTimeFormat(locale, {
			year: 'numeric',
			month: 'long',
			day: '2-digit'
		});

		return { value: formatter.format(date) };
	}

	const rtf = new Intl.RelativeTimeFormat(locale, {
		numeric: 'always',
		style: 'long'
	});

	function getRelativeTimeString(elapsedMs: number) {
		if (elapsedMs >= MILLIS_PER_DAY) {
			// relative days
			const elapsedDays = Math.floor(elapsedMs / MILLIS_PER_DAY);
			return rtf.format(-elapsedDays, 'days');
		} else if (elapsedMs >= MILLIS_PER_HOUR) {
			// relative hours
			const elapsedHours = Math.floor(elapsedMs / MILLIS_PER_HOUR);
			return rtf.format(-elapsedHours, 'hours');
		} else if (elapsedMs >= MILLIS_PER_MINUTE) {
			// relative minutes
			const elapsedMinutes = Math.floor(elapsedMs / MILLIS_PER_MINUTE);
			return rtf.format(-elapsedMinutes, 'minutes');
		} else {
			// relative seconds
			function getSecondsElapsed() {
				const elapsedSeconds = Math.floor(elapsedMs / MILLIS_PER_SECOND);
				return -elapsedSeconds;
			}

			function formatRelative() {
				const elapsed = getSecondsElapsed();
				return elapsed === 0 ? 'now' : rtf.format(getSecondsElapsed(), 'seconds');
			}

			return formatRelative();
		}
	}

	let value: string = $state(getRelativeTimeString(computeElapsed()));

	$effect.pre(() => {
		if (computeElapsed() > MILLIS_PER_MINUTE) {
			return;
		}

		const internal = setInterval(() => {
			const elapsedMs = computeElapsed();
			value = getRelativeTimeString(elapsedMs);
		}, MILLIS_PER_SECOND);

		return () => {
			clearInterval(internal);
		};
	});

	return {
		get value() {
			return value;
		}
	};
}
