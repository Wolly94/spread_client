import { Box } from '@material-ui/core'
import React, { useEffect, useRef } from 'react'

const EditorCanvas = () => {
    const width = 1000
    const height = 1000
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [map, setMap] = useState()

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

    return (
        <Box>
            <canvas
                style={{ border: '1px solid black' }}
                ref={canvasRef}
                height={height}
                width={width}
            />
        </Box>
    )
}

export default EditorCanvas
