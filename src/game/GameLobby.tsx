import { Box, Button, Grid, Typography } from '@material-ui/core'
import React from 'react'
import MapPreview from '../components/mapPreview'
import MyButton from '../components/MyButton'
import ReadMap from '../components/ReadMap'
import { playerColors } from '../drawing/draw'
import { getPlayerIds, SpreadMap } from '../shared/game/map'
import { generate2PlayerMap } from '../shared/game/mapGenerator'
import {
    ClientLobbyMessage,
    SetMapMessage,
    StartGameMessage,
} from '../shared/inGame/gameClientMessages'
import { ClientLobbyPlayer } from '../shared/inGame/gameServerMessages'

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

interface GameLobbyProps {
    map: SpreadMap | null
    setMap: React.Dispatch<React.SetStateAction<SpreadMap | null>>
    players: ClientLobbyPlayer[]
    sendMessageToServer: (message: ClientLobbyMessage) => void
}

const GameLobby: React.FC<GameLobbyProps> = ({ map, setMap, ...props }) => {
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
        const x = 10
    }

    const displayPlayers = () => {
        if (map === null) return <Box></Box>
        const playerIds = Array.from(getPlayerIds(map)).sort((a, b) => a - b)
        return (
            <Grid container spacing={2}>
                {playerIds.map((playerId) => {
                    let children = [
                        <Grid item xs={4}>
                            <LobbyCell
                                label={'Player ' + (playerId + 1).toString()}
                                backgroundColor={playerColors[playerId]}
                            ></LobbyCell>
                        </Grid>,
                    ]
                    const seatedPlayer = props.players.find(
                        (pl) => pl.playerId === playerId,
                    )
                    const comps =
                        seatedPlayer !== undefined
                            ? [
                                  <Grid item xs={8}>
                                      <LobbyCell
                                          label={seatedPlayer.name}
                                      ></LobbyCell>
                                  </Grid>,
                              ]
                            : [
                                  <Grid item xs={4}>
                                      <LobbyCell label={'Open'}></LobbyCell>
                                  </Grid>,
                                  <Grid item xs={4}>
                                      <button
                                          onClick={() => takeSeat(playerId)}
                                      >
                                          <LobbyCell label={'Take'}></LobbyCell>
                                      </button>
                                  </Grid>,
                              ]

                    children = children.concat(comps)
                    return children
                })}
            </Grid>
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
