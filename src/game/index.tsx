import { Box } from '@material-ui/core'
import React, { useEffect, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import authProvider from '../auth/authProvider'
import gameProvider from '../gameProvider'
import { PATHS } from '../Routes'
import { SpreadMap } from '../shared/game/map'
import { ClientGameState } from '../shared/inGame/clientGameState'
import GameClientMessageData from '../shared/inGame/gameClientMessages'
import GameServerMessage from '../shared/inGame/gameServerMessages'
import SocketClient from '../socketClients/socketClient'
import GameCanvas from './GameCanvas'
import GameLobby from './GameLobby'

const Game = () => {
    const history = useHistory()
    const spreadGameClient = useRef<SocketClient<
        GameServerMessage,
        GameClientMessageData
    > | null>(null)
    const [
        clientGameState,
        setClientGameData,
    ] = useState<ClientGameState | null>(null)
    const [map, setMap] = useState<SpreadMap | null>(null)
    const [playerId, setPlayerId] = useState<number | null>(null)
    const [refresh, setRefresh] = React.useState(0)

    useEffect(() => {
        const token = authProvider.getToken()
        const gameSocketUrl = gameProvider.getSocketUrl()
        if (token === null || gameSocketUrl === null) history.push(PATHS.root)
        else if (spreadGameClient.current === null) {
            spreadGameClient.current = new SocketClient(gameSocketUrl, token)
            const onMessageReceive = (message: GameServerMessage) => {
                //console.log('message received: ', message)
                if (message.type === 'gamestate') {
                    setClientGameData(message.data)
                } else if (message.type === 'gameover') {
                    console.log('game is over!')
                } else if (message.type === 'playerid') {
                    console.log('set playerid to ', message.data.playerId)
                    setPlayerId(message.data.playerId)
                }
            }
            spreadGameClient.current.setReceiver(onMessageReceive)
            setRefresh(refresh + 1)
        }
        /*         return () => {
            if (spreadGameClient.current !== null)
                spreadGameClient.current.close()
        } */
    })

    const subView = () => {
        if (
            playerId !== null &&
            clientGameState !== null &&
            map !== null &&
            spreadGameClient.current !== null
        ) {
            return (
                <GameCanvas
                    playerId={playerId}
                    map={map}
                    clientGameState={clientGameState}
                    sendMessageToServer={(msg) => {
                        if (spreadGameClient.current !== null)
                            spreadGameClient.current.sendMessageToServer(msg)
                    }}
                ></GameCanvas>
            )
        } else if (spreadGameClient.current !== null) {
            return (
                <GameLobby
                    map={map}
                    setMap={setMap}
                    sendMessageToServer={(msg) => {
                        if (spreadGameClient.current !== null)
                            spreadGameClient.current.sendMessageToServer(msg)
                    }}
                ></GameLobby>
            )
        } else {
            return (
                <label>
                    {' '}
                    loading ... token: {authProvider.getToken()} and url:{' '}
                    {gameProvider.getSocketUrl()}
                </label>
            )
        }
    }
    return <Box>{subView()}</Box>
}

export default Game
