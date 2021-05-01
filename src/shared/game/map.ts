import Cell from './cell'

export interface MapCell {
    id: number
    playerId: number | null
    position: [number, number]
    radius: number
    units: number
}

export interface SpreadMap {
    cells: MapCell[]
    players: number
    width: number
    height: number
}

export const minRadius = 15

export const emptyMap = (): SpreadMap => {
    return {
        cells: [],
        players: 0,
        width: 1000,
        height: 1000,
    }
}

export const exampleMap = (): SpreadMap => {
    return {
        cells: [
            new Cell(0, 0, [100, 100], 100, 50),
            new Cell(1, 0, [200, 200], 100, 50),
            new Cell(2, 1, [300, 300], 75, 50),
        ],
        players: 2,
        width: 1000,
        height: 1000,
    }
}
