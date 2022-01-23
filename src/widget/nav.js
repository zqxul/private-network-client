import 'tailwindcss/tailwind.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import React from 'react'
import { navs } from '../config'

export default function NavBar({ handleSwitchTab, handleLogout }) {

    return (
        <div className='flex flex-col w-10 p-2 space-y-3 border h-screen'>
            <div className='w-6 h-6 flex flex-row justify-center'>
                <img className='w-full h-full rounded-full' />
            </div>
            <ol className='w-6 h-full flex flex-col space-y-2 border text-sm text-center'>
                {
                    navs.map(nav =>
                        <li key={nav.name}>
                            <button value={nav.name} onClick={handleSwitchTab}><i id={nav.name} className={nav.icon}></i></button>
                        </li>
                    )
                }
            </ol >
            <div className='w-full h-12 flex flex-col space-y-1 align-middle justify-center'>
                <button className='border w-6 h-6 rounded-full' onClick={handleLogout}><i className='bi bi-box-arrow-left'></i></button>
                <button className='border w-6 h-6 rounded-full'><i className='bi bi-gear-fill'></i></button>
            </div >
        </div >

    )
}