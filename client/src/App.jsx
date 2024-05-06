import React from 'react'
import { Routes,Route } from 'react-router-dom'
import Home from './components/Home'
import RoomPage from './components/RoomPage'
// import { SocketProvider } from '../providers/Socket'
import { PeerProvider } from './providers/Peer'
const App = () => {
  return (
    <>
     <PeerProvider>
      <Routes >
     <Route path="/" element={<><Home /></>} />
     <Route path="/room/:roomId" element={<RoomPage />} />
      </Routes>
      </PeerProvider>
      
    </>
  )
}

export default App