import {
    Box,
    Button,
    Grid,
    MenuItem,
    Select,
    Typography,
} from '@material-ui/core'
import React, { useState } from 'react'
import MapPreview from '../components/mapPreview'
import MyButton from '../components/MyButton'
import ReadMap from '../components/ReadMap'
import { playerColors } from '../drawing/draw'
import { getPlayerIds, SpreadMap } from '../shared/game/map'
import { generate2PlayerMap } from '../shared/game/mapGenerator'
import {
    ClearSeatMessage,
    ClientLobbyMessage,
    SeatAiMessage,
    SetGameSettingsMessage,
    SetMapMessage,
    StartGameMessage,
    TakeSeatMessage,
} from '../shared/inGame/clientLobbyMessage'
import {
    ClientAiPlayer,
    ClientHumanPlayer,
    ClientLobbyPlayer,
    GameMechanics,
    gameMechs,
    GameSettings,
    toGameMechanics,
} from '../shared/inGame/gameServerMessages'
import GameSettingsView from './GameSettingsView'
import DisplayPlayerView from './PlayerView'

interface GameLobbyProps {
    map: SpreadMap | null
    setMap: React.Dispatch<React.SetStateAction<SpreadMap | null>>
    players: ClientLobbyPlayer[]
    gameSettings: GameSettings | null
    sendMessageToServer: (message: ClientLobbyMessage) => void
}

const GameLobby: React.FC<GameLobbyProps> = ({
    map,
    setMap,
    gameSettings,
    ...props
}) => {
    const selectMap = (map: SpreadMap) => {
        const m: SetMapMessage = {
            type: 'setmap',
            data: map,
        }
        props.sendMessageToServer(m)
        setMap(map)
    }

    const onRandomMap = () => {
        const randomMap = generate2PlayerMap(1000)
        selectMap(randomMap)
    }

    const startGame = () => {
        const m: StartGameMessage = {
            type: 'startgame',
            data: {},
        }
        props.sendMessageToServer(m)
    }

    const takeSeat = (playerId: number) => {
        const message: TakeSeatMessage = {
            type: 'takeseat',
            data: { playerId: playerId },
        }
        props.sendMessageToServer(message)
    }
    const setAi = (playerId: number) => {
        const message: SeatAiMessage = {
            type: 'seatai',
            data: { playerId: playerId },
        }
        props.sendMessageToServer(message)
    }
    const clear = (playerId: number) => {
        const message: ClearSeatMessage = {
            type: 'clearseat',
            data: { playerId: playerId },
        }
        props.sendMessageToServer(message)
    }
    const setGameSettings = (gameSettings: GameSettings) => {
        const message: SetGameSettingsMessage = {
            type: 'gamesettings',
            data: gameSettings,
        }
        props.sendMessageToServer(message)
    }

    return (
        <Box>
            <label>Connected Players: tbi</label>
            <Box>
                <Grid container spacing={2}>
                    <Grid item xs={3}>
                        <MyButton onClick={onRandomMap}>
                            {map !== null ? 'Change Map' : 'Select Map'}
                        </MyButton>
                    </Grid>
                    <Grid item xs={3}>
                        <ReadMap
                            callback={(map) => {
                                if (map !== null) selectMap(map)
                            }}
                        ></ReadMap>
                    </Grid>
                    <Grid item xs={3}>
                        <MyButton disabled={map === null} onClick={startGame}>
                            Start Game
                        </MyButton>
                    </Grid>
                    <Grid item xs={3}>
                        {gameSettings !== null && (
                            <GameSettingsView
                                gameSettings={gameSettings}
                                setGameSettings={setGameSettings}
                            ></GameSettingsView>
                        )}
                    </Grid>
                    {map !== null && (
                        <Grid item xs={12}>
                            <Grid container spacing={2}>
                                <Grid item>
                                    <MapPreview
                                        map={map}
                                        width={500}
                                        height={500}
                                    ></MapPreview>
                                </Grid>
                                <Grid item xs={3}>
                                    <Box height={500}>
                                        <DisplayPlayerView
                                            playerIds={
                                                map !== null
                                                    ? Array.from(
                                                          getPlayerIds(map),
                                                      )
                                                    : []
                                            }
                                            players={props.players}
                                            takeSeat={takeSeat}
                                            setAi={setAi}
                                            clear={clear}
                                        ></DisplayPlayerView>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Grid>
                    )}
                </Grid>
            </Box>
        </Box>
    )
}

export default GameLobby
