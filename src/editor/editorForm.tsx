import { Box, MenuItem, Select, TextField, Typography } from '@material-ui/core'
import { useFormik } from 'formik'
import React from 'react'
import * as yup from 'yup'
import { distanceToEntity } from '../shared/game/entites'
import { MapCell, minRadius, SpreadMap } from '../shared/game/map'

const neutralPlayerId = -1

interface MapCellFormValues {
    xCoord: number
    yCoord: number
    radius: number
    units: number
    playerId: number
}

interface EditorFormProps {
    selectedCell: MapCell
    map: SpreadMap
    updateSelectedCell: (mapCell: MapCell) => void
    removeCell: (cellId: number) => void
}

const EditorForm: React.FC<EditorFormProps> = (props) => {
    const initialValues: MapCellFormValues = {
        xCoord: props.selectedCell.position[0],
        yCoord: props.selectedCell.position[1],
        radius: props.selectedCell.radius,
        units: props.selectedCell.units,
        playerId:
            props.selectedCell.playerId === null
                ? neutralPlayerId
                : props.selectedCell.playerId,
    }

    const validation = yup.object().shape({
        xCoord: yup.number().required().typeError('You have to enter a number'),
        yCoord: yup.number().required().typeError('You have to enter a number'),
        radius: yup.number().required().typeError('You have to enter a number'),
        units: yup.number().required().typeError('You have to enter a number'),
        playerId: yup.number().typeError('You have to enter a number'),
    })
    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validation,
        enableReinitialize: true,

        onSubmit: (values, { setSubmitting, setStatus, resetForm }) => {
            if (values.radius <= 0) {
                props.removeCell(props.selectedCell.id)
                return
            }
            const availableSpace = Math.floor(
                Math.min(
                    values.xCoord,
                    values.yCoord,
                    props.map.width - values.xCoord,
                    props.map.height - values.yCoord,
                    ...props.map.cells
                        .filter((c) => c.id !== props.selectedCell.id)
                        .map((c) =>
                            distanceToEntity(c, [values.xCoord, values.yCoord]),
                        ),
                ),
            )
            if (values.radius < minRadius) {
                setSubmitting(false)
                setStatus('Radius too small!')
                return
            }
            if (availableSpace < minRadius) {
                setSubmitting(false)
                setStatus('Not enough space!')
                return
            }
            const newSelectedCell: MapCell = {
                ...props.selectedCell,
                position: [
                    Math.floor(values.xCoord),
                    Math.floor(values.yCoord),
                ],
                units: Math.floor(values.units),
                radius: Math.min(
                    Math.max(Math.floor(values.radius), minRadius),
                    availableSpace,
                ),
                playerId:
                    values.playerId === neutralPlayerId
                        ? null
                        : values.playerId,
            }
            props.updateSelectedCell(newSelectedCell)
            setSubmitting(false)
            resetForm()
        },
    })

    let players = []
    for (let i = 0; i < props.map.players + 1; i++) {
        players.push(i + 1)
    }

    return (
        <form onSubmit={formik.handleSubmit}>
            {formik.status !== undefined && (
                <Typography variant="h5" component="h5" color="error">
                    {formik.status}
                </Typography>
            )}
            <Box paddingBottom={3}></Box>
            <TextField
                id="xCoord"
                label={'x-Coordinate'}
                fullWidth={true}
                variant="outlined"
                value={formik.values.xCoord}
                onChange={(e) => {
                    formik.handleChange(e)
                    //formik.submitForm()
                }}
                error={formik.touched.xCoord && Boolean(formik.errors.xCoord)}
                helperText={formik.touched.xCoord && formik.errors.xCoord}
            />
            <Box paddingBottom={3}></Box>

            <TextField
                id="yCoord"
                label={'y-Coordinate'}
                fullWidth={true}
                variant="outlined"
                value={formik.values.yCoord}
                onChange={(e) => {
                    formik.handleChange(e)
                }}
                error={formik.touched.yCoord && Boolean(formik.errors.yCoord)}
                helperText={formik.touched.yCoord && formik.errors.yCoord}
            />
            <Box paddingBottom={3}></Box>

            <TextField
                id="radius"
                label={'Radius'}
                fullWidth={true}
                variant="outlined"
                value={formik.values.radius}
                onChange={(e) => {
                    formik.handleChange(e)
                }}
                error={formik.touched.radius && Boolean(formik.errors.radius)}
                helperText={formik.touched.radius && formik.errors.radius}
            />
            <Box paddingBottom={3}></Box>

            <TextField
                id="units"
                label={'Units'}
                fullWidth={true}
                variant="outlined"
                value={formik.values.units}
                onChange={(e) => {
                    formik.handleChange(e)
                }}
                error={formik.touched.units && Boolean(formik.errors.units)}
                helperText={formik.touched.units && formik.errors.units}
            />
            <Box paddingBottom={3}></Box>

            <Select
                name="playerId"
                value={formik.values.playerId}
                onChange={(e) => {
                    formik.handleChange(e)
                }}
                onBlur={formik.handleBlur}
                style={{ display: 'block' }}
            >
                <MenuItem value={-1}>Neutral Player</MenuItem>

                {players.map((i) => (
                    <MenuItem key={i} value={i}>
                        Player {i}
                    </MenuItem>
                ))}
            </Select>
            <Box paddingBottom={3}></Box>

            <button type="submit" onClick={(ev) => formik.handleSubmit()}>
                Submit
            </button>
        </form>
    )
}

export default EditorForm