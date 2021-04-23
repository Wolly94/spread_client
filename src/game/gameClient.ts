import ClientMessage, { ClientMessageData } from '../shared/clientMessages'
import ServerMessage from '../shared/serverMessages'

class SpreadGameClient {
    socket: WebSocket
    token: string
    url: string
    onReceiveMessage: null | ((message: ServerMessage) => void)

    constructor(toUrl: string, token: string) {
        this.socket = new WebSocket(toUrl + '?token=' + token)
        this.token = token
        this.url = toUrl
        this.onReceiveMessage = null

        this.socket.onopen = () => {
            this.onConnect()
        }
        this.socket.onmessage = (event) => {
            const data: ServerMessage = JSON.parse(event.data)
            if (this.onReceiveMessage != null) this.onReceiveMessage(data)
        }
        this.socket.onclose = () => {
            this.onClose()
        }
    }

    setReceiver(rec: (message: ServerMessage) => void) {
        this.onReceiveMessage = rec
    }

    waitForSocketConnection(callback: () => void) {
        setTimeout(() => {
            if (this.socket.readyState === WebSocket.OPEN) {
                callback()
            } else {
                this.waitForSocketConnection(callback)
            }
        }, 100)
    }

    sendMessageToServer(message: ClientMessageData) {
        const mData: ClientMessage = {
            token: this.token,
            data: message,
        }
        const m = JSON.stringify(mData)
        this.waitForSocketConnection(() => {
            this.socket.send(m)
        })
    }

    onConnect() {
        console.log('Now connected')
    }

    onClose() {
        console.log('connection with gameserver closed')
    }
}

export default SpreadGameClient
