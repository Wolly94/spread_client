import Cell from './cell'
import Player from './player'

export interface SpreadMap {
    cells: Cell[]
    players: number
}

export const emptyMap = (): SpreadMap => {
    return {
        cells: [],
        players: 1,
    }
}

export const exampleMap = (): SpreadMap => {
    return {
        cells: [
            new Cell(0, [100, 100], 100, 50),
            new Cell(0, [200, 200], 100, 50),
            new Cell(1, [300, 300], 75, 50),
        ],
        players: 2,
    }
}
