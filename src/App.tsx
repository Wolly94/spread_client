import { Box } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import React, { useCallback, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { isApiError } from './api/base'
import requestToken from './api/token'
import authProvider from './auth/authProvider'
import FindGame from './components/FindGame'
import MyButton from './components/MyButton'
import gameProvider from './gameProvider'
import { PATHS } from './Routes'

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
    const history = useHistory()
    const classes = useStyles()
    const [token, setToken] = useState(authProvider.getToken())

    const joinGame = useCallback(
        (url: string) => {
            gameProvider.setSocketUrl(url)
            history.push(PATHS.game)
        },
        [history],
    )

    useEffect(() => {
        gameProvider.clear()
        if (token == null) {
            requestToken().then((res) => {
                if (!isApiError(res)) {
                    console.log('set token to: ' + res.token)
                    authProvider.setToken(res.token)
                    setToken(res.token)
                } else {
                    console.log(res.errorMessage)
                }
            })
        }
    }, [token])

    const subView = () => {
        const gameUrl = gameProvider.getSocketUrl()
        if (token == null) {
            return <label>Retrieving token ...</label>
        } else if (gameUrl === null) {
            return (
                <FindGame
                    token={token}
                    onSetSocketUrl={(url) => {
                        joinGame(url)
                    }}
                ></FindGame>
            )
        } else {
            return (
                <MyButton onClick={() => joinGame(gameUrl)}>
                    Join your running game
                </MyButton>
            )
        }
    }

    return (
        <Box className={classes.centered}>
            <MyButton onClick={() => setToken(null)}>Reset Token</MyButton>
            <MyButton onClick={() => history.push(PATHS.editor)}>
                Create your own Map
            </MyButton>
            {subView()}
        </Box>
    )
}

export default App
