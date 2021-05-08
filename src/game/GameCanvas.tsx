import { Box } from '@material-ui/core'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { drawEntityScaled } from '../drawing/draw'
import { entityContainsPoint } from '../shared/game/entites'
import { SpreadMap } from '../shared/game/map'
import { ClientCell, ClientGameState } from '../shared/inGame/clientGameState'
import {
    ClientInGameMessage,
    SendUnits,
} from '../shared/inGame/clientInGameMessage'

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

    const scaleFactor = useMemo(() => {
        const ratio = Math.min(
            window.screen.width / props.map.width,
            window.screen.height / props.map.height,
        )
        return ratio * 0.8
    }, [props.map])

    const getCanvasRect = useCallback(() => {
        if (canvasRef.current !== null) {
            const rect = canvasRef.current.getBoundingClientRect()
            return rect
        } else {
            return null
        }
    }, [])

    const getMapCoordinates = useCallback(
        (ev: MouseEvent): [number, number] => {
            const canvasRect = getCanvasRect()
            if (canvasRect === null) return [ev.x, ev.y]
            const x = (ev.x - canvasRect.left) / scaleFactor
            const y = (ev.y - canvasRect.top) / scaleFactor
            return [x, y]
        },
        [getCanvasRect, scaleFactor],
    )

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
        (ev: MouseEvent) => {
            const [x, y] = getMapCoordinates(ev)
            const cell = cellBelowCursor(x, y)
            if (cell != null && cell.playerId === playerId) {
                setMouseDown(true)
                setSelectedCellIds([cell.id])
                console.log('SELECTED')
            } else {
                setSelectedCellIds([])
            }
        },
        [cellBelowCursor, playerId, getMapCoordinates],
    )

    const onMouseMove = useCallback(
        (ev: MouseEvent) => {
            const [x, y] = getMapCoordinates(ev)
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
        [
            selectedCellIds,
            mouseDown,
            playerId,
            cellBelowCursor,
            getMapCoordinates,
        ],
    )

    const onMouseUp = useCallback(
        (ev: MouseEvent) => {
            const [x, y] = getMapCoordinates(ev)
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
        [mouseDown, cellBelowCursor, props, selectedCellIds, getMapCoordinates],
    )

    // update mouse event methods on change
    // render on canvas
    useEffect(() => {
        if (canvasRef.current != null && clientGameState != null) {
            const canvas = canvasRef.current
            canvas.onmousedown = (ev) => onMouseDown(ev)
            canvas.onmousemove = (ev) => onMouseMove(ev)
            canvas.onmouseup = (ev) => onMouseUp(ev)
            const context = canvas.getContext('2d')
            if (context != null) {
                context.clearRect(0, 0, props.map.width, props.map.height)
                clientGameState.cells.forEach((cell) => {
                    drawEntityScaled(
                        context,
                        cell,
                        selectedCellIds.some((cId) => cId === cell.id),
                        true,
                        scaleFactor,
                    )
                })
                clientGameState.bubbles.forEach((bubble) => {
                    drawEntityScaled(context, bubble, false, true, scaleFactor)
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
        scaleFactor,
    ])

    return (
        <Box>
            <label>Player Id: {playerId}</label>
            <canvas
                style={{ border: '1px solid black' }}
                ref={canvasRef}
                height={props.map.height * scaleFactor}
                width={props.map.width * scaleFactor}
            />
        </Box>
    )
}

export default GameCanvas
