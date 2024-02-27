"use client"
import './page.css'
import {useSocket} from '../../context/page'
import { useRouter } from 'next/navigation';
import React , {useState , useCallback , useEffect} from 'react'

export default function Form() {
    const [email,setEmail] = useState("");
    const [room,setRoom] = useState("");

    const socket  = useSocket();
    const router = useRouter();
    const handleSubmitForm = useCallback((e) => {
        e.preventDefault();
        socket.emit("room:join", { email, room });
        console.log({
            email ,
            room,
            socket
        });
    } , [email , room , socket]);

    const handleJoinRoom = useCallback(
        (data) => {
          const { email, room } = data;
          console.log({email , room})
          router.push(`/video/${room}`);
          // router.push({ pathname: '/video/[room]', query: { room: room } })
        },
        [router]
      );

    useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
        socket.off("room:join", handleJoinRoom);
    };
    }, [socket, handleJoinRoom]);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        console.log("Email changed:", e.target.value);
    };

    const handleRoomChange = (e) => {
        setRoom(e.target.value);
        console.log("Room changed:", e.target.value);
    };

  return (
      <div>
        <h1>Lobby</h1>
        <form onSubmit={handleSubmitForm}>
            <label htmlFor='email'>Email ID </label>
            <input type="email" id="email" value={email} onChange={handleEmailChange} />
            <br/>
            <label htmlFor='room'>Room ID </label>
            <input type="text" id="room" value={room} onChange={handleRoomChange}/>
            <br/>
            <button>Join</button>
        </form>
    </div>
  )
}
