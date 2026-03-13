import { personasTools } from './personas'
import { geografiaTools } from './geografia'
import { estadisticasTools } from './estadisticas'
import { Tool } from '../types'

export const allTools: Tool[] = [
  ...personasTools,
  ...geografiaTools,
  ...estadisticasTools,
]

export { personasTools } from './personas'
export { geografiaTools } from './geografia'
export { estadisticasTools } from './estadisticas'