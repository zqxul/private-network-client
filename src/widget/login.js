import React, { useState } from 'react'
import '../index.css'

const electron = window.electron

const ipcRenderer = electron.ipcRenderer
export default function LoginPanel({ handleLogin }) {

    const [isNew, setIsNew] = useState(false)

    function handleSwitchForm(e) {
        e.preventDefault()
        if (e.target.name === 'NewAccount') {
            setIsNew(true)
        } else if (e.target.name === 'Back2Login') {
            setIsNew(false)
        }
    }


    return (
        <div className='h-screen w-screen border flex flex-col space-y-4 justify-center'>
            {isNew ? <RegisterDiv handleClick={handleSwitchForm} /> : <LoginDiv handleClick={handleSwitchForm} handleLogin={handleLogin} />}
        </div>
    )
}

function LoginDiv({ handleClick, handleLogin }) {
    let initCaptcha = loadCaptcha()
    return (
        <>
            <div className='p-4 flex justify-center'>
                <button name='NewAccount' className='rounded px-6 py-1 font-bold bg-gray-100' onClick={handleClick}>New Account</button>
            </div>
            <LoginForm initCaptcha={initCaptcha} onSuccess={handleLogin} />
        </>
    )
}

function RegisterDiv({ handleClick }) {
    let initCaptcha = loadCaptcha()
    return (
        <>
            <div className='p-4 flex justify-center'>
                <button name='Back2Login' className='rounded px-6 py-1 font-bold bg-gray-100' onClick={handleClick}>Back to Login</button>
            </div>
            <RegisterForm initCaptcha={initCaptcha} />
        </>
    )
}


function loadCaptcha() {
    return ipcRenderer.sendSync('loadCaptcha', {
        captchaID: '',
        width: 64,
        height: 32
    })
}

function LoginForm({ initCaptcha, onSuccess }) {

    const [captcha, setCaptcha] = useState({
        id: initCaptcha.captchaID,
        content: initCaptcha.captcha
    })

    const [logInfo, setLogInfo] = useState({
        username: '',
        password: '',
        captchaID: captcha.id,
        captcha: ''
    })

    function reloadCaptcha() {
        let result = ipcRenderer.sendSync('loadCaptcha', {
            captchaID: '',
            width: 64,
            height: 32
        })
        if (result && result.captcha) {
            setCaptcha({
                id: result.captchaID,
                content: result.captcha
            })
            let newLogInfo = { ...logInfo }
            newLogInfo.captchaID = result.captchaID
            newLogInfo.captcha = ''
            setLogInfo(newLogInfo)
        }
    }

    function handleChange(e) {
        e.preventDefault()
        let newLogInfo = { ...logInfo }
        let { name, value } = e.target
        switch (name) {
            case 'username':
                newLogInfo.username = value
                break
            case 'password':
                newLogInfo.password = value
                break
            case 'captcha':
                newLogInfo.captcha = value
                break
        }
        setLogInfo(newLogInfo)
    }

    function handleSubmit(e) {
        e.preventDefault()
        console.log('submit login form')
        let result = ipcRenderer.sendSync('login', logInfo)
        console.log('login result is ', result)
        let success = result && result.sessionID
        if (success) {
            onSuccess(result.sessionID)
        }
    }

    // function clearForm() {
    //     setLogInfo({
    //         username: '',
    //         password: '',
    //         captchaID: captcha.id,
    //         captcha: ''
    //     })
    //     reloadCaptcha()
    // }

    return (
        <div className='w-full flex justify-center'>
            <form className='flex flex-col space-y-3 w-60'>
                <div className='border'>
                    <input className='placeholder:pl-2 w-full' onChange={handleChange} name='username' value={logInfo.username} type='text' placeholder='username'></input>
                </div>
                <div className='border'>
                    <input className='placeholder:pl-2 w-full' onChange={handleChange} name='password' value={logInfo.password} type='password' placeholder='password'></input>
                </div>
                <div className='border flex flex-row justify-between h-10'>
                    <input className='border placeholder:pl-2 w-3/5' onChange={handleChange} name='captcha' type='text' placeholder='captcha'></input>
                    <img onClick={reloadCaptcha} className='w-2/5' src={'data:image/png;base64,' + captcha.content} alt="captcha" />
                </div>
                <div className='flex justify-center'>
                    <button className='border rounded px-2 py-1 text-sm font-extrabold' onClick={handleSubmit}>Login</button>
                </div>
            </form >
        </div >
    )
}

function RegisterForm({ initCaptcha }) {

    const [captcha, setCaptcha] = useState({
        id: initCaptcha.captchaID,
        content: initCaptcha.captcha
    })
    const [result, setResult] = useState({
        success: false,
        userID: '',
        networkID: ''
    })
    const [regInfo, setRegInfo] = useState({
        username: '',
        password: '',
        nickname: '',
        captchaID: captcha.id,
        captcha: ''
    })

    function reloadCaptcha() {
        let result = ipcRenderer.sendSync(
            'loadCaptcha',
            {
                captchaID: '',
                width: 64,
                height: 32
            }
        )
        if (result && result.captcha) {
            setCaptcha({
                id: result.captchaID,
                content: result.captcha
            })
        }
        let newRegInfo = { ...regInfo }
        newRegInfo.captchaID = result.captchaID
        newRegInfo.captcha = ''
        setRegInfo(newRegInfo)
        console.log("new reg info: ", newRegInfo)
    }

    function handleChange(e) {
        e.preventDefault()
        let newRegInfo = { ...regInfo }
        let { name, value } = e.target
        switch (name) {
            case 'username':
                newRegInfo.username = value
                break
            case 'password':
                newRegInfo.password = value
                break
            case 'nickname':
                newRegInfo.nickname = value
                break
            case 'captcha':
                newRegInfo.captcha = value
                break
        }
        setRegInfo(newRegInfo)
    }

    function handleSubmit(e) {
        e.preventDefault()
        console.log('submit register form')
        let result = ipcRenderer.sendSync('register', regInfo)
        console.log('register result: ', result)
        let success = result && result.userID && result.networkID
        if (!success) {
            alert(result.err)
            return
        }
        setResult({
            success: success,
            userID: result.userID,
            networkID: result.networkID
        })
    }

    return result.success ?
        (
            <div className='w-full flex justify-center'>
                {result.networkID}
            </div>
        ) :
        (
            <div className='w-full flex justify-center'>
                <form className='flex flex-col space-y-3 w-60'>
                    <div className='border'>
                        <input className='placeholder:pl-2 w-full' onChange={handleChange} value={regInfo.username} name='username' type='text' placeholder='username'></input>
                    </div>
                    <div className='border'>
                        <input className='placeholder:pl-2 w-full' onChange={handleChange} value={regInfo.password} name='password' type='password' placeholder='password'></input>
                    </div>
                    <div className='border'>
                        <input className='placeholder:pl-2 w-full' onChange={handleChange} value={regInfo.nickname} name='nickname' type='text' placeholder='nickname'></input>
                    </div>
                    <div className='border flex flex-row justify-between h-10'>
                        <input className='border placeholder:pl-2 w-3/5' onChange={handleChange} value={regInfo.captcha} name='captcha' type='text' placeholder='captcha'></input>
                        <img onClick={reloadCaptcha} className='w-2/5' src={'data:image/png;base64,' + captcha.content} alt="captcha" />
                    </div>
                    <div className='flex justify-center'>
                        <button className='border rounded px-2 py-1 text-sm font-extrabold' onClick={handleSubmit}>Create Account</button>
                    </div>
                </form>
            </div>
        )
}