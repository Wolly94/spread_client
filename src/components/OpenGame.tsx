import { OpenGame } from '../shared/findGame/findGameServerMessages'

interface OpenGameProps {
    openGame: OpenGame
}

const OpenGameFC: React.FC<OpenGameProps> = (props) => {
    return (
        <div>
            {props.openGame.gameId} {props.openGame.joinedPlayers} /{' '}
            {props.openGame.players} running: {props.openGame.running}
        </div>
    )
}

export default OpenGameFC
