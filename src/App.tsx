import React, { useEffect, useState } from 'react'
import Button from '@material-ui/core/Button'
import requestToken from './api/Token'
import authProvider from './auth/authProvider'
import { isApiError } from './api/base'
import { makeStyles } from '@material-ui/core/styles'
import { Box } from '@material-ui/core'
import gameProvider from './game/gameProvider'
import FindGame from './components/FindGame'
import Game from './components/Game'
import SpreadGameClient from './game/gameClient'

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

const createAndConnectGameWebSocket = (
    url: string,
    playerToken: string,
    onClose: () => void,
) => {
    const ws = new WebSocket(url + '?token=' + playerToken)
    ws.onopen = () => {
        console.log('Now connected')
    }
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        // TODO react
    }
    ws.onclose = () => {
        onClose()
    }
    return ws
}

function App() {
    //gameProvider.clear()
    const classes = useStyles()
    const [token, setToken] = useState(authProvider.getToken())
    const [
        spreadGameClient,
        setSpreadGameClient,
    ] = useState<SpreadGameClient | null>(null)

    useEffect(() => {
        if (token == null) {
            gameProvider.clear()
            requestToken().then((res) => {
                if (!isApiError(res)) setToken(res.token)
            })
        }
    }, [])

    const subView = () => {
        if (token == null) {
            return <label>Retrieving token ...</label>
        } else if (spreadGameClient == null) {
            return (
                <FindGame
                    onSetSocketUrl={(url) => {
                        setSpreadGameClient(new SpreadGameClient(url, token))
                    }}
                ></FindGame>
            )
        } else {
            return <Game spreadGameClient={spreadGameClient}></Game>
        }
    }

    return <Box className={classes.centered}>{subView()}</Box>
}

export default App
