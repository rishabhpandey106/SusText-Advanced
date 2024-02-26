"use client"
import React, { createContext, useMemo, useContext } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

// export const SocketProvider = (props) => {
//   const socket = useMemo(() => io("localhost:8000"), []); //socket doesnt get initialized each time

//   return (
//     <SocketContext.Provider value={socket}>
//       {props.children}
//     </SocketContext.Provider>
//   );
// };

export default function SocketProvider(props) {
  const socket = useMemo(() => io("localhost:8000"), []); //socket doesnt get initialized each time

  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
}

