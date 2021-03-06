import '../index.css'
import '../icon.css'
import { EmojiButton } from '@joeattardi/emoji-button'
import React, { useState } from 'react'
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";


export default function ExplorePage({ sessionID }) {

    const [toggleVote, setToggleVote] = useState(false)

    const [toggleCalendar, setToggleCalendar] = useState(true)

    const [state, setState] = useState({
        body: '',
        attachments: null,
        publishAt: new Date(),
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

    const handleUploadFile = e => {
        let targetId = e.target.id
        switch (targetId) {
            case 'image-attachment':
                document.getElementById('image-input').click()
                break
            case 'video-attachment':
                document.getElementById('video-input').click()
                break
        }
    }

    const handleClick = e => {
        e.stopPropagation()
    }

    const handleToggleVote = e => {
        let toggle = toggleVote
        setToggleVote(!toggle)
    }

    const hideVotePanel = e => {
        setToggleVote(false)
    }

    const handleToggleCalendar = e => {
        let calendar = toggleCalendar
        setToggleCalendar(!calendar)
    }

    const handleSelectDate = date => {
        console.log(date)
        setState({
            ...state,
            publishAt: date
        })
    }

    return (

        <div className='flex divide-x w-11/12'> {
            toggleVote == true ?
                <div className='w-2/3'>
                    <VotePanel hideVotePanel={hideVotePanel} />
                </div>
                :
                <div className='flex justify-between h-32 w-2/3 divide-x'>
                    <div className='w-full border-b flex flex-col justify-between space-y-1'>
                        <textarea value={state.body} className="'w-full h-5/6 mx-1 px-1" onChange={handleChange} placeholder='??????????????????' />
                        <ul className="h-1/6 text-xs px-3 flex space-x-2">
                            <li>
                                <i id='image-attachment' className='bi bi-images' onClick={handleUploadFile}>
                                    <input id='image-input' multiple type='file' onClick={handleClick} className='hidden' accept='image/*' />
                                </i>
                            </li>
                            <li>
                                <i id='video-attachment' className="bi bi-youtube" onClick={handleUploadFile}>
                                    <input id='video-input' multiple type='file' onClick={handleClick} className='hidden' accept='video/*' />
                                </i>
                            </li>
                            <li>
                                <i className="bi bi-kanban" onClick={handleToggleVote}></i>
                            </li>
                            <li>
                                <i className='bi bi-emoji-smile' onClick={handleTogglePicker}></i>
                            </li>
                            <li className='flex space-x-2 justify-between'>
                                <i className='bi bi-calendar-date' onClick={handleToggleCalendar}></i>
                                {toggleCalendar ? (<Datetime onChange={handleSelectDate} value={state.publishAt} />) : null}
                            </li>
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
        }
            <div className='w-1/3 h-screen'>
                <RecommendItem item={{ name: "name1" }} />
            </div>
        </div>
    )
}

function VotePanel({ hideVotePanel }) {

    const [state, setState] = useState({
        title: null,
        description: null,
        type: 'text',
        options: [{
            url: '',
            content: null,
        }],
        needDesc: false
    })

    const handleToggleNeedDesc = e => {
        let { needDesc } = state
        setState({
            ...state,
            needDesc: !needDesc
        })
    }

    const handleTypeChange = e => {
        setState({
            ...state,
            type: e.target.value
        })
    }

    const handleAppendOption = e => {
        let newOptions = [...state.options, {
            url: null,
            content: null
        }]
        setState({
            ...state,
            options: newOptions
        })
    }

    const handleRemoveOption = e => {
        let index = e.target.id
        let { options } = state
        let newOptions = [...options.slice(0, index), ...options.slice(index + 1)]
        setState({
            ...state,
            options: newOptions
        })
    }

    return (
        <div className='mx-1 px-2 py-1 flow flow-col w-full border-2 space-y-2 divide-y border-x-rose-400'>
            <div>
                <div className='flex flex-col space-y-2 text-sm'>
                    <input type='text' placeholder='????????????' className='border p-2' defaultValue={state.title} />
                </div>
                <div className='flex flex-col space-y-1 text-sm'>
                    <button className='text-cyan-600' onClick={handleToggleNeedDesc}><span className='p-1'>+</span>??????</button>
                    <textarea className='border' hidden={state.needDesc === false} />
                </div>
            </div>
            <div className='p-2 flex justify-between text-sm'>
                <span className='text-sm'>????????????</span>
                <ul className='flex space-x-8 text-xs'>
                    <li className='space-x-1'>
                        <input className='align-middle' type='radio' name='type' value='text' onChange={handleTypeChange} checked={state.type === 'text'} />
                        <label className='align-middle'>????????????</label>
                    </li>
                    <li className='space-x-1'>
                        <input className='align-middle' type='radio' name='type' value='image' onChange={handleTypeChange} checked={state.type === 'image'} />
                        <label className='align-middle'>????????????</label>
                    </li>
                </ul>
                <div></div>
            </div>
            <div className='flex flex-col p-2 text-xs'>
                <span className='text-sm'>????????????</span>
                <div className='flex flex-col space-y-1 p-2'>
                    {state.options.map((option, i) => (
                        <div key={i} className='flex space-x-2'>
                            {
                                state.type === 'text' ? null : (
                                    <div>
                                        <input className='border w-5 h-5 rounded-sm' type='image' src={option.url} />
                                        <input className='hidden' type='file' />
                                    </div>
                                )
                            }
                            <input className='border w-full py-1 px-2' defaultValue={option.content} />
                            <i id={i} className='bi bi-x text-lg text-red-600' onClick={handleRemoveOption}></i>
                        </div>
                    ))}
                    <button className='text-sm text-cyan-600' onClick={handleAppendOption}><span className='p-1'>+</span>??????</button>
                </div>
            </div>
            <div className='flex flex-col space-y-2 p-2 text-xs'>
                <label className='text-sm'>????????????</label>
                <div className='flex space-x-3'>
                    <input type='date' />
                    <input type='time' />
                </div>
            </div>
            <div className='flex px-2 justify-around text-3xl'>
                <i className="bi bi-x" onClick={hideVotePanel}></i>
                <i className="bi bi-check"></i>
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