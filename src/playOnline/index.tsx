import { Grid } from '@material-ui/core'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { ClientGameState } from 'spread_game/dist/messages/inGame/clientGameState'
import { GameClientMessageData } from 'spread_game/dist/messages/inGame/gameClientMessages'
import { GameServerMessage } from 'spread_game/dist/messages/inGame/gameServerMessages'
import authProvider from '../auth/authProvider'
import Game from '../game/game'
import gameProvider from '../gameProvider'
import { PATHS } from '../Routes'
import SocketClientImplementation, {
    SocketClient,
} from '../socketClients/socketClient'

// handles socket communication with gameserver
const PlayHuman = () => {
    const history = useHistory()
    const spreadGameClient = useRef<SocketClient<
        GameServerMessage,
        GameClientMessageData
    > | null>(null)
    const [, setRefresh] = React.useState(0)
    const [
        clientGameState,
        setClientGameData,
    ] = useState<ClientGameState | null>(null)

    const token = useMemo(() => {
        const t = authProvider.getToken()
        return t
    }, [])

    const disconnectFromGame = useCallback(() => {
        gameProvider.clear()
        if (spreadGameClient.current !== null) {
            spreadGameClient.current.close()
            spreadGameClient.current = null
        }
    }, [])

    const [onMessageReceive, setOnMessageReceive] = useState<
        ((message: GameServerMessage) => void) | null
    >(null)

    useEffect(() => {
        if (onMessageReceive !== null) {
            const gameSocketUrl = gameProvider.getSocketUrl()
            if (token === null || gameSocketUrl === null)
                history.push(PATHS.root)
            else if (spreadGameClient.current === null) {
                try {
                    spreadGameClient.current = new SocketClientImplementation(
                        gameSocketUrl,
                        token,
                        (msg) => {
                            if (onMessageReceive !== null) onMessageReceive(msg)
                        },
                    )
                } catch {
                    gameProvider.clear()
                    console.log('invalid gameurl')
                }
                setRefresh((r) => r + 1)
            } else {
                spreadGameClient.current.onReceiveMessage = onMessageReceive
            }
        }
        return () => {
            disconnectFromGame()
        }
    }, [onMessageReceive, disconnectFromGame, history])

    if (token === null) {
        return <label> no token found </label>
    } else if (spreadGameClient.current === null) {
        return <label> no game client found </label>
    } else {
        return (
            <Grid container>
                <Grid item>
                    <Game
                        token={token}
                        sendToServer={(msg) =>
                            spreadGameClient.current?.sendMessageToServer(
                                msg.data,
                            )
                        }
                        setReceiveMessage={...}
                        connectToServer={(token, sendToClient) =>
                            gameHandler.connectClient(token, sendToClient)
                        }
                    ></Game>
                </Grid>
            </Grid>
        )
    }
}

export default PlayHuman
