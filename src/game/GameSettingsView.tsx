import { MenuItem, Select } from '@material-ui/core'
import React from 'react'
import {
    GameMechanics,
    gameMechs,
    GameSettings,
    toGameMechanics,
} from '../shared/inGame/gameServerMessages'

interface GameSettingsProps {
    gameSettings: GameSettings
    setGameSettings: (gameSettings: GameSettings) => void
}

const GameSettingsView: React.FC<GameSettingsProps> = ({
    gameSettings,
    ...props
}) => {
    const gmLabel = (gm: GameMechanics): string => {
        if (gm === 'basic') return 'Basic Mechanics'
        else if (gm === 'scrapeoff') return 'Scrape-Off Mechanics'
        else if (gm === 'bounce') return 'Bounce Mechanics'
        else return 'Undefined'
    }

    return (
        <Select
            value={gameSettings.mechanics}
            onChange={(e) => {
                const s: string = e.target.value as string
                const gameMechs = toGameMechanics(s)
                if (gameMechs !== null)
                    props.setGameSettings({ mechanics: gameMechs })
            }}
            style={{ display: 'block' }}
        >
            {gameMechs.map((gm, index) => {
                return (
                    <MenuItem key={index} value={gm}>
                        {gmLabel(gm)}
                    </MenuItem>
                )
            })}
        </Select>
    )
}

export default GameSettingsView