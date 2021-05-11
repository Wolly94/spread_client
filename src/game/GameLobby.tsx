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

interface LobbyCellProps {
    label: string
    backgroundColor?: string | undefined
}

const LobbyCell: React.FC<LobbyCellProps> = (props) => {
    return (
        <Box bgcolor={props.backgroundColor}>
            <Typography variant="h4" component="h5">
                {props.label}
            </Typography>
        </Box>
    )
}

interface EmptyRowProps {
    playerId: number
    takeSeat: (playerId: number) => void
    setAi: (playerId: number) => void
}

const EmptyRow: React.FC<EmptyRowProps> = (props) => {
    return (
        <Grid container>
            <Grid item xs={4}>
                <LobbyCell
                    label={'Player ' + (props.playerId + 1).toString()}
                    backgroundColor={playerColors[props.playerId]}
                ></LobbyCell>
            </Grid>
            <Grid item xs={4}>
                <button onClick={() => props.takeSeat(props.playerId)}>
                    <LobbyCell label={'Take'}></LobbyCell>
                </button>
            </Grid>
            <Grid item xs={4}>
                <button onClick={() => props.setAi(props.playerId)}>
                    <LobbyCell label={'AI'}></LobbyCell>
                </button>
            </Grid>
        </Grid>
    )
}

interface HumanRowProps {
    player: ClientHumanPlayer
}

const HumanRow: React.FC<HumanRowProps> = (props) => {
    return (
        <Grid container>
            <Grid item xs={4}>
                <LobbyCell
                    label={'Player ' + (props.player.playerId + 1).toString()}
                    backgroundColor={playerColors[props.player.playerId]}
                ></LobbyCell>
            </Grid>
            <Grid item xs={8}>
                <LobbyCell label={props.player.name}></LobbyCell>
            </Grid>
        </Grid>
    )
}

interface AiRowProps {
    player: ClientAiPlayer
    takeSeat: (playerId: number) => void
    clear: (playerId: number) => void
}

const AiRow: React.FC<AiRowProps> = (props) => {
    return (
        <Grid container>
            <Grid item xs={4}>
                <LobbyCell
                    label={'Player ' + (props.player.playerId + 1).toString()}
                    backgroundColor={playerColors[props.player.playerId]}
                ></LobbyCell>
            </Grid>
            <Grid item xs={2}>
                <LobbyCell label={'AI'}></LobbyCell>
            </Grid>
            <Grid item xs={3}>
                <button onClick={() => props.takeSeat(props.player.playerId)}>
                    <LobbyCell label={'Take'}></LobbyCell>
                </button>
            </Grid>
            <Grid item xs={3}>
                <button onClick={() => props.clear(props.player.playerId)}>
                    <LobbyCell label={'Open'}></LobbyCell>
                </button>
            </Grid>
        </Grid>
    )
}

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
    }

    const displayPlayers = () => {
        if (map === null) return <Box></Box>
        const playerIds = Array.from(getPlayerIds(map)).sort((a, b) => a - b)
        return (
            <Grid container spacing={3}>
                {playerIds.map((playerId) => {
                    const seatedPlayer = props.players.find(
                        (pl) => pl.playerId === playerId,
                    )
                    if (seatedPlayer === undefined) {
                        return (
                            <EmptyRow
                                playerId={playerId}
                                takeSeat={takeSeat}
                                setAi={setAi}
                            ></EmptyRow>
                        )
                    } else if (seatedPlayer.type === 'ai') {
                        return (
                            <AiRow
                                player={seatedPlayer}
                                takeSeat={takeSeat}
                                clear={clear}
                            ></AiRow>
                        )
                    } else {
                        // if (seatedPlayer.type === 'human') {
                        return <HumanRow player={seatedPlayer}></HumanRow>
                    }
                })}
            </Grid>
        )
    }

    const gmLabel = (gm: GameMechanics): string => {
        if (gm === 'basic') return 'Basic Mechanics'
        else if (gm === 'scrapeoff') return 'Scrape-Off Mechanics'
        else if (gm === 'bounce') return 'Bounce Mechanics'
        else return 'Undefined'
    }

    const displayGameSettings = () => {
        if (gameSettings === null)
            return <label>No GameSettings found yet</label>
        return (
            <Select
                value={gameSettings.mechanics}
                onChange={(e) => {
                    const s: string = e.target.value as string
                    const gameMechs = toGameMechanics(s)
                    if (gameMechs !== null)
                        setGameSettings({ mechanics: gameMechs })
                }}
                style={{ display: 'block' }}
            >
                {gameMechs.map((gm, index) => {
                    return (
                        <MenuItem key={index} value={gm}>
                            {gmLabel(gm)}
                        </MenuItem>
                    )
                })}
            </Select>
        )
    }

    return (
        <Box>
            <label>Connected Players: tbi</label>
            <Box>
                <MyButton onClick={onRandomMap}>
                    {map !== null ? 'Change Map' : 'Select Map'}
                </MyButton>
                <ReadMap
                    callback={(map) => {
                        if (map !== null) selectMap(map)
                    }}
                ></ReadMap>
                <MyButton disabled={map === null} onClick={startGame}>
                    Start Game
                </MyButton>
                {displayGameSettings()}
                {map !== null && (
                    <Grid container spacing={2}>
                        <Grid item>
                            <MapPreview
                                map={map}
                                width={500}
                                height={500}
                            ></MapPreview>
                        </Grid>
                        <Grid item xs={3}>
                            <Box height={500}>{displayPlayers()}</Box>
                        </Grid>
                    </Grid>
                )}
            </Box>
        </Box>
    )
}

export default GameLobby
