import { Grid } from '@material-ui/core'
import React, { useMemo } from 'react'
import { GameServerHandler } from 'spread_game/dist/communication/gameServerHandler/GameServerHandler'
import Game from '../game/game'

const PlayAi = () => {
    const gameHandler = useMemo(() => new GameServerHandler(), [])
    const token = useMemo(() => 'aitoken', [])

    return (
        <Grid container>
            <Grid item>
                <Game
                    token={token}
                    sendToServer={(msg) =>
                        gameHandler.onMessageReceive(msg.data, msg.token)
                    }
                    connectToServer={(token, sendToClient) =>
                        gameHandler.connectClient(token, sendToClient)
                    }
                ></Game>
            </Grid>
        </Grid>
    )
}

export default PlayAi
