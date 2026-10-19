export interface VisitingHours {
  label: string
  /** Days of the week covered by this range: 0 = Sunday … 6 = Saturday. */
  days: number[]
  /** 24-hour 'HH:mm' */
  opens: string
  /** 24-hour 'HH:mm' */
  closes: string
}

export interface Shelter {
  id: string
  name: string
  address: string
  city: string
  phone: string
  email: string
  visitingHours: VisitingHours[]
}

export interface VisitDay {
  date: Date
  /** 24-hour 'HH:mm' start times of the available one-hour visit slots. */
  times: string[]
}

export interface ScheduledVisit {
  date: Date
  time: string
}
