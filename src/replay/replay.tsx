import { Box } from '@material-ui/core'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ClientGameState } from 'spread_game/dist/messages/inGame/clientGameState'
import SpreadReplay from 'spread_game/dist/messages/replay/replay'
import { SpreadGameImplementation } from 'spread_game/dist/spreadGame'
import { playerFromData } from 'spread_game/dist/spreadGame/player'
import ClientGameStateView from './clientGameState'
import useInterval from './loop'

interface ReplayProps {
    replay: SpreadReplay
}

const Replay: React.FC<ReplayProps> = (props) => {
    const [changeSpreadGame, setChangeSpreadGame] = useState<number>(0)
    const spreadGameRef = useRef<SpreadGameImplementation>(
        new SpreadGameImplementation(
            props.replay.map,
            props.replay.gameSettings,
            props.replay.players.map((pl) => playerFromData(pl)),
        ),
    )

    const initSpreadGame = useCallback(
        (spreadGame: SpreadGameImplementation) => {
            spreadGameRef.current = spreadGame
            setChangeSpreadGame((changeSpreadGame) => changeSpreadGame + 1)
        },
        [],
    )

    useEffect(() => {
        initSpreadGame(
            new SpreadGameImplementation(
                props.replay.map,
                props.replay.gameSettings,
                props.replay.players.map((pl) => playerFromData(pl)),
            ),
        )
    }, [initSpreadGame, props.replay])

    const [paused, setPaused] = useState(false)
    const [
        clientGameState,
        setClientGameState,
    ] = useState<ClientGameState | null>(
        spreadGameRef.current.toClientGameState(),
    )
    const callback = useCallback(() => {
        const moves = props.replay.moveHistory.filter(
            (me) => me.timestamp === spreadGameRef.current.timePassed,
        )
        moves.forEach((mv) => {
            spreadGameRef.current.applyMove(mv.data)
        })
        // TODO scale by watch speed factor!
        spreadGameRef.current.step(
            spreadGameRef.current.gameSettings.updateFrequencyInMs,
        )
        setClientGameState(spreadGameRef.current.toClientGameState())
        if (spreadGameRef.current.timePassed >= props.replay.lengthInMs)
            setPaused(true)
    }, [props])

    const [isRunning, start, stop] = useInterval(
        callback,
        props.replay.gameSettings.updateFrequencyInMs,
    )

    const restart = useCallback(() => {
        initSpreadGame(
            new SpreadGameImplementation(
                props.replay.map,
                props.replay.gameSettings,
                props.replay.players.map((pl) => playerFromData(pl)),
            ),
        )
        setPaused(false)
    }, [initSpreadGame, props])

    useEffect(() => {
        if (spreadGameRef.current.timePassed >= props.replay.lengthInMs) {
            stop()
            restart()
        }
        return () => stop()
    }, [
        restart,
        initSpreadGame,
        changeSpreadGame,
        clientGameState,
        props.replay.lengthInMs,
        start,
        stop,
    ])

    useEffect(() => {
        if (!isRunning && !paused) {
            start()
        }
        return () => stop()
    }, [start, stop, paused, isRunning])

    useEffect(() => {
        if (paused) stop()
    }, [paused, stop])

    return (
        <Box>
            {clientGameState !== null && (
                <ClientGameStateView
                    map={props.replay.map}
                    state={clientGameState}
                ></ClientGameStateView>
            )}
        </Box>
    )
}

export default Replay
