import MyButton from '../components/MyButton'
import React from 'react'
import { Box, makeStyles } from '@material-ui/core'
import { useHistory } from 'react-router'
import { PATHS } from '../Routes'
import EditorCanvas from './editorCanvas'

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

const Editor = () => {
    const classes = useStyles()
    const history = useHistory()
    return (
        <Box className={classes.centered}>
            <EditorCanvas></EditorCanvas>
            <MyButton onClick={() => history.push(PATHS.root)}>Back</MyButton>
        </Box>
    )
}

export default Editor
