import './App.css';
import Peer from 'simple-peer';
import React, { useEffect, useRef, useState } from "react";
import Socket from 'socket.io-client';

const ENDPOINT = "http://localhost:3005";
function App() {

  const [ stream, setStream ] = useState();
  const [me, setMe] = useState();
  const [call, setCall] = useState();
  const [callAccepted, setCallAccepted] = useState();
  const [callEnded, setCallEnded] = useState();

  const myVideo = useRef()

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({
      video: true, 
      audio: true
    }).then((stream) => {
      const peer1 = new Peer({initiator: true});
      peer1.on('signal', (data) => {
        setStream(data)
        myVideo.current.srcObject = stream
      });
    }).catch((error) => {
      console.log(error);
    })
    const socket = Socket(ENDPOINT);
    socket.on("me", (id) => setMe(id));
    socket.on('calluser', (callinfo) => {
      const { from, name: callerName, signal } = callinfo;
      setCall({ isReceivedCall: true, from, name: callerName, signal });
    });

  }, []);
  
  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({initiator: false, trickle: false, stream});
    peer.on('signal', (data) => {
      Socket.emit('answercall', { signal: data, to: call.from });
    })
  }

  const callUser = () => {

  }

  const leaveCall = () => {

  }

  return (
    <div className="App">
      <header className="App-header">
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          {stream &&  <video playsInline muted ref={myVideo} autoPlay style={{ width: "700px" }} />}
        </a>
      </header>
    </div>
  );
}

export default App;
