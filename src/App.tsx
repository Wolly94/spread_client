import { useEffect, useState } from 'react'
import requestToken from './api/Token'
import authProvider from './auth/authProvider'
import { isApiError } from './api/base'
import { makeStyles } from '@material-ui/core/styles'
import { Box, Grid, Paper } from '@material-ui/core'
import gameProvider from './game/gameProvider'
import FindGame from './components/FindGame'
import Game from './components/Game'
import React from 'react'

const useStyles = makeStyles({
    startGameButton: {
        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
        border: 0,
        borderRadius: 3,
        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
        color: 'white',
        height: 72,
        padding: '0 30px',
    },
    centered: {
        width: '50%',
        textAlign: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        paddingTop: '100px',
        paddingLeft: '25%',
    },
})

interface AppProps {}

const App: React.FC<AppProps> = (props) => {
    gameProvider.clear()
    const classes = useStyles()
    const [token, setToken] = useState(authProvider.getToken())
    const [gameSocketUrl, setGameSocketUrl] = useState(
        gameProvider.getSocketUrl(),
    )

    useEffect(() => {
        if (token == null) {
            gameProvider.clear()
            requestToken().then((res) => {
                if (!isApiError(res)) {
                    authProvider.setToken(res.token)
                    setToken(res.token)
                }
            })
        }
    })

    const subView = () => {
        if (token == null) {
            return <label>Retrieving token ...</label>
        } else if (gameSocketUrl == null) {
            return (
                <FindGame
                    token={token}
                    onSetSocketUrl={(url) => {
                        gameProvider.setSocketUrl(url)
                        setGameSocketUrl(url)
                    }}
                ></FindGame>
            )
        } else {
            return <Game token={token} gameSocketUrl={gameSocketUrl}></Game>
        }
    }

    return <Box className={classes.centered}>{subView()}</Box>
}

export default App
