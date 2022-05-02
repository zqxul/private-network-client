import React from 'react'
import '../index.css'
import { Editor, EditorState, RichUtils } from 'draft-js';
import 'draft-js/dist/Draft.css';

export default function PostEditor({ }) {
    const [editorState, setEditorState] = React.useState(EditorState.createEmpty())
    const editor = React.useRef(null);
    function focusEditor() {
        editor.current.focus();
    }

    const handleStyle = e => {
        let oldEditorState = editorState
        setEditorState(RichUtils.toggleInlineStyle(oldEditorState, e.target.value))
    }

    const handleChange = editorState =>{
        setEditorState(editorState)
    }

    const handleKeyCommand = command =>{
        const newState = RichUtils.handleKeyCommand(editorState, command)
        if (newState){
            handleChange(newState)
        }
    }

    return (
        <div className='flex flex-col'>
            <div className='flex space-x-1 p-2'>
                <button value='italic' className=' border-2 w-6 italic' onClick={handleStyle}>I</button>
                <button value='bold' className=' border-2 w-6 bold' onClick={handleStyle}>B</button>
                <button value='underline' className=' border-2 w-6 underline' onClick={handleStyle}>U</button>
            </div>
            <div style={{ border: "1px solid black", minHeight: "6em", cursor: "text" }}
                onClick={focusEditor}>
                <Editor
                    ref={editor}
                    editorState={editorState}
                    onChange={handleChange}
                    handleKeyCommand={handleKeyCommand}
                    placeholder="Write something!"
                />
            </div>
        </div>
    )
}