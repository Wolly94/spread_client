class SpreadGameClient {
    socket: WebSocket
    token: string
    url: string
    onReceiveMessage: null | ((message: string) => void)

    constructor(toUrl: string, token: string) {
        this.socket = new WebSocket(toUrl + '?token=' + token)
        this.token = token
        this.url = toUrl
        this.onReceiveMessage = null

        this.socket.onopen = () => {
            this.onConnect()
        }
        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data)
            if (this.onReceiveMessage != null) this.onReceiveMessage(data)
        }
        this.socket.onclose = () => {
            this.onClose()
        }
    }

    setReceiver(rec: (message: string) => void) {
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

    sendMessageToServer(message: string) {
        this.waitForSocketConnection(() => {
            this.socket.send(message)
        })
    }

    onConnect() {
        console.log('Now connected')
        this.socket.send('just connected')
    }

    onClose() {
        console.log('connection with gameserver closed')
    }
}

export default SpreadGameClient
