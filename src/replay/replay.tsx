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
            ),
        [props],
    )
    const [clientGameState, setClientGameState] = useState(
        spreadGame.toClientGameState(),
    )
    const [runningId, setRunningId] = useState<NodeJS.Timeout | null>(null)

    const start = useCallback(() => {
        setRunningId(
            setInterval(() => {
                const moves = props.replay.moveHistory.filter(
                    (me) => me.timestamp === spreadGame.timePassed,
                )
                moves.forEach((mv) => {
                    if (mv.timestamp === 1900) {
                        const x = 100
                    }
                    spreadGame.applyMove(mv.data)
                })
                spreadGame.step(minMs)
                setClientGameState(spreadGame.toClientGameState())
            }, minMs),
        )
    }, [props, spreadGame])

    const stop = () => {
        if (runningId !== null) {
            clearInterval(runningId)
            setRunningId(null)
        }
    }

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
