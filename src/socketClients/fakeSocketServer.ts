export interface SocketServer<TSenderMessage, TReceiverMessage> {
    onConnect: (
        clientMessageReceive: (message: TSenderMessage) => void,
        token: string,
    ) => void
    onReceiveMessage(message: TReceiverMessage, token: string): void
    sendMessageToClients: (message: TSenderMessage) => void
    sendMessageToClientViaToken: (
        message: TSenderMessage,
        token: string,
    ) => void
}

class FakeSocketServer<TSenderMessage, TReceiverMessage>
    implements SocketServer<TSenderMessage, TReceiverMessage> {
    tokens: Map<string, (message: TSenderMessage) => void>
    onReceiveMessage: (message: TReceiverMessage, token: string) => void

    // later allow connecting other players and read data like skills accordingly
    constructor(
        onReceiveMessage: (message: TReceiverMessage, token: string) => void,
    ) {
        this.tokens = new Map()
        this.onReceiveMessage = onReceiveMessage
    }

    sendMessageToClients(message: TSenderMessage) {
        const json = JSON.stringify(message)
        this.tokens.forEach((value, key) => {
            value(message)
        })
    }

    sendMessageToClientViaToken(message: TSenderMessage, token: string) {
        const clientReceiver = this.tokens.get(token)
        if (clientReceiver === undefined) return
        const json = JSON.stringify(message)
        clientReceiver(message)
    }

    onConnect(
        clientMessageReceive: (message: TSenderMessage) => void,
        token: string,
    ) {
        if (this.tokens.has(token)) return
        else {
            this.tokens.set(token, clientMessageReceive)
        }
    }
}

export default SocketServer
