import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';

// Create a Context for sharing the peer connection and related data
const PeerContext = createContext(null);

// Custom hook to access the context easily
export const usePeer = () => useContext(PeerContext);

// Provider component to wrap your app or components where the peer connection will be used
export const PeerProvider = ({ children }) => {
  const [peer, setPeer] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [addedTracks, setAddedTracks] = useState(new Set());

  useEffect(() => {
    const fetchIceServers = async () => {
      try {
        const response = await fetch("https://liveview.metered.live/api/v1/turn/credentials?apiKey=9da79c8464eb5774b3ef636c69599d1bd981");
        const iceServers = await response.json();
        const newPeer = new RTCPeerConnection({ iceServers });
        setPeer(newPeer);
      } catch (error) {
        console.error("Error fetching ICE servers:", error);
      }
    };

    fetchIceServers();

    // Cleanup function
    return () => {
      if (peer) {
        peer.close();
      }
    };
  }, []);

  const createOffer = async () => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    return offer;
  };

  const createAnswer = async (offer) => {
    try {
      console.log("Setting remote description with offer:", offer);
      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      console.log("Remote description set, current peer connection state:", peer.signalingState);

      if (peer.signalingState !== "have-remote-offer") {
        console.log("Peer connection is not in 'have-remote-offer' state, current state:", peer.signalingState);
        return;
      }

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      return answer;
    } catch (error) {
      console.error("Error creating answer:", error);
    }
  };

  const setRemoteAns = async (answer) => {
    await peer.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const shareFeed = async (stream) => {
    stream.getTracks().forEach(track => {
      if (!addedTracks.has(track.id)) {
        peer.addTrack(track, stream);
        setAddedTracks(prevTracks => new Set([...prevTracks, track.id]));
      }
    });
  };

  const handleTrackEvent = useCallback((event) => {
    if (event.streams && event.streams[0]) {
      setRemoteStream(event.streams[0]);
    }
  }, []);

  const handleIceCandidateEvent = useCallback((event) => {
    if (event.candidate) {
      console.log("Sending ICE candidate:", event.candidate);
      // Send ICE candidate to the peer
    }
  }, []);

  useEffect(() => {
    if (peer) {
      peer.addEventListener('track', handleTrackEvent);
      peer.addEventListener('icecandidate', handleIceCandidateEvent);
      return () => {
        peer.removeEventListener('track', handleTrackEvent);
        peer.removeEventListener('icecandidate', handleIceCandidateEvent);
      };
    }
  }, [peer, handleTrackEvent, handleIceCandidateEvent]);

  return (
    <PeerContext.Provider value={{
      peer,
      createOffer,
      createAnswer,
      setRemoteAns,
      shareFeed,
      remoteStream,
    }}>
      {children}
    </PeerContext.Provider>
  );
};
