import { useEffect, useState } from 'react'
import requestToken from './api/Token'
import authProvider from './auth/authProvider'
import { isApiError } from './api/base'
import { makeStyles } from '@material-ui/core/styles'
import { Box, Button, Grid, Paper } from '@material-ui/core'
import gameProvider from './game/gameProvider'
import FindGame from './components/FindGame'
import Game from './components/Game'
import React from 'react'
import { useHistory } from 'react-router-dom'
import { PATHS } from './Routes'
import MyButton from './components/MyButton'

const useStyles = makeStyles({
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
    const history = useHistory()
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

    return (
        <Box className={classes.centered}>
            <MyButton onClick={() => history.push(PATHS.editor)}>
                Create your own Map
            </MyButton>
            {subView()}
        </Box>
    )
}

export default App
