import { Box } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import React, { useEffect, useState } from 'react'
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
    const [gameSocketUrl, setGameSocketUrl] = useState(
        gameProvider.getSocketUrl(),
    )

    useEffect(() => {
        if (token == null) {
            gameProvider.clear()
            requestToken().then((res) => {
                if (!isApiError(res)) {
                    console.log('set token to: ' + res.token)
                    authProvider.setToken(res.token)
                    setToken(res.token)
                }
            })
        }
    }, [token])

    const subView = () => {
        if (token == null) {
            return <label>Retrieving token ...</label>
        } else if (gameSocketUrl == null) {
            return (
                <FindGame
                    token={token}
                    onSetSocketUrl={(url) => {
                        gameProvider.setSocketUrl(url)
                        history.push(PATHS.game)
                    }}
                ></FindGame>
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
