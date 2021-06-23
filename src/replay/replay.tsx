import { Box, Button, Grid, Input } from '@material-ui/core'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ClientGameState } from 'spread_game/dist/messages/inGame/clientGameState'
import SpreadReplay from 'spread_game/dist/messages/replay/replay'
import { SpreadGameImplementation } from 'spread_game/dist/spreadGame'
import { playerFromData } from 'spread_game/dist/spreadGame/player'
import ClientGameStateView from './clientGameState'
import useInterval from './../hooks/useInterval'
import { ControlBar } from './controlBar'
import MyButton from '../components/MyButton'
import { perkFromBackUp } from 'spread_game/dist/skilltree'

interface ReplayProps {
    replay: SpreadReplay
    react: 'Restart' | 'Stop'
    perspectivePlayerId: number | null
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
            replay.perks.flatMap((p) => {
                const r = perkFromBackUp(p)
                if (r === null) return []
                else return [r]
            }),
        )
    }, [replay])

    const updateScreen = useCallback(() => {
        if (spreadGameRef.current !== null) {
            setClientGameState(
                spreadGameRef.current.toClientGameState(
                    props.perspectivePlayerId,
                ),
            )
        }
    }, [props.perspectivePlayerId])

    useEffect(() => {
        resetGame()
    }, [replay, resetGame])

    const stepCallback = useCallback(() => {
        if (spreadGameRef.current !== null) {
            // TODO scale by watch speed factor!
            spreadGameRef.current.runReplay(
                replay,
                replay.gameSettings.updateFrequencyInMs,
            )
            updateScreen()
        }
    }, [replay, updateScreen])

    const [paused, start, stop] = useInterval(
        stepCallback,
        replay.gameSettings.updateFrequencyInMs,
    )

    const setTime = useCallback(
        (newTimePassedInMs: number) => {
            stop()
            resetGame()
            if (spreadGameRef.current !== null) {
                spreadGameRef.current.runReplay(replay, newTimePassedInMs)
            }
            updateScreen()
        },
        [stop, resetGame, replay, updateScreen],
    )

    const stepBackCallback = useCallback(() => {
        if (spreadGameRef.current !== null) {
            const newTime =
                spreadGameRef.current.timePassed -
                replay.gameSettings.updateFrequencyInMs
            setTime(Math.max(newTime, 0))
        }
    }, [setTime, replay.gameSettings.updateFrequencyInMs])

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
    }, [start]) // since start never changes, this will only be executed on first render

    const handleInputChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const time =
                event.target.value === '' ? 0 : Number(event.target.value)
            setTime(time)
        },
        [setTime],
    )

    return (
        <Box paddingLeft={5} paddingRight={5} paddingTop={5}>
            {clientGameState !== null && (
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <Grid container>
                            <Grid item xs={3}>
                                <Button
                                    onClick={() => {
                                        if (paused) start()
                                        else stop()
                                    }}
                                >
                                    {paused ? 'Run' : 'Pause'}
                                </Button>
                            </Grid>
                            <Grid item xs={3}>
                                <Button
                                    disabled={!paused}
                                    onClick={() => {
                                        stepCallback()
                                    }}
                                >
                                    Step
                                </Button>
                            </Grid>
                            <Grid item xs={3}>
                                <Button
                                    disabled={!paused}
                                    onClick={() => {
                                        stepBackCallback()
                                    }}
                                >
                                    Step Back
                                </Button>
                            </Grid>
                            <Grid item xs={3}>
                                <Input
                                    //className={classes.input}
                                    disabled={!paused}
                                    value={
                                        spreadGameRef.current !== null &&
                                        !paused
                                            ? spreadGameRef.current.timePassed /
                                              1000
                                            : 0
                                    }
                                    margin="dense"
                                    onChange={handleInputChange}
                                    //onBlur={handleBlur}
                                    inputProps={{
                                        step: 10,
                                        min: 0,
                                        max: 100,
                                        type: 'number',
                                        'aria-labelledby': 'input-slider',
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <ControlBar
                                    maxLengthInMs={replay.lengthInMs}
                                    timePassedInMs={
                                        clientGameState.timePassedInMs
                                    }
                                    setTime={setTime}
                                ></ControlBar>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <ClientGameStateView
                            map={replay.map}
                            state={clientGameState}
                        ></ClientGameStateView>
                    </Grid>
                </Grid>
            )}
        </Box>
    )
}

export default Replay
