import { Box } from '@material-ui/core'
import React, { useEffect, useRef, useState } from 'react'
import { drawEntity } from '../components/Game'
import { emptyMap, exampleMap, SpreadMap } from '../shared/game/map'

interface EditorCanvasProps {
    map: SpreadMap
    setMap: React.Dispatch<React.SetStateAction<SpreadMap>>
}

const EditorCanvas: React.FC<EditorCanvasProps> = ({
    map,
    setMap,
    ...props
}) => {
    const width = 1000
    const height = 1000
    const canvasRef = useRef<HTMLCanvasElement>(null)
    //const [map, setMap] = useState(props.map)

    useEffect(() => {
        if (canvasRef.current != null) {
            const canvas = canvasRef.current
            const rect = canvas.getBoundingClientRect()
            /*             canvas.onmousedown = (ev) =>
                onMouseDown(ev.x - rect.left, ev.y - rect.top)
            canvas.onmousemove = (ev) =>
                onMouseMove(ev.x - rect.left, ev.y - rect.top)
            canvas.onmouseup = (ev) =>
                onMouseUp(ev.x - rect.left, ev.y - rect.top) */
            const context = canvas.getContext('2d')
            if (context != null) {
                context.clearRect(0, 0, width, height)
                map.cells.forEach((cell) => {
                    drawEntity(context, cell, false, true)
                })
            }
        }
    }, [map])

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
