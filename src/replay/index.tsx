import { Grid } from '@material-ui/core'
import React, { useState } from 'react'
import SpreadReplay from 'spread_game/dist/messages/replay/replay'
import MyButton from '../components/MyButton'
import ReadReplay from '../components/ReadReplay'
import { ReadFile } from '../fileService'
import Replay from './replay'

const ReplayView = () => {
    const [replay, setReplay] = useState<SpreadReplay | null>(null)
    return (
        <Grid container>
            <Grid item>
                <ReadReplay
                    callback={(data) => {
                        if (data !== null) {
                            setReplay(data)
                        }
                    }}
                ></ReadReplay>
            </Grid>
            {replay !== null && (
                <Grid item xs={12}>
                    <Replay replay={replay} react={'Restart'}></Replay>
                </Grid>
            )}
        </Grid>
    )
}

export default ReplayView
