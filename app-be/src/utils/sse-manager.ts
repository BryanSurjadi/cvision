import { Response } from 'express'

class SSEManager {
  private clients: Map<string, Response> = new Map()

  addClient(userId: string, res: Response) {
    this.clients.set(userId, res)
    console.log(`SSE client connected: ${userId}`)
  }

  removeClient(userId: string) {
    this.clients.delete(userId)
    console.log(`SSE client disconnected: ${userId}`)
  }

  emit(userId: string, data: object) {
    const client = this.clients.get(userId)
    if (client) {
      client.write(`data: ${JSON.stringify(data)}\n\n`)
    }
  }

  emitToAll(data: object) {
    this.clients.forEach((client) => {
      client.write(`data: ${JSON.stringify(data)}\n\n`)
    })
  }
}

export const sseManager = new SSEManager()