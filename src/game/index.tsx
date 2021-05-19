import { Box } from '@material-ui/core'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { ClientGameState } from 'spread_game/dist/messages/inGame/clientGameState'
import { GameClientMessageData } from 'spread_game/dist/messages/inGame/gameClientMessages'
import {
    GameServerMessage,
    ClientLobbyPlayer,
    GameSettings,
    isServerLobbyMessage,
} from 'spread_game/dist/messages/inGame/gameServerMessages'
import { SpreadMap } from 'spread_game/dist/spreadGame/map/map'
import authProvider from '../auth/authProvider'
import MyButton from '../components/MyButton'
import gameProvider from '../gameProvider'
import { PATHS } from '../Routes'
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
    const [players, setPlayers] = useState<ClientLobbyPlayer[]>([])
    const [gameSettings, setGameSettings] = useState<GameSettings | null>(null)

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
                            setGameSettings(message.data.gameSettings)
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
                    players={players}
                    setMap={setMap}
                    sendMessageToServer={(msg) => {
                        if (spreadGameClient.current !== null)
                            spreadGameClient.current.sendMessageToServer(msg)
                    }}
                    gameSettings={gameSettings}
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
