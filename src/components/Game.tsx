import { useEffect, useRef, useState } from 'react'
import { ClientMessageData, SendUnits } from '../shared/clientMessages'
import {
    ClientBubble,
    ClientCell,
    ClientGameState,
} from '../shared/clientState'
import ServerMessage from '../shared/serverMessages'
import SocketClient from '../socketClients/socketClient'

interface GameProps {
    token: string
    gameSocketUrl: string
}

const Game: React.FC<GameProps> = (props) => {
    const spreadGameClient = useRef<SocketClient<
        ServerMessage,
        ClientMessageData
    > | null>(null)
    const [
        clientGameState,
        setClientGameData,
    ] = useState<ClientGameState | null>(null)
    const playerId = 0

    const width = 1000
    const height = 1000
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [selectedCellIds, setSelectedCellIds] = useState<number[]>([])
    const [mouseDown, setMouseDown] = useState(false)

    // init the socket on initial render
    useEffect(() => {
        spreadGameClient.current = new SocketClient(
            props.gameSocketUrl,
            props.token,
        )
        const onMessageReceive = (message: ServerMessage) => {
            //console.log('message received: ', message)
            if (message.type === 'gamestate') {
                setClientGameData(message.data)
            } else if (message.type === 'gameover') {
                console.log('game is over!')
            }
        }
        spreadGameClient.current.setReceiver(onMessageReceive)
    }, [props.token, props.gameSocketUrl])

    // update mouse event methods on change
    // render on canvas
    useEffect(() => {
        const cellBelowCursor = (x: number, y: number): ClientCell | null => {
            if (clientGameState == null) return null
            const found = clientGameState.cells.filter(
                (cell) =>
                    (cell.position[0] - x) ** 2 + (cell.position[1] - y) ** 2 <=
                    cell.radius ** 2,
            )
            if (found.length > 0) return found[0]
            else return null
        }
        const onMouseDown = (x: number, y: number) => {
            console.log(x, y)
            const cell = cellBelowCursor(x, y)
            if (cell != null && cell.playerId === playerId) {
                setMouseDown(true)
                setSelectedCellIds([cell.id])
                console.log('SELECTED')
            } else {
                setSelectedCellIds([])
            }
        }

        const onMouseMove = (x: number, y: number) => {
            if (mouseDown && selectedCellIds.length > 0) {
                const cell = cellBelowCursor(x, y)
                if (
                    cell != null &&
                    cell.playerId === playerId &&
                    !selectedCellIds.some((cId) => cId === cell.id)
                ) {
                    setSelectedCellIds([...selectedCellIds, cell.id])
                    console.log('SELECTED')
                }
            }
        }

        const onMouseUp = (x: number, y: number) => {
            if (
                mouseDown &&
                selectedCellIds.length > 0 &&
                spreadGameClient.current != null
            ) {
                const cell = cellBelowCursor(x, y)
                if (cell != null) {
                    const sendUnits: SendUnits = {
                        senderIds: selectedCellIds,
                        receiverId: cell.id,
                    }
                    spreadGameClient.current.sendMessageToServer({
                        type: 'sendunits',
                        data: sendUnits,
                    })
                    setSelectedCellIds([])
                    setMouseDown(false)
                    console.log('SENDUNITS')
                }
            }
        }

        if (canvasRef.current != null && clientGameState != null) {
            const canvas = canvasRef.current
            const rect = canvas.getBoundingClientRect()
            canvas.onmousedown = (ev) =>
                onMouseDown(ev.x - rect.left, ev.y - rect.top)
            canvas.onmousemove = (ev) =>
                onMouseMove(ev.x - rect.left, ev.y - rect.top)
            canvas.onmouseup = (ev) =>
                onMouseUp(ev.x - rect.left, ev.y - rect.top)
            const context = canvas.getContext('2d')
            if (context != null) {
                context.clearRect(0, 0, width, height)
                clientGameState.cells.forEach((cell) => {
                    drawEntity(
                        context,
                        cell,
                        selectedCellIds.some((cId) => cId === cell.id),
                        true,
                    )
                })
                clientGameState.bubbles.forEach((bubble) => {
                    drawEntity(context, bubble, false, true)
                })
            }
        }
    }, [selectedCellIds, clientGameState, mouseDown])

    const subView = () => {
        if (spreadGameClient.current == null) {
            return <label> Not yet connected!</label>
        } else {
            return (
                <label>
                    connected with game server: {spreadGameClient.current.url}{' '}
                    via token: {spreadGameClient.current.token}
                </label>
            )
        }
    }
    return (
        <div>
            {subView()}
            <canvas
                style={{ border: '1px solid black' }}
                ref={canvasRef}
                height={height}
                width={width}
            />
        </div>
    )
}

export default Game

const neutralColor = 'grey'
const playerColors = ['blue', 'red', 'green', 'yellow']

const drawEntity = (
    context: CanvasRenderingContext2D,
    obj: ClientCell | ClientBubble,
    selected: boolean,
    renderUnitCount: boolean,
) => {
    // draw circle
    context.beginPath()
    context.fillStyle =
        obj.playerId != null ? playerColors[obj.playerId] : neutralColor
    context.strokeStyle = 'grey'
    context.lineWidth = selected ? 10 : 0
    context.arc(obj.position[0], obj.position[1], obj.radius, 0, 2 * Math.PI)
    context.stroke()
    context.fill()

    // draw unit count
    if (renderUnitCount) {
        context.lineWidth = 1
        context.fillStyle = 'black'
        context.strokeStyle = 'black'
        context.textBaseline = 'middle'
        context.textAlign = 'center'
        context.font = '17px Arial'
        context.fillText(
            Math.floor(obj.units).toString(),
            obj.position[0],
            obj.position[1],
        )
    }
}
