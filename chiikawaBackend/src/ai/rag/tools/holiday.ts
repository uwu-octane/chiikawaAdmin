// src/ai/tools/holiday.ts
import { tool } from 'ai'
import { z } from 'zod'

// Nager.Date
type NagerHoliday = {
  date: string // format: '2025-01-01'
  localName: string
  name: string
  counties: string[] | null
  global: boolean
}

/**
 * Get the current year and month in Europe/Berlin
 */
function getCurrentYearMonthInBerlin() {
  const now = new Date()

  const year = Number(
    new Intl.DateTimeFormat('de-DE', {
      year: 'numeric',
      timeZone: 'Europe/Berlin',
    }).format(now),
  )

  const month = Number(
    new Intl.DateTimeFormat('de-DE', {
      month: 'numeric',
      timeZone: 'Europe/Berlin',
    }).format(now),
  )

  const day = Number(
    new Intl.DateTimeFormat('de-DE', {
      day: 'numeric',
      timeZone: 'Europe/Berlin',
    }).format(now),
  )

  const weekday = new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    timeZone: 'Europe/Berlin',
  }).format(now) // e.g. "Dienstag"

  const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  return { year, month, day, weekday, isoDate }
}

export const getCurrentYearMonthInBerlinTool = tool({
  description:
    'Get the current date (year, month, day and weekday) in the Europe/Berlin time zone. ' +
    'Useful for resolving relative dates like "next Monday" or "in 3 months".',

  inputSchema: z
    .object({})
    .describe('No input required. Returns current date information in Europe/Berlin.'),

  async execute() {
    return getCurrentYearMonthInBerlin()
  },
})

/**
 * Query the public holidays in Bavaria (DE-BY) for a given month
 *
 * - Default to the current year and month in Europe/Berlin
 * - can be overridden to a specific year and month
 */
export const getBavariaHolidaysTool = tool({
  description:
    'Query the public holidays in Bavaria (DE-BY) for a given month.' +
    'If not specified, the current year and month in Europe/Berlin will be used.',

  inputSchema: z
    .object({
      year: z
        .number()
        .int()
        .min(2000)
        .max(2100)
        .optional()
        .describe(
          'Year, e.g. 2025. If not specified, the current year in Europe/Berlin will be used.',
        ),
      month: z
        .number()
        .int()
        .min(1)
        .max(12)
        .optional()
        .describe(
          'Month, 1-12. If not specified, the current month in Europe/Berlin will be used.',
        ),
    })
    .describe('Query parameters'),

  // Actually execute the query logic
  async execute({ year, month }) {
    const { year: defaultYear, month: defaultMonth } = getCurrentYearMonthInBerlin()
    const finalYear = year ?? defaultYear
    const finalMonth = month ?? defaultMonth

    // Call the Nager.Date public holidays API
    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${finalYear}/DE`)
    if (!res.ok) {
      throw new Error(`Failed to fetch holidays from Nager.Date: ${res.status} ${res.statusText}`)
    }

    const data = (await res.json()) as NagerHoliday[]

    // Filter
    const holidays = data
      .filter((h) => {
        const [y, m] = h.date.split('-').map(Number)
        if (y !== finalYear || m !== finalMonth) return false

        // national holidays
        if (h.counties == null) return true

        // Bavaria holidays
        return h.counties.includes('DE-BY')
      })
      .map((h) => ({
        date: h.date, // format: '2025-12-25'
        weekday: new Intl.DateTimeFormat('de-DE', {
          weekday: 'long',
          timeZone: 'Europe/Berlin',
        }).format(new Date(h.date + 'T12:00:00')),
        localName: h.localName, // local language name, e.g. "Neujahr"
        name: h.name, // English name, e.g. "New Year's Day"
      }))

    return {
      state: 'DE-BY',
      year: finalYear,
      month: finalMonth,
      holidays,
    }
  },
})
