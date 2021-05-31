import {
    ClientCell,
    ClientBubble,
} from 'spread_game/dist/messages/inGame/clientGameState'
import Bubble from 'spread_game/dist/spreadGame/bubble'
import { MapCell } from 'spread_game/dist/spreadGame/map/map'

export const neutralColor = 'grey'
export const selectedColor = 'black'
export const playerColors = ['blue', 'red', 'green', 'yellow']

const drawCircle = (
    context: CanvasRenderingContext2D,
    center: [number, number],
    radius: number,
    fillColor?: string,
    outline?: {
        color: string
        width: number
    },
    text?: {
        value: string
        fontSize: number
    },
) => {
    context.beginPath()
    if (fillColor) context.fillStyle = fillColor
    if (outline) {
        context.strokeStyle = outline.color
        context.lineWidth = outline.width
    }
    context.arc(center[0], center[1], radius, 0, 2 * Math.PI)
    if (outline) context.stroke()
    if (fillColor) context.fill()

    if (text) {
        context.lineWidth = 1
        context.fillStyle = 'black'
        context.strokeStyle = 'black'
        context.textBaseline = 'middle'
        context.textAlign = 'center'
        context.font = Math.ceil(text.fontSize).toString() + 'px Arial'
        context.fillText(text.value, center[0], center[1])
    }
}

export const drawBubble = (
    context: CanvasRenderingContext2D,
    bubble: ClientBubble,
    scale: number,
) => {
    const fillColor =
        bubble.playerId != null ? playerColors[bubble.playerId] : neutralColor
    const additionalAttack = bubble.attackCombatAbilities - 1
    drawCircle(
        context,
        [bubble.position[0] * scale, bubble.position[1] * scale],
        bubble.radius * scale,
        fillColor,
        additionalAttack > 0
            ? { color: 'darkred', width: (additionalAttack * 100) / 5 }
            : undefined,
        { value: Math.floor(bubble.units).toString(), fontSize: 17 * scale },
    )
}

export const drawCell = (
    context: CanvasRenderingContext2D,
    cell: ClientCell,
    selected: boolean,
    scale: number,
) => {
    const fillColor =
        cell.playerId != null ? playerColors[cell.playerId] : neutralColor
    drawCircle(
        context,
        [cell.position[0] * scale, cell.position[1] * scale],
        cell.radius * scale,
        fillColor,
        selected
            ? { color: selectedColor, width: 10 * scale }
            : { color: 'black', width: 1 },
        { value: Math.floor(cell.units).toString(), fontSize: 17 * scale },
    )
}

export const drawMapCell = drawCell
