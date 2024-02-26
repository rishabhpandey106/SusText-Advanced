// pages/form/[room].js
"use client"
import './page.css'
import peer from "../../services/peer"
import React , {useEffect , useCallback, useState}from "react"
import ReactPlayer from "react-player"
import { usePathname,useParams } from 'next/navigation';
import { useSocket } from '@/app/context/page';

export default function Room({props}) {
    const anme = usePathname();
    const {room} = useParams();
    const socket = useSocket();
    const [remoteSocketId , setRemoteSocketId] = useState(null);
    const [myStream , setMyStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState();


    const handleUserJoined = useCallback(({ email, id }) => {
        console.log(`Email ${email} joined room`);
        setRemoteSocketId(id);
    }, []);


    const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
    }, [remoteSocketId, socket]);


    const handleIncommingCall = useCallback(async ({from , offer})=> {
        setRemoteSocketId(from);
        console.log(`incoming call` , from , offer)
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        setMyStream(stream);
        const ans = await peer.getAnswer(offer);
        socket.emit('call:accepted' , {to: from , ans});
    });

    const sendStreams = useCallback(() => {
        for (const track of myStream.getTracks()) {
          peer.peer.addTrack(track, myStream);
        }
    }, [myStream]);


    const handleCallAccepted = useCallback(
        ({ from, ans }) => {
          peer.setLocalDescription(ans);
          console.log("Call Accepted!");
          sendStreams();
        },
        [sendStreams]
    );
    

    const handleNegoNeeded = useCallback(async () => {
        const offer = await peer.getOffer();
        socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
    }, [remoteSocketId, socket]);


    useEffect(() => {
        peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
        return () => {
          peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
        };
    }, [handleNegoNeeded]);
    

    const handleNegoNeedIncomming = useCallback(
        async ({ from, offer }) => {
          const ans = await peer.getAnswer(offer);
          socket.emit("peer:nego:done", { to: from, ans });
        },
        [socket]
    );


    const handleNegoNeedFinal = useCallback(async ({ ans }) => {
        await peer.setLocalDescription(ans);
    }, []);


    useEffect(() => {
        peer.peer.addEventListener("track", async (ev) => {
          const remoteStream = ev.streams;
          console.log("GOT TRACKS!!");
          setRemoteStream(remoteStream[0]);
        });
      }, []);

    
    useEffect(()=> {
        socket.on("user:joined", handleUserJoined);
        socket.on("incomming:call", handleIncommingCall);
        socket.on("call:accepted", handleCallAccepted);
        socket.on("peer:nego:needed", handleNegoNeedIncomming);
        socket.on("peer:nego:final", handleNegoNeedFinal);
        return ()=>{
            socket.off("user:joined", handleUserJoined);
            socket.off("incomming:call", handleIncommingCall);
            socket.off("call:accepted", handleCallAccepted);
            socket.off("peer:nego:needed", handleNegoNeedIncomming);
            socket.off("peer:nego:final", handleNegoNeedFinal);
        }
    }, [socket , handleUserJoined , handleIncommingCall , handleCallAccepted , handleNegoNeedIncomming , handleNegoNeedFinal]);


    return (
        <div>
        <h1>Room {room}</h1>
        <h1>{remoteSocketId ? "connected" : "room empty"}</h1>
        {myStream && <button onClick={sendStreams}>Send Stream</button>}
        {
            remoteSocketId && <button onClick={handleCallUser}>Call</button> 
        }
        {
            myStream && <ReactPlayer playing muted height="300px" width="500px" url={myStream}/>
        }
        {remoteStream && (
            <>
                <h1>Remote Stream</h1>
                <ReactPlayer
                playing
                muted
                height="300px"
                width="500px"
                url={remoteStream}
                />
            </>
            )}
        </div>
    );
}