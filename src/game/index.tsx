import { Box } from '@material-ui/core'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import authProvider from '../auth/authProvider'
import MyButton from '../components/MyButton'
import gameProvider from '../gameProvider'
import { PATHS } from '../Routes'
import { SpreadMap } from '../shared/game/map'
import { ClientGameState } from '../shared/inGame/clientGameState'
import GameClientMessageData from '../shared/inGame/gameClientMessages'
import GameServerMessage, {
    ClientLobbyPlayer,
    isServerLobbyMessage,
} from '../shared/inGame/gameServerMessages'
import SocketClient from '../socketClients/socketClient'
import GameCanvas from './GameCanvas'
import GameLobby from './GameLobby'

// handles socket communication with gameserver
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
    const [, setRefresh] = React.useState(0)
    const [, /*players, */ setPlayers] = useState<ClientLobbyPlayer[]>([])

    const disconnectFromGame = useCallback(() => {
        gameProvider.clear()
        if (spreadGameClient.current !== null) {
            spreadGameClient.current.close()
            spreadGameClient.current = null
        }
    }, [])

    useEffect(() => {
        const token = authProvider.getToken()
        const gameSocketUrl = gameProvider.getSocketUrl()
        if (token === null || gameSocketUrl === null) history.push(PATHS.root)
        else if (spreadGameClient.current === null) {
            try {
                spreadGameClient.current = new SocketClient(
                    gameSocketUrl,
                    token,
                )
                const onMessageReceive = (message: GameServerMessage) => {
                    //console.log('message received: ', message)
                    if (isServerLobbyMessage(message)) {
                        if (message.type === 'lobbystate') {
                            console.log('lobby state set to ', message.data)
                            setPlayers(message.data.players)
                            setMap(message.data.map)
                        } else if (message.type === 'playerid') {
                            console.log(
                                'set playerid to ',
                                message.data.playerId,
                            )
                            setPlayerId(message.data.playerId)
                        }
                    } else {
                        if (message.type === 'gamestate') {
                            setClientGameData(message.data)
                        } else if (message.type === 'gameover') {
                            console.log('game is over!')
                        }
                    }
                }
                spreadGameClient.current.setReceiver(onMessageReceive)
            } catch {
                gameProvider.clear()
                console.log('invalid gameurl')
            }
            setRefresh((r) => r + 1)
        }
        return () => {
            disconnectFromGame()
        }
    }, [history, disconnectFromGame])

    const subView = () => {
        if (
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
    return (
        <Box>
            <MyButton
                onClick={() => {
                    disconnectFromGame()
                    history.push(PATHS.root)
                }}
            >
                Disconnect
            </MyButton>
            {subView()}
        </Box>
    )
}

export default Game
