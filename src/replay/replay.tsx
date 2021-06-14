import { Box } from '@material-ui/core'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ClientGameState } from 'spread_game/dist/messages/inGame/clientGameState'
import SpreadReplay from 'spread_game/dist/messages/replay/replay'
import { SpreadGameImplementation } from 'spread_game/dist/spreadGame'
import { playerFromData } from 'spread_game/dist/spreadGame/player'
import ClientGameStateView from './clientGameState'
import useInterval from './../hooks/useInterval'

interface ReplayProps {
    replay: SpreadReplay
    react: 'Restart' | 'Stop'
}

const Replay: React.FC<ReplayProps> = ({ replay, ...props }) => {
    const [
        clientGameState,
        setClientGameState,
    ] = useState<ClientGameState | null>(null)
    const spreadGameRef = useRef<SpreadGameImplementation | null>(null)

    const resetGame = useCallback(() => {
        spreadGameRef.current = new SpreadGameImplementation(
            replay.map,
            replay.gameSettings,
            replay.players.map((pl) => playerFromData(pl)),
        )
    }, [replay])

    useEffect(() => {
        resetGame()
    }, [replay, resetGame])

    const callback = useCallback(() => {
        if (spreadGameRef.current !== null) {
            // TODO scale by watch speed factor!
            spreadGameRef.current.runReplay(
                replay,
                replay.gameSettings.updateFrequencyInMs,
            )
            setClientGameState(spreadGameRef.current.toClientGameState())
        }
    }, [replay])

    const [paused, start, stop] = useInterval(
        callback,
        replay.gameSettings.updateFrequencyInMs,
    )

    useEffect(() => {
        if (
            clientGameState !== null &&
            clientGameState.timePassedInMs >= replay.lengthInMs
        ) {
            if (props.react === 'Restart') {
                resetGame()
            } else if (props.react === 'Stop') {
                stop()
            }
        }
    }, [replay.lengthInMs, resetGame, stop, props.react, clientGameState])

    useEffect(() => {
        start()
        const x = 10
    }, [start]) // since start never changes, this will only be executed on first render

    return (
        <Box>
            {clientGameState !== null && (
                <ClientGameStateView
                    map={replay.map}
                    state={clientGameState}
                ></ClientGameStateView>
            )}
        </Box>
    )
}

export default Replay
