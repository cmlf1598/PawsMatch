const LOCALE = 'es-GT'

const timeFormat = new Intl.DateTimeFormat(LOCALE, { hour: 'numeric', minute: '2-digit' })
const longDateFormat = new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' })
const weekdayFormat = new Intl.DateTimeFormat(LOCALE, { weekday: 'short' })
const monthFormat = new Intl.DateTimeFormat(LOCALE, { month: 'short' })

/** '13:00' → '1:00 p. m.' */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  return timeFormat.format(new Date(2000, 0, 1, hours, minutes))
}

/** → 'jueves, 22 de octubre' */
export function formatLongDate(date: Date): string {
  return longDateFormat.format(date)
}

/** → { weekday: 'jue', day: '22', month: 'oct' } */
export function formatDayParts(date: Date) {
  return {
    weekday: weekdayFormat.format(date).replace('.', ''),
    day: String(date.getDate()),
    month: monthFormat.format(date).replace('.', ''),
  }
}
