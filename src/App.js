import './App.css';
import Peer from 'simple-peer';
import React, { useEffect, useRef, useState } from "react";
import Socket from 'socket.io-client';

const ENDPOINT = "https://ablame-backend.herokuapp.com/";
function App() {

  const [ stream, setStream ] = useState();
  const [ me, setMe ] = useState();
  const [ call, setCall ] = useState({});
  const [ callAccepted, setCallAccepted ] = useState();
  const [ callEnded, setCallEnded ] = useState();
  const [ name, setName ] = useState();
  const [ idToCall, setIdToCall ] = useState();
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

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
    const socket = Socket(ENDPOINT,  {transports: ['websocket']});
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
    });
    peer.on('stream', (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });
    peer.signal(call.signal);
    connectionRef.current = peer;
  }

  const callUser = (id) => {
    
    const peer = new Peer({ initiator: true, trickle: false, stream });
    console.log("startted");
    peer.on('signal', (data) => {
      
      Socket.emit('calluser', { userToCall: id, signalData: data, from: me, name });
    });
    peer.on('stream', (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });
    Socket.on('callAccepted', (signal) => {
      console.log(signal);
      setCallAccepted(true); 
      peer.signal(signal);
    });

    connectionRef.current = peer;
  }

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
    window.location.reload();
  }

  return (
    <div className="App">
      <header className="App-header">
        <div>
            <h2>{name || 'name'}</h2>
            {stream &&  <video playsInline muted ref={myVideo} autoPlay style={{ width: "700px", height: "700px" }} />}
        </div>
        <div>
            {callAccepted && !callEnded && (
              <div>
                <h2>{call.name || 'name'}</h2>
                <video playsInline muted ref={userVideo} autoPlay style={{ width: "700px", height: "700px" }} />
              </div>
            )}
        </div>
        <div>
          <label>{me}</label>
        </div>
        <div>
          <label>Name</label>
          <input type={"text"} onChange={(e) => {
            setName(e.target.value);
          }}></input>
        </div>
        <div>
          <label>ID To Call</label>
          <input type={"text"} onChange={(e) => {
            setIdToCall(e.target.value)
          }}></input>
        </div>
        <div>
          {
            callAccepted && !callEnded ? (
              <input type={"button"} value={"hangup"} onClick={leaveCall}/>
            ): (
              <input type={"button"} value={"call"} onClick={() => callUser(idToCall)}/>
            )
          }
        </div>
        <div>
          {
            call.isReceivedCall && !callAccepted && (
              <div>
                <h1>{call.name}</h1>
                <input type={"button"} onClick={answerCall} value={"answer call"}/>
              </div>
            )
          }
        </div>
      </header>
    </div>
  );
}

export default App;
