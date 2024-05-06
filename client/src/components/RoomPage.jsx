import React, { useEffect, useCallback, useState } from 'react';
import ReactPlayer from 'react-player';
import socket from '../socket';
import { usePeer } from '../providers/Peer';

const RoomPage = () => {
  const { peer, createOffer, createAnswer, setRemoteAns, shareFeed, remoteStream } = usePeer();
  const [myStream, setMyStream] = useState(null);
  const [remoteEmailID, setRemoteEmailID] = useState('');

  const handleOtherUserJoin = useCallback(async (data) => {
    const { emailId } = data;
    console.log(`${emailId} joined the room`);
    const offer = await createOffer();
    socket.emit("call-user", { emailId, offer });
    setRemoteEmailID(emailId);
  }, [createOffer]);

  const handleIncomingCall = useCallback(async (data) => {
    const { caller, offer } = data;
    console.log("Incoming call from:", caller);
    const answer = await createAnswer(offer);
    socket.emit("call-accepted", { caller, answer });
    setRemoteEmailID(caller);
  }, [createAnswer]);

  const handleCallAccepted = useCallback(async (data) => {
    const { answer } = data;
    await setRemoteAns(answer);
    console.log("Call accepted with answer:", answer);
  }, [setRemoteAns]);

  const getUserMedia = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setMyStream(stream);
    shareFeed(stream);
  }, [shareFeed]);

  useEffect(() => {
    socket.on('user-joined', handleOtherUserJoin);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-accepted", handleCallAccepted);
    return () => {
      socket.off('user-joined', handleOtherUserJoin);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-accepted", handleCallAccepted);
    };
  }, [handleOtherUserJoin, handleIncomingCall, handleCallAccepted]);

  useEffect(() => {
    const handleNegotiationNeeded = async () => {
      const offer = await createOffer();
      console.log("Negotiation needed, sending offer:", offer);
      socket.emit("call-user", { emailId: remoteEmailID, offer });
    };

    peer.addEventListener("negotiationneeded", handleNegotiationNeeded);
    return () => peer.removeEventListener("negotiationneeded", handleNegotiationNeeded);
  }, [peer, createOffer, remoteEmailID, socket]);

  useEffect(() => {
    getUserMedia();
  }, [getUserMedia]);

  return (
    <>
      <div className="text-center text-xl font-bold mb-4">Welcome to your Room</div>
      <h4>You are connected to {remoteEmailID}</h4>
      <div className="flex flex-wrap justify-around items-center gap-4 p-4">
        <h3>My Stream</h3>
        <ReactPlayer url={myStream} playing width="100%" height="100%" style={{ maxWidth: '480px', maxHeight: '360px' }} muted />
        <h3>Other Stream</h3>
         <ReactPlayer url={remoteStream} playing width="100%" height="100%" style={{ maxWidth: '480px', maxHeight: '360px' }} />
      </div>
      <button onClick={() => shareFeed(myStream)} className="h-12 w-36 bg-red-500 text-white font-bold py-2 px-4 rounded absolute bottom-10 right-10">Share Feed</button>
    </>
  );
}

export default RoomPage;
