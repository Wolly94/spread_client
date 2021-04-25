import {
    Box,
    Button,
    Grid,
    List,
    ListItem,
    makeStyles,
} from '@material-ui/core'
import { useFormik } from 'formik'
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
import { OpenGameFC, OpenGamesFC } from './OpenGame'

const useStyles = makeStyles((theme) => ({
    root: {
        padding: '30px',
        textAlign: 'center',
        justifyContent: 'center',
        alignContent: 'center',
    },
    startGameButton: {
        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
        border: 0,
        borderRadius: 3,
        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
        color: 'white',
        height: 72,
        width: 256,
        padding: '0 30px',
    },
    table: {
        width: 720,
    },
    listRoot: {
        //width: '100%',
        backgroundColor: theme.palette.background.paper,
    },
}))

interface FindGameProps {
    onSetSocketUrl: (socketUrl: string) => void
    token: string
}

const FindGame: React.FC<FindGameProps> = (props) => {
    const classes = useStyles()
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()
    const [openGames, setOpenGames] = useState<OpenGame[] | null>(null)
    const [selectedUrl, setSelectedUrl] = useState<string | null>(null)
    const findGameClient = useRef<SocketClient<
        FindGameServerMessage,
        FindGameClientMessageData
    > | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const createGame = async () => {
        const resp = await createGameRequest()
        if (isApiError(resp)) {
            enqueueSnackbar(resp.errorMessage, { variant: 'error' })
        } else {
            return resp.url
        }
    }
    const joinGame = (gameUrl: string) => {
        setSubmitting(true)
        gameProvider.setSocketUrl(gameUrl)
        props.onSetSocketUrl(gameUrl)
        setSubmitting(false)
    }

    useEffect(() => {
        if (submitting) {
        }
    }, [submitting])

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

    return (
        <Box className={classes.root}>
            {openGames == null && <label>Connecting ...</label>}
            {openGames != null && (
                <label>{openGames.length} game(s) found</label>
            )}
            <Grid container className={classes.root}>
                {openGames != null && (
                    <OpenGamesFC
                        openGames={openGames}
                        onSelect={(url) => setSelectedUrl(url)}
                    ></OpenGamesFC>
                )}
            </Grid>
            <Grid container spacing={4} className={classes.root}>
                <Grid item>
                    <Button
                        disabled={selectedUrl == null}
                        className={classes.startGameButton}
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            if (selectedUrl != null) {
                                joinGame(selectedUrl)
                            }
                        }}
                    >
                        Join Game
                    </Button>
                </Grid>
                <Grid item>
                    <Button
                        className={classes.startGameButton}
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            createGame().then((gameUrl) => {
                                if (gameUrl != undefined) {
                                    joinGame(gameUrl)
                                }
                            })
                        }}
                    >
                        Create new Game
                    </Button>
                </Grid>
            </Grid>
        </Box>
    )
}

export default FindGame
