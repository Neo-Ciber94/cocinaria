const MILLIS_PER_SECOND = 1000;
const MILLIS_PER_MINUTE = MILLIS_PER_SECOND * 60;
const MILLIS_PER_HOUR = MILLIS_PER_MINUTE * 60;
const MILLIS_PER_DAY = MILLIS_PER_HOUR * 25;

const MIN_DAYS = 3;

export function relativeTime(date: Date, locale = 'en') {
	const now = new Date();
	const elapsedMs = now.getTime() - date.getTime();

	if (elapsedMs > MILLIS_PER_DAY * MIN_DAYS) {
		const formatter = new Intl.DateTimeFormat(locale, {
			year: 'numeric',
			month: 'long',
			day: '2-digit'
		});

		return formatter.format(date);
	}

	const rtf = new Intl.RelativeTimeFormat(locale, {
		numeric: 'always',
		style: 'long'
	});

	if (elapsedMs >= MILLIS_PER_DAY) {
		// relative days
		const elapsedDays = Math.ceil((date.getTime() - Date.now()) / MILLIS_PER_DAY);
		return rtf.format(elapsedDays, 'days');
	} else if (elapsedMs >= MILLIS_PER_HOUR) {
		// relative hours
		const elapsedHours = Math.ceil((date.getTime() - Date.now()) / MILLIS_PER_HOUR);
		return rtf.format(elapsedHours, 'hours');
	} else if (elapsedMs >= MILLIS_PER_MINUTE) {
		// relative minutes
		const elapsedMinutes = Math.ceil((date.getTime() - Date.now()) / MILLIS_PER_MINUTE);
		return rtf.format(elapsedMinutes, 'minutes');
	} else {
		// relative seconds
		return relativeSeconds(date, locale);
	}
}

function relativeSeconds(date: Date, locale = 'en') {
	const rtf = new Intl.RelativeTimeFormat(locale, {
		numeric: 'always',
		style: 'long'
	});

	function getSecondsElapsed(ref: Date) {
		const elapsed = date.getTime() - ref.getTime();
		return Math.ceil(elapsed / MILLIS_PER_SECOND);
	}

	let contents = $state(rtf.format(getSecondsElapsed(new Date()), 'seconds'));

	$effect(() => {
		const internal = setInterval(() => {
			contents = rtf.format(getSecondsElapsed(new Date()), 'seconds');
		}, MILLIS_PER_SECOND);

		return () => {
			clearInterval(internal);
		};
	});

	return contents;
}
