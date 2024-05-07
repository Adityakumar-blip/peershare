import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

const Receiver = ({ roomId }) => {
  const [receivedFile, setReceivedFile] = useState(null);

  useEffect(() => {
    const pc = new RTCPeerConnection();

    pc.ondatachannel = (event) => {
      const receiveChannel = event.channel;
      receiveChannel.binaryType = "arraybuffer";

      receiveChannel.onmessage = (event) => {
        console.log("File received");
        setReceivedFile(event.data);
      };
    };

    socket.on("answer", async (answer) => {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    return () => {
      pc.close();
    };
  }, [roomId]);

  return (
    <div>
      <h1>File Receiver</h1>
      {receivedFile && (
        <a
          href={URL.createObjectURL(new Blob([receivedFile]))}
          download="received_file"
        >
          Download Received File
        </a>
      )}
    </div>
  );
};

export default Receiver;
