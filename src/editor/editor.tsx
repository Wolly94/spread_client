import MyButton from '../components/MyButton'
import React, { useState } from 'react'
import { Box, Grid, makeStyles } from '@material-ui/core'
import { useHistory } from 'react-router'
import { PATHS } from '../Routes'
import EditorCanvas from './editorCanvas'
import { ReadFile, saveFile, SaveFile } from '../fileService'
import {
    emptyMap,
    exampleMap,
    SpreadMap,
    validateMap,
} from '../shared/game/map'

const useStyles = makeStyles({
    centered: {
        width: '65%',
        textAlign: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        paddingTop: '100px',
        paddingLeft: '12.5%',
    },
})

const Editor = () => {
    const classes = useStyles()
    const history = useHistory()
    const [unselectCell, setUnselectCell] = useState(0)

    const [map, setMap] = useState(emptyMap())

    const handleRead = (data: string) => {
        const m: SpreadMap = JSON.parse(data)
        const r = validateMap(m)
        console.log(JSON.stringify(r.message))
        setMap(r.map)
        setUnselectCell(unselectCell + 1)
    }

    const handleSave = () => {
        const r = validateMap(map)
        console.log(JSON.stringify(r.message))
        const data = JSON.stringify(r.map)
        setMap(r.map)
        saveFile({ fileName: 'Map.spread', data: data })
    }

    const startOver = () => {
        const m = emptyMap()
        setMap(m)
        setUnselectCell(unselectCell + 1)
    }

    return (
        <Box className={classes.centered}>
            <Grid container spacing={4} direction={'row'}>
                <Grid container spacing={4} direction={'row'}>
                    <Grid item xs={3}>
                        <MyButton onClick={startOver}>New</MyButton>
                    </Grid>
                    <Grid item xs={3}>
                        <ReadFile
                            allowedFileEndings={['.spread']}
                            handleInput={handleRead}
                        ></ReadFile>
                    </Grid>
                    <Grid item xs={3}>
                        <MyButton onClick={handleSave}>Save Map</MyButton>
                    </Grid>
                    <Grid item xs={3}>
                        <MyButton onClick={() => history.push(PATHS.root)}>
                            Back
                        </MyButton>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <EditorCanvas
                        map={map}
                        setMap={setMap}
                        unselectCell={unselectCell}
                    ></EditorCanvas>
                </Grid>
            </Grid>
        </Box>
    )
}

export default Editor
