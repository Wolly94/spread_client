import { Box } from '@material-ui/core'
import React, { useRef, useEffect } from 'react'
import { ClientGameState } from 'spread_game/dist/messages/inGame/clientGameState'
import { SpreadMap } from 'spread_game/dist/spreadGame/map/map'
import { drawEntityScaled } from '../drawing/draw'

interface ClientGameStateViewProps {
    map: SpreadMap
    state: ClientGameState
    width: number
    height: number
}

const ClientGameStateView: React.FC<ClientGameStateViewProps> = (props) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const scaleFactor = Math.max(
            props.map.width / props.width,
            props.map.height / props.height,
        )
        if (canvasRef.current != null) {
            const context = canvasRef.current.getContext('2d')
            if (context != null) {
                context.clearRect(0, 0, props.width, props.height)
                props.state.cells.forEach((cell) => {
                    drawEntityScaled(
                        context,
                        cell,
                        false,
                        true,
                        1 / scaleFactor,
                    )
                })
                props.state.bubbles.forEach((bubbles) => {
                    drawEntityScaled(
                        context,
                        bubbles,
                        false,
                        true,
                        1 / scaleFactor,
                    )
                })
            }
        }
    }, [props])

    return (
        <Box>
            <canvas
                style={{ border: '1px solid black' }}
                ref={canvasRef}
                height={props.height}
                width={props.width}
            />
        </Box>
    )
}

export default ClientGameStateView
