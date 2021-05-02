import { Box, makeStyles } from '@material-ui/core'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { drawEntity } from '../components/Game'
import { distanceToEntity, entityContainsPoint } from '../shared/game/entites'
import { MapCell, minRadius, SpreadMap } from '../shared/game/map'
import EditorForm from './editorForm'

interface MouseDownProps {
    position: [number, number]
    clickedEntityCenter: [number, number] | null
}

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
    const [mouseDownProps, setMouseDownProps] = useState<MouseDownProps | null>(
        null,
    )
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

    const adjustCellValues = useCallback(
        (cell: MapCell) => {
            cell.radius = Math.floor(cell.radius)
            cell.units = Math.floor(cell.units)
            cell.position = [
                Math.floor(cell.position[0]),
                Math.floor(cell.position[1]),
            ]
            if (cell.radius < minRadius) return 'Radius too small!'
            const availableSpace = Math.floor(
                Math.min(
                    cell.position[0],
                    cell.position[1],
                    map.width - cell.position[0],
                    map.height - cell.position[1],
                    ...map.cells
                        .filter((c) => c.id !== cell.id)
                        .map((c) => distanceToEntity(c, cell.position)),
                ),
            )
            if (availableSpace < minRadius) {
                return 'Not enough space!'
            }
            cell.radius = Math.min(availableSpace, cell.radius)
            return null
        },
        [map],
    )

    const createCell = useCallback(
        (position: [number, number]) => {
            const nextId = Math.max(0, ...usedIds) + 1
            const cell: MapCell = {
                id: nextId,
                playerId: null,
                position: position,
                radius: defaultRadius,
                units: defaultUnits,
            }
            const error = adjustCellValues(cell)
            if (error !== null) return null
            setUsedIds([...usedIds, nextId])
            addCellToMap(cell)
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
            const error = adjustCellValues(cell)
            if (error !== null) return error
            let newCells = [...map.cells]
            const index = newCells.findIndex((c) => c.id === cell.id)
            if (index >= 0) newCells[index] = cell
            setMap({ ...map, cells: newCells })
            return null
        },
        [map, setMap, adjustCellValues],
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
            const cell = map.cells.find((c) => entityContainsPoint(c, [x, y]))
            if (cell !== undefined) {
                setMouseDownProps({
                    position: [x, y],
                    clickedEntityCenter: cell.position,
                })
                setSelectedCellId(cell.id)
            } else {
                const cell = createCell([x, y])
                if (cell !== null) {
                    setSelectedCellId(cell.id)
                    setMouseDownProps({
                        position: [x, y],
                        clickedEntityCenter: cell.position,
                    })
                }
            }
        },
        [map],
    )

    const onMouseMove = useCallback(
        (x: number, y: number) => {
            if (
                selectedCell !== null &&
                mouseDownProps !== null &&
                mouseDownProps.clickedEntityCenter !== null
            ) {
                const diff = [
                    x - mouseDownProps.position[0],
                    y - mouseDownProps.position[1],
                ]
                const newPos: [number, number] = [
                    mouseDownProps.clickedEntityCenter[0] + diff[0],
                    mouseDownProps.clickedEntityCenter[1] + diff[1],
                ]
                selectedCell.position = newPos
                const error = updateCell(selectedCell)
                if (error !== null) {
                    removeCell(selectedCell.id)
                    setMouseDownProps({
                        ...mouseDownProps,
                        clickedEntityCenter: null,
                    })
                    setSelectedCellId(null)
                }
            } else if (
                selectedCell !== null &&
                mouseDownProps !== null &&
                mouseDownProps.clickedEntityCenter === null
            ) {
                setSelectedCellId(null)
                setMouseDownProps(null)
            }
        },
        [
            mouseDownProps,
            adjustCellValues,
            removeCell,
            selectedCell,
            updateCell,
        ],
    )

    const onMouseUp = useCallback(
        (x: number, y: number) => {
            setMouseDownProps(null)
        },
        [mouseDownProps],
    )

    useEffect(() => {
        if (canvasRef.current != null) {
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
                map.cells.forEach((cell) => {
                    drawEntity(context, cell, false, true)
                })
                if (selectedCell != null) {
                    drawEntity(context, selectedCell, true, true)
                }
            }
        }
    }, [map, selectedCell, height, width, onMouseDown, onMouseMove, onMouseUp])

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
                        adjustCellValues={adjustCellValues}
                    ></EditorForm>
                </Box>
            )}
        </Box>
    )
}

export default EditorCanvas
