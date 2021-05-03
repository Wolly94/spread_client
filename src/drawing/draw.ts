import { MapCell } from '../shared/game/map'
import { ClientBubble, ClientCell } from '../shared/inGame/clientGameState'

export const neutralColor = 'grey'
export const selectedColor = 'black'
export const playerColors = ['blue', 'red', 'green', 'yellow']

export const drawEntity = (
    context: CanvasRenderingContext2D,
    obj: ClientCell | ClientBubble | MapCell,
    selected: boolean,
    renderUnitCount: boolean,
) => {
    // draw circle
    context.beginPath()
    context.fillStyle =
        obj.playerId != null ? playerColors[obj.playerId] : neutralColor
    context.strokeStyle = selectedColor
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

export const drawEntityScaled = (
    context: CanvasRenderingContext2D,
    obj: ClientCell | ClientBubble | MapCell,
    selected: boolean,
    renderUnitCount: boolean,
    scale: number,
) => {
    // draw circle
    context.beginPath()
    context.fillStyle =
        obj.playerId != null ? playerColors[obj.playerId] : neutralColor
    context.strokeStyle = selectedColor
    context.lineWidth = selected ? 10 * scale : 0
    context.arc(
        obj.position[0] * scale,
        obj.position[1] * scale,
        obj.radius * scale,
        0,
        2 * Math.PI,
    )
    context.stroke()
    context.fill()

    // draw unit count
    if (renderUnitCount) {
        context.lineWidth = 1
        context.fillStyle = 'black'
        context.strokeStyle = 'black'
        context.textBaseline = 'middle'
        context.textAlign = 'center'
        context.font = Math.ceil(17 * scale).toString() + 'px Arial'
        context.fillText(
            Math.floor(obj.units).toString(),
            obj.position[0] * scale,
            obj.position[1] * scale,
        )
    }
}
