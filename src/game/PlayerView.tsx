import { Box, Grid, Typography } from '@material-ui/core'
import React from 'react'
import { playerColors } from '../drawing/draw'
import {
    ClientAiPlayer,
    ClientHumanPlayer,
    ClientLobbyPlayer,
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

interface DisplayPlayerViewProps {
    playerIds: number[]
    players: ClientLobbyPlayer[]
    takeSeat: (playerId: number) => void
    setAi: (playerId: number) => void
    clear: (playerId: number) => void
}

const DisplayPlayerView: React.FC<DisplayPlayerViewProps> = (props) => {
    const playerIds = props.playerIds.sort((a, b) => a - b)
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
                            takeSeat={props.takeSeat}
                            setAi={props.setAi}
                        ></EmptyRow>
                    )
                } else if (seatedPlayer.type === 'ai') {
                    return (
                        <AiRow
                            player={seatedPlayer}
                            takeSeat={props.takeSeat}
                            clear={props.clear}
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

export default DisplayPlayerView
