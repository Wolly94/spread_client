import { useCallback, useEffect, useMemo, useState } from 'react'
import SpreadReplay from 'spread_game/dist/messages/replay/replay'
import { SpreadGameImplementation } from 'spread_game/dist/spreadGame'
import ClientGameStateView from './clientGameState'

const minMs = 20

interface ReplayProps {
    replay: SpreadReplay
}

const Replay: React.FC<ReplayProps> = (props) => {
    const spreadGame = useMemo(
        () =>
            new SpreadGameImplementation(
                props.replay.map,
                props.replay.gameSettings,
                props.replay.players,
            ),
        [props],
    )
    const [clientGameState, setClientGameState] = useState(
        spreadGame.toClientGameState(),
    )
    const [runningId, setRunningId] = useState<NodeJS.Timeout | null>(null)

    const stop = useCallback(() => {
        if (runningId !== null) {
            clearInterval(runningId)
            setRunningId(null)
        }
    }, [])

    const start = useCallback(() => {
        setRunningId(
            setInterval(() => {
                const moves = props.replay.moveHistory.filter(
                    (me) => me.timestamp === spreadGame.timePassed,
                )
                moves.forEach((mv) => {
                    spreadGame.applyMove(mv.data)
                })
                spreadGame.step(minMs)
                setClientGameState(spreadGame.toClientGameState())
                if (spreadGame.timePassed >= props.replay.lengthInMs) {
                    stop()
                }
            }, minMs),
        )
    }, [props, spreadGame, stop])

    useEffect(() => {
        start()
        return () => stop()
    }, [])

    return (
        <ClientGameStateView
            map={props.replay.map}
            height={1000}
            width={1000}
            state={clientGameState}
        ></ClientGameStateView>
    )
}

export default Replay
