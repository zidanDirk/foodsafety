import type { NextApiRequest } from 'next'
import { Server as HttpServer } from 'http'
import { WebSocketServer } from 'ws'

// Extend the Node.js global type definitions
declare global {
  namespace NodeJS {
    interface Global {
      wss: WebSocketServer | null
    }
  }
}

// Extend the Next.js HTTP server type
interface NextHttpServer extends HttpServer {
  wss?: WebSocketServer
}

// Store active connections
export const connections = new Map<string, WebSocket>()

export default function handler(req: NextApiRequest, res: any) {
  // Check if this is a WebSocket upgrade request
  if (res.socket?.server?.wss) {
    res.status(200).json({ message: 'WebSocket server already initialized' })
    return
  }

  // Cast to our extended type
  const server = res.socket.server as NextHttpServer

  // Create WebSocket server
  const wss = new WebSocketServer({ noServer: true })
  
  // Store reference to WebSocket server
  server.wss = wss

  // Handle upgrade requests
  server.on('upgrade', (request, socket, head) => {
    if (request.url === '/api/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request)
      })
    } else {
      socket.destroy()
    }
  })

  // Handle WebSocket connections
  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected')
    
    // Handle messages from client
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString())
        if (data.type === 'subscribe' && data.taskId) {
          // Store the connection for this task
          connections.set(data.taskId, ws)
        }
      } catch (error) {
        console.error('WebSocket message error:', error)
      }
    })
    
    // Handle connection close
    ws.on('close', () => {
      console.log('WebSocket client disconnected')
      // Remove connection from map
      for (const [taskId, connection] of connections.entries()) {
        if (connection === ws) {
          connections.delete(taskId)
          break
        }
      }
    })
  })

  res.status(200).json({ message: 'WebSocket server initialized' })
}