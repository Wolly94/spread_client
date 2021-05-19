import { Box } from '@material-ui/core'
import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { ClientCommunication } from 'spread_game/dist/communication/ClientCommunication'
import ClientMessage from 'spread_game/dist/messages/clientMessage'
import { ClientGameState } from 'spread_game/dist/messages/inGame/clientGameState'
import { GameClientMessageData } from 'spread_game/dist/messages/inGame/gameClientMessages'
import {
    ClientLobbyPlayer,
    GameSettings,
    GameServerMessage,
    isServerLobbyMessage,
} from 'spread_game/dist/messages/inGame/gameServerMessages'
import { SpreadMap } from 'spread_game/dist/spreadGame/map/map'
import authProvider from '../auth/authProvider'
import MyButton from '../components/MyButton'
import gameProvider from '../gameProvider'
import { PATHS } from '../Routes'
import SocketClientImplementation from '../socketClients/socketClient'
import GameCanvas from './GameCanvas'
import GameLobby from './GameLobby'

interface GameProps {
    token: string
    connectToServer: (
        token: string,
        sendToClient: (msg: GameServerMessage) => void,
    ) => void
    sendToServer: (msg: ClientMessage<GameClientMessageData>) => void
}

const Game: React.FC<GameProps> = (props) => {
    const history = useHistory()
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
        // TODO add functionality to comm
        // props.comm.close()
        gameProvider.clear()
    }, [])

    const onMessageReceive = useCallback((message: GameServerMessage) => {
        //console.log('message received: ', message)
        if (isServerLobbyMessage(message)) {
            if (message.type === 'lobbystate') {
                console.log('lobby state set to ', message.data)
                setPlayers(message.data.players)
                setMap(message.data.map)
                setGameSettings(message.data.gameSettings)
            } else if (message.type === 'playerid') {
                console.log('set playerid to ', message.data.playerId)
                setPlayerId(message.data.playerId)
            }
        } else {
            if (message.type === 'gamestate') {
                setClientGameData(message.data)
            } else if (message.type === 'gameover') {
                console.log('game is over!')
            }
        }
    }, [])

    const clientComm = useMemo(() => {
        const x = new ClientCommunication<
            GameServerMessage,
            GameClientMessageData
        >(props.token, onMessageReceive, props.sendToServer)
        props.connectToServer(props.token, onMessageReceive)
        return x
    }, [onMessageReceive])

    const subView = () => {
        if (clientGameState !== null && map !== null) {
            return (
                <GameCanvas
                    playerId={playerId}
                    map={map}
                    clientGameState={clientGameState}
                    sendMessageToServer={(msg) => {
                        clientComm.sendMessageToServer(msg)
                    }}
                ></GameCanvas>
            )
        } else {
            return (
                <GameLobby
                    map={map}
                    players={players}
                    setMap={setMap}
                    sendMessageToServer={(msg) => {
                        clientComm.sendMessageToServer(msg)
                    }}
                    gameSettings={gameSettings}
                ></GameLobby>
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
