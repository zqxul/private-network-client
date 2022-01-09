import 'tailwindcss/tailwind.css'
import React from 'react'

export default function Avartar({ imageUrl, alt }) {

    return (
        <div className='flex flex-col w-1/5 pr-4 justify-center'>
            <img className="rounded-full" src={imageUrl} alt={imageUrl} />
        </div>
    )
}