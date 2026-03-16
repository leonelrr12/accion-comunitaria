import { personasTools } from './personas'
import { geografiaTools } from './geografia'
import { estadisticasTools } from './estadisticas'
import { usuariosTools } from './usuarios'
import { Tool } from '../types'

export const allTools: Tool[] = [
  ...personasTools,
  ...geografiaTools,
  ...estadisticasTools,
  ...usuariosTools,
]

export { personasTools } from './personas'
export { geografiaTools } from './geografia'
export { estadisticasTools } from './estadisticas'
export { usuariosTools } from './usuarios'