import { Button, makeStyles } from '@material-ui/core'
import { useFormik } from 'formik'
import { isError } from 'node:util'
import { useSnackbar } from 'notistack'
import React, { useEffect, useRef, useState } from 'react'
import { isApiError } from '../api/base'
import { createGameRequest, getFindGameServer } from '../api/game'
import gameProvider from '../game/gameProvider'
import FindGameClientMessageData from '../shared/findGame/findGameClientMessages'
import FindGameServerMessage, {
    OpenGame,
} from '../shared/findGame/findGameServerMessages'
import SocketClient from '../socketClients/socketClient'
import OpenGameFC from './OpenGame'

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

interface FindGameProps {
    onSetSocketUrl: (socketUrl: string) => void
    token: string
}

const FindGame: React.FC<FindGameProps> = (props) => {
    const classes = useStyles()
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()
    const [openGames, setOpenGames] = useState<OpenGame[] | null>(null)
    const findGameClient = useRef<SocketClient<
        FindGameServerMessage,
        FindGameClientMessageData
    > | null>(null)

    useEffect(() => {
        const onMessageReceive = (message: FindGameServerMessage) => {
            if (message.type === 'opengames') {
                setOpenGames(message.data)
            }
        }
        getFindGameServer().then((urlResp) => {
            if (!isApiError(urlResp)) {
                findGameClient.current = new SocketClient(
                    urlResp.url,
                    props.token,
                )
                findGameClient.current.setReceiver(onMessageReceive)
            } else {
                enqueueSnackbar(urlResp.errorMessage, { variant: 'error' })
            }
        })
        return () => {
            findGameClient.current?.socket.close()
            findGameClient.current = null
        }
    }, [props.token])

    const formik = useFormik({
        initialValues: {},
        onSubmit: async (values, { setSubmitting }) => {
            const resp = await createGameRequest()
            if (isApiError(resp)) {
                enqueueSnackbar(resp.errorMessage, { variant: 'error' })
            } else {
                gameProvider.setSocketUrl(resp.url)
                props.onSetSocketUrl(resp.url)
            }
            setSubmitting(false)
        },
    })
    return (
        <form onSubmit={formik.handleSubmit}>
            {openGames != null && (
                <label>{openGames.length} game(s) found</label>
            )}
            {openGames != null &&
                openGames.map((openGame, index) => {
                    return (
                        <OpenGameFC
                            openGame={openGame}
                            key={index}
                        ></OpenGameFC>
                    )
                })}
            <label htmlFor="gameId"></label>
            <Button
                type="submit"
                className={classes.startGameButton}
                variant="contained"
                color="primary"
            >
                Create new Game
            </Button>
        </form>
    )
}

export default FindGame
