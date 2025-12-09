import { getBavariaHolidaysTool, getCurrentYearMonthInBerlinTool } from './holiday'
import { commonInfoTool } from './fqa'
import type { ToolSet } from 'ai'

export const tools = {
  getCurrentYearMonthInBerlin: getCurrentYearMonthInBerlinTool,
  getBavariaHolidays: getBavariaHolidaysTool,
  commonInfo: commonInfoTool,
} satisfies ToolSet
