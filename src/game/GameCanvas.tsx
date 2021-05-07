import { Box } from '@material-ui/core'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { drawEntity } from '../drawing/draw'
import { entityContainsPoint } from '../shared/game/entites'
import { SpreadMap } from '../shared/game/map'
import { ClientCell, ClientGameState } from '../shared/inGame/clientGameState'
import {
    ClientInGameMessage,
    SendUnits,
} from '../shared/inGame/gameClientMessages'

interface GameCanvasProps {
    map: SpreadMap
    clientGameState: ClientGameState
    playerId: number | null
    sendMessageToServer: (message: ClientInGameMessage) => void
}

const GameCanvas: React.FC<GameCanvasProps> = ({
    clientGameState,
    playerId,
    ...props
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [selectedCellIds, setSelectedCellIds] = useState<number[]>([])
    const [mouseDown, setMouseDown] = useState(false)

    const cellBelowCursor = useCallback(
        (x: number, y: number): ClientCell | null => {
            const cell = clientGameState.cells.find((c) =>
                entityContainsPoint(c, [x, y]),
            )
            if (cell === undefined) return null
            else return cell
        },
        [clientGameState],
    )

    const onMouseDown = useCallback(
        (x: number, y: number) => {
            console.log(x, y)
            const cell = cellBelowCursor(x, y)
            if (cell != null && cell.playerId === playerId) {
                setMouseDown(true)
                setSelectedCellIds([cell.id])
                console.log('SELECTED')
            } else {
                setSelectedCellIds([])
            }
        },
        [cellBelowCursor, playerId],
    )

    const onMouseMove = useCallback(
        (x: number, y: number) => {
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
        },
        [selectedCellIds, mouseDown, playerId, cellBelowCursor],
    )

    const onMouseUp = useCallback(
        (x: number, y: number) => {
            if (mouseDown && selectedCellIds.length > 0) {
                const cell = cellBelowCursor(x, y)
                if (cell != null) {
                    const sendUnits: SendUnits = {
                        senderIds: selectedCellIds,
                        receiverId: cell.id,
                    }
                    props.sendMessageToServer({
                        type: 'sendunits',
                        data: sendUnits,
                    })
                    console.log('SENDUNITS')
                }
            }
            setMouseDown(false)
            setSelectedCellIds([])
        },
        [mouseDown, cellBelowCursor, props, selectedCellIds],
    )

    // update mouse event methods on change
    // render on canvas
    useEffect(() => {
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
                context.clearRect(0, 0, props.map.width, props.map.height)
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
    }, [
        selectedCellIds,
        clientGameState,
        mouseDown,
        onMouseDown,
        onMouseUp,
        onMouseMove,
        playerId,
        props.map,
    ])

    return (
        <Box>
            <label>Player Id: {playerId}</label>
            <canvas
                style={{ border: '1px solid black' }}
                ref={canvasRef}
                height={props.map.height}
                width={props.map.width}
            />
        </Box>
    )
}

export default GameCanvas
