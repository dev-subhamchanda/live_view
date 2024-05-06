import React, { useState,useEffect } from 'react'
import socket from '../socket.js'
import { useNavigate } from 'react-router-dom'
const Home = () => {
    const [roomId, setroomId] = useState()
    const [emailId, setemailId] = useState()
    const navigate = useNavigate()
    const handleJoinRoom = () =>{
        if (!socket) {
            console.log(socket)
            console.error('Socket connection not available.');
            return;
        }

        if (!roomId || !emailId) {
            console.error('Please enter both email and room ID.');
            return;
        }

        socket.emit('join-room',{roomId,emailId});
    }
    const handleJoinedRoom = ({roomId}) =>{ navigate(`/room/:${roomId}`) }
    
    useEffect(() => {
      socket.on('joined-room', handleJoinedRoom)
    }, [socket])
    
  return (
    <>
    <h2 className='font-semibold text-2xl capitalize text-center pt-10'>Welcome to Live View</h2>
    <div className='container h-72 cursor-pointer w-96 bg-blue-100 rounded-lg shadow-md mx-auto my-6  '>
    <div className='flex flex-col items-center justify-center'>
        <input type="email" name="emailId" onChange={(e)=>setemailId(e.target.value)} placeholder='Enter Your Email Here' className='h-12 w-[20vw] rounded my-6 px-3 shadow-lg' />
        <input type="text" name='roomID' onChange={(e)=>setroomId(e.target.value)} placeholder='Submit Your Room ID Here' className='h-12 w-[20vw] rounded my-6 px-3 shadow-lg' />
        <input type="button" value="Join" onClick={handleJoinRoom} className='h-12 w-[20vw] bg-blue-600 rounded-md text-white font-semibold tracking-wider text-xl' />
    </div>
    </div>
    </>
  )
}

export default Home