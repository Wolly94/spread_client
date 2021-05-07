import { Box } from '@material-ui/core'
import React from 'react'
import MapPreview from '../components/mapPreview'
import MyButton from '../components/MyButton'
import { playerColors } from '../drawing/draw'
import { SpreadMap } from '../shared/game/map'
import { generate2PlayerMap } from '../shared/game/mapGenerator'
import {
    ClientLobbyMessage,
    SetMapMessage,
    StartGameMessage,
} from '../shared/inGame/gameClientMessages'

interface GameLobbyProps {
    map: SpreadMap | null
    setMap: React.Dispatch<React.SetStateAction<SpreadMap | null>>
    sendMessageToServer: (message: ClientLobbyMessage) => void
}

const GameLobby: React.FC<GameLobbyProps> = ({ map, setMap, ...props }) => {
    const onSelectMap = () => {
        const randomMap = generate2PlayerMap(1000)
        const m: SetMapMessage = {
            type: 'setmap',
            data: randomMap,
        }
        props.sendMessageToServer(m)
        setMap(randomMap)
    }
    const startGame = () => {
        const m: StartGameMessage = {
            type: 'startgame',
            data: {},
        }
        props.sendMessageToServer(m)
    }
    return (
        <Box>
            <label>Connected Players: tbi</label>
            <MyButton onClick={onSelectMap}>
                {map !== null ? 'Change Map' : 'Select Map'}
            </MyButton>
            <MyButton disabled={map === null} onClick={startGame}>
                Start Game
            </MyButton>
            {map !== null && (
                <MapPreview map={map} width={500} height={500}></MapPreview>
            )}
        </Box>
    )
}

export default GameLobby
