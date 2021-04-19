import React, { useEffect, useState } from 'react'
import Button from '@material-ui/core/Button'
import requestToken from './api/Token'
import authProvider from './auth/authProvider'
import { isApiError } from './api/base'
import { makeStyles } from '@material-ui/core/styles'
import { Box } from '@material-ui/core'
import gameProvider from './game/gameProvider'
import FindGame from './components/FindGame'

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
        display: 'flex',
        textAlign: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        paddingTop: '100px',
    },
})

interface AppProps {}

const createAndConnectGameWebSocket = (url: string) => {
    const ws = new WebSocket(url)
    ws.onopen = () => {
        console.log('Now connected')
    }
    return ws
}

function App() {
    const classes = useStyles()
    const [token, setToken] = useState(authProvider.getToken())
    const [socketUrl, setSocketUrl] = useState(gameProvider.getSocketUrl())
    const [gameSocket, setGameSocket] = useState<WebSocket | null>(null)

    useEffect(() => {
        if (token == null) {
            requestToken().then((res) => {
                if (!isApiError(res)) setToken(res.token)
            })
        }
    }, [])

    useEffect(() => {
        if (socketUrl != null) {
            const socket = createAndConnectGameWebSocket(socketUrl)
            setGameSocket(socket)
        }
    }, [socketUrl])

    const subView = () => {
        if (gameSocket == null) {
            return (
                <FindGame
                    onSetSocketUrl={(url) => setSocketUrl(url)}
                ></FindGame>
            )
        } else {
        }
    }

    return <Box className={classes.centered}>{subView()}</Box>
}

export default App
