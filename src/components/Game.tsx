import { useState } from 'react'
import SpreadGameClient from '../game/gameClient'

interface GameProps {
    spreadGameClient: SpreadGameClient
}

const Game: React.FC<GameProps> = (props) => {
    const [gameData, setGameData] = useState(null)

    const onMessageReceive = (message: string) => {
        console.log('message received: ', message)
    }
    props.spreadGameClient.setReceiver(onMessageReceive)

    const subView = () => {
        props.spreadGameClient.sendMessageToServer('Hello')
        return <label> Connected with server!</label>
    }
    return (
        <div>
            gameeee with {props.spreadGameClient.url} and{' '}
            {props.spreadGameClient.token}
            {subView()}
        </div>
    )
}

export default Game
