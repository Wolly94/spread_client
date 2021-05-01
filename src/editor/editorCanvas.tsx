import { Box, makeStyles } from '@material-ui/core'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { drawEntity } from '../components/Game'
import { distanceToEntity, entityContainsPoint } from '../shared/game/entites'
import { MapCell, minRadius, SpreadMap } from '../shared/game/map'
import EditorForm from './editorForm'

interface EditorCanvasProps {
    map: SpreadMap
    setMap: React.Dispatch<React.SetStateAction<SpreadMap>>
    unselectCell: number
}

const EditorCanvas: React.FC<EditorCanvasProps> = ({
    map,
    setMap,
    ...props
}) => {
    const width = map.width
    const height = map.height
    const defaultRadius = 50
    const defaultUnits = 50
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [usedIds, setUsedIds] = useState<number[]>([])
    const [selectedCellId, setSelectedCellId] = useState<number | null>(null)
    //const [map, setMap] = useState(props.map)
    const selectedCell = useMemo(() => {
        const c = map.cells.find((cell) => cell.id === selectedCellId)
        if (c === undefined) return null
        else return c
    }, [selectedCellId, map])

    useEffect(() => {
        setSelectedCellId(null)
    }, [props.unselectCell])

    const getSpace = (position: [number, number]) => {
        const distToBbox = Math.min(
            position[0],
            position[1],
            Math.abs(position[0] - width),
            Math.abs(position[1] - height),
        )
        const distToCells = Math.min(
            ...map.cells.map((cell) => distanceToEntity(cell, position)),
        )
        return Math.min(distToBbox, distToCells)
    }

    const createCell = useCallback(
        (position: [number, number]) => {
            position = [Math.floor(position[0]), Math.floor(position[1])]
            const space = Math.floor(getSpace(position))
            if (space < minRadius) return null
            const nextId = Math.max(0, ...usedIds) + 1
            setUsedIds([...usedIds, nextId])
            const cell: MapCell = {
                id: nextId,
                playerId: null,
                position: position,
                radius: Math.min(defaultRadius, space),
                units: defaultUnits,
            }
            return cell
        },
        [usedIds, getSpace],
    )

    const addCellToMap = useCallback(
        (cell: MapCell) => {
            if (map.cells.some((c) => c.id === cell.id)) {
                return
            }
            const cells = [...map.cells, cell]
            const players = new Set(cells.map((c) => c.playerId)).size
            setMap({ ...map, players: players, cells: cells })
        },
        [map, setMap],
    )

    const updateCell = useCallback(
        (cell: MapCell) => {
            let newCells = [...map.cells]
            const index = newCells.findIndex((c) => c.id === cell.id)
            if (index >= 0) newCells[index] = cell
            setMap({ ...map, cells: newCells })
        },
        [map, setMap],
    )

    const removeCell = useCallback(
        (cellId: number) => {
            let newCells = [...map.cells]
            const index = newCells.findIndex((c) => c.id === cellId)
            if (index >= 0) newCells.splice(index, 1)
            setMap({ ...map, cells: newCells })
        },
        [map, setMap],
    )

    const onMouseDown = useCallback(
        (x: number, y: number) => {
            if (
                selectedCell != null &&
                entityContainsPoint(selectedCell, [x, y])
            ) {
                // TODO set mouse down and stuff
            } else {
                const newCell = createCell([x, y])
                if (newCell != null) {
                    addCellToMap(newCell)
                    setSelectedCellId(newCell.id)
                }
            }
        },
        [addCellToMap, createCell, selectedCell],
    )

    useEffect(() => {
        if (canvasRef.current != null) {
            const canvas = canvasRef.current
            const rect = canvas.getBoundingClientRect()
            canvas.onmousedown = (ev) =>
                onMouseDown(ev.x - rect.left, ev.y - rect.top)
            /*
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
                if (selectedCell != null) {
                    drawEntity(context, selectedCell, true, true)
                }
            }
        }
    }, [map, onMouseDown, selectedCell])

    return (
        <Box display="flex">
            <Box width={width}>
                <canvas
                    style={{ border: '1px solid black' }}
                    ref={canvasRef}
                    height={height}
                    width={width}
                />
            </Box>
            {selectedCell !== null && (
                <Box paddingLeft={3} width={400}>
                    <EditorForm
                        selectedCell={selectedCell}
                        map={map}
                        updateSelectedCell={(selCell) => {
                            updateCell(selCell)
                        }}
                        removeCell={removeCell}
                    ></EditorForm>
                </Box>
            )}
        </Box>
    )
}

export default EditorCanvas
