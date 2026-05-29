import { statsRepository } from '../repositories/stats.repository'

export const statsService = {
  get: async () => {
    return statsRepository.get()
  }
}