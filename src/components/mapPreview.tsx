import { Box } from '@material-ui/core'
import React, { useEffect, useRef } from 'react'
import { drawEntityScaled } from '../drawing/draw'
import { SpreadMap } from '../shared/game/map'

interface MapPreviewProps {
    map: SpreadMap
    width: number
    height: number
}

const MapPreview: React.FC<MapPreviewProps> = (props) => {
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
                props.map.cells.forEach((cell) => {
                    drawEntityScaled(
                        context,
                        cell,
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

export default MapPreview
