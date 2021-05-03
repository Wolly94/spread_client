import { Box, Grid, makeStyles } from '@material-ui/core'
import { useSnackbar } from 'notistack'
import React, { useEffect, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { isApiError } from '../api/base'
import { createGameRequest, getFindGameServer } from '../api/gameApi'
import gameProvider from '../gameProvider'
import { PATHS } from '../Routes'
import FindGameClientMessageData from '../shared/findGame/findGameClientMessages'
import FindGameServerMessage, {
    OpenGame,
} from '../shared/findGame/findGameServerMessages'
import SocketClient from '../shared/socketClients/socketClient'
import MyButton from './MyButton'
import { OpenGamesFC } from './OpenGame'

const useStyles = makeStyles((theme) => ({
    root: {
        padding: '30px',
        textAlign: 'center',
        justifyContent: 'center',
        alignContent: 'center',
    },
    startGameButton: {},
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
    const history = useHistory()
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
    }, [props.token, enqueueSnackbar])

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
                    <MyButton
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
                    </MyButton>
                </Grid>
                <Grid item>
                    <MyButton
                        className={classes.startGameButton}
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            createGame().then((gameUrl) => {
                                if (gameUrl !== undefined) {
                                    joinGame(gameUrl)
                                }
                            })
                        }}
                    >
                        Create new Game
                    </MyButton>
                </Grid>
            </Grid>
        </Box>
    )
}

export default FindGame
