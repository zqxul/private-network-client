import tailwindcss from "tailwindcss"
export default function Post({ }) {

    return (
        <div>
            <div className='focus:border-1 px-3'>
                <input className=" border-2 " placeholder='有什么新鲜事' />
            </div>
            <div className=" border-solid border-2 ">所有人可回复</div>
            <div>
                <div className="border 1px solid" style={{border: '1px solid'}}>Attachment: Media\Vote\Smile\Schedule</div>
                <div>
                    <button>Post</button>
                </div>
            </div>
        </div>
    )
}