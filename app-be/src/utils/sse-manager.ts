import { Response } from 'express'

class SSEManager {
  private clients = new Map<string, Set<Response>>()

  addClient(userId: string, res: Response) {
    const clients = this.clients.get(userId) ?? new Set<Response>()
    clients.add(res)
    this.clients.set(userId, clients)
  }

  removeClient(userId: string, res: Response) {
    const clients = this.clients.get(userId)
    clients?.delete(res)
    if (clients?.size === 0) this.clients.delete(userId)
  }

  disconnectUser(userId: string) {
    const clients = this.clients.get(userId)
    this.clients.delete(userId)
    clients?.forEach(client => client.end())
  }

  emit(userId: string, data: object) {
    this.clients.get(userId)?.forEach(client => {
      client.write(`data: ${JSON.stringify(data)}\n\n`)
    })
  }

  emitToAll(data: object) {
    this.clients.forEach((_clients, userId) => this.emit(userId, data))
  }
}

export const sseManager = new SSEManager()
