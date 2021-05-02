import { SpreadMap } from '../game/map'

export interface SendUnits {
    senderIds: number[]
    receiverId: number
}

export interface SendUnitsMessage {
    type: 'sendunits'
    data: SendUnits
}

export interface SetMapMessage {
    type: 'setmap'
    data: SpreadMap
}

type GameClientMessageData = SendUnitsMessage | SetMapMessage

export default GameClientMessageData
