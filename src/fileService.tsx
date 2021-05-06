import { Box } from '@material-ui/core'
import React, { useRef } from 'react'
import MyButton from './components/MyButton'

interface ReadFileProps {
    handleInput: (data: string) => void
    allowedFileEndings: string[]
}

export const ReadFile: React.FC<ReadFileProps> = (props) => {
    const inputFileRef = useRef<HTMLInputElement | null>(null)
    const handleBtnClick = () => {
        if (inputFileRef.current != null) inputFileRef.current.click()
    }
    const onSelectFile = () => {
        if (inputFileRef.current == null) return
        var files = inputFileRef.current.files
        if (files === null || files.length === 0) return
        const file = files[0]
        var reader = new FileReader()
        reader.readAsText(file, 'UTF-8')
        reader.onload = function (evt) {
            if (evt.target == null) return
            if (evt.target.result == null) return
            const data = evt.target.result
            props.handleInput(data.toString())
        }
        inputFileRef.current.value = ''
    }
    return (
        <Box>
            <input
                hidden
                id="theFile"
                type="file"
                ref={inputFileRef}
                onChange={onSelectFile}
            />
            <MyButton onClick={handleBtnClick}>Read map</MyButton>
        </Box>
    )
}

interface SaveFileProps {
    fileName: string
    data: string
}

export const saveFile = (props: SaveFileProps) => {
    const textToBLOB = new Blob([props.data], { type: 'text/plain' })
    let link = document.createElement('a')
    link.download = props.fileName
    const href = window.URL.createObjectURL(textToBLOB)
    link.href = href
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
}

export const SaveFile: React.FC<SaveFileProps> = (props) => {
    const inputFileRef = useRef<HTMLInputElement | null>(null)
    const handleBtnClick = () => {
        if (inputFileRef.current != null) inputFileRef.current.click()
    }
    const textToBLOB = new Blob([props.data], { type: 'text/plain' })
    const href = window.URL.createObjectURL(textToBLOB)
    return (
        <Box>
            <a download={props.fileName} href={href}>
                Link
            </a>
            <MyButton onClick={handleBtnClick}>Save map</MyButton>
        </Box>
    )
}
