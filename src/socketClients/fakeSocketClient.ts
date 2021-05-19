export interface SocketClient<TReceiveMessage, TSenderMessageData> {
    close: () => void
    onReceiveMessage: (message: TReceiveMessage) => void
    sendMessageToServer: (message: TSenderMessageData) => void
}

class FakeSocketClient<TReceiveMessage, TSenderMessageData>
    implements SocketClient<TReceiveMessage, TSenderMessageData> {
    close: () => void
    onReceiveMessage: (message: TReceiveMessage) => void
    sendMessageToServer: (message: TSenderMessageData) => void
    constructor(
        close: () => void,
        onReceiveMessage: (message: TReceiveMessage) => void,
        sendMessageToServer: (message: TSenderMessageData) => void,
    ) {
        this.close = close
        this.onReceiveMessage = onReceiveMessage
        this.sendMessageToServer = sendMessageToServer
    }
}

export default FakeSocketClient
