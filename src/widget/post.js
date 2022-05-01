import '../index.css'
import { EmojiButton } from '@joeattardi/emoji-button'
import React, { useState } from 'react'


export default function PostPage({ sessionID }) {

    const [state, setState] = useState({
        body: '',
        attachments: null,
        publishAt: null,
        to: null
    })
    const picker = new EmojiButton()
    picker.on('emoji', selection => {
        console.log(selection.emoji)
        const body = state.body
        let value = body + selection.emoji
        setState({
            body: value
        })
    })

    const handleTogglePicker = e => {
        picker.togglePicker(e.target)
    }

    const handleChange = e => {
        let value = e.target.value
        setState({
            body: value
        })
    }

    return (
        <div className='flex divide-x w-full'>
            <div className='flex justify-between h-32 w-2/3 divide-x'>
                <div className='divide-y w-full flex flex-col justify-between'>
                    <textarea value={state.body} className="'w-full h-5/6 rounded-none" onChange={handleChange} placeholder='有什么新鲜事' />
                    <ul className="h-1/6 text-xs flex space-x-2">
                        <li><button className=' border-x '>Media</button></li>
                        <li><button className=' border-x '>Vote</button></li>
                        <li><i className='bi bi-emoji-smile' onClick={handleTogglePicker}>emoji</i></li>
                        <li><button className=' border-x '>Schedule</button></li>
                    </ul>
                </div>
                <div className='flex flex-col w-32 divide-y'>
                    <button className='h-2/3 text-center text-3xl'>
                        Post
                    </button>
                    <div className="h-1/3 flex justify-between">
                        <span className='text-xs w-1/4'>
                            To
                        </span>
                        <select className='text-xs w-3/4 text-center border border-blue-400 '>
                            <option>Anyone</option>
                            <option>Friend</option>
                            <option>Follower</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className='w-1/3 h-screen'>
                <RecommendItem item={{ name: "name1" }} />
            </div>
        </div>
    )
}

function RecommendItem({ item }) {
    return (
        <div className='flex space-x-1'>
            <span className='text-sm'>{item.name}</span>
            <div>avatar</div>
        </div>
    )
}