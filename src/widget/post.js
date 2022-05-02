import React from 'react'
import '../index.css'
import { EditorState, RichUtils } from 'draft-js';
import { Editor } from "react-draft-wysiwyg"
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

export default function PostEditor({ }) {
    const [editorState, setEditorState] = React.useState(EditorState.createEmpty())
    const handleEditorStateChange = editorState => {
        setEditorState(editorState)
    }

    function uploadImageCallBack(file) {
        return new Promise(
            (resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', 'https://api.imgur.com/3/image');
                xhr.setRequestHeader('Authorization', 'Client-ID XXXXX');
                const data = new FormData();
                data.append('image', file);
                xhr.send(data);
                xhr.addEventListener('load', () => {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response);
                });
                xhr.addEventListener('error', () => {
                    const error = JSON.parse(xhr.responseText);
                    reject(error);
                });
            }
        );
    }

    return (
        <div className='p-2'>
            <Editor
                editorState={editorState}
                onEditorStateChange={handleEditorStateChange}
                placeholder="Write something!"
                toolbar={{
                //     inline: { inDropdown: true },
                //     list: { inDropdown: true },
                //     textAlign: { inDropdown: true },
                //     link: { inDropdown: true },
                //     history: { inDropdown: true },
                    image: { uploadCallback: uploadImageCallBack, alt: { present: true, mandatory: true } },
                }}
            />
        </div>
    )
}