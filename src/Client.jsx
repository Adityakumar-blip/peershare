import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

const socket = io("http://localhost:3000");

const Client = () => {
  const [file, setFile] = useState(null);
  const [connection, setConnection] = useState(null);
  const [dataChannel, setDataChannel] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const pc = new RTCPeerConnection();
    setConnection(pc);

    const dc = pc.createDataChannel("file-transfer");
    setDataChannel(dc);

    dc.onopen = () => {
      console.log("Data channel opened");
    };

    dc.onclose = () => {
      console.log("Data channel closed");
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("candidate", e.candidate, roomId);
      }
    };

    socket.on("candidate", (candidate) => {
      pc.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on("offer", async (offer) => {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", answer, roomId);
    });
  }, [roomId]);

  useEffect(() => {
    const id = uuidv4();
    setRoomId(id);
    socket.emit("join-room", id);

    return () => {
      socket.emit("leave-room", id);
    };
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const shareFile = async () => {
    if (!file || !connection || !dataChannel || !roomId) return;

    const offer = await connection.createOffer();
    await connection.setLocalDescription(offer);
    socket.emit("offer", offer, roomId);

    console.log("Data channel opening...");

    dataChannel.onopen = () => {
      console.log("Data channel opened");

      const fileReader = new FileReader();
      fileReader.onload = () => {
        console.log("File loaded");

        if (dataChannel.readyState === "open") {
          console.log("Sending file...");
          dataChannel.send(fileReader.result);
        } else {
          console.error("Data channel is not open");
        }
      };
      fileReader.readAsArrayBuffer(file);
    };

    // Generate the dynamic URL with the room ID
    const shareUrl = `${window.location.origin}/receiver/${roomId}`;
    console.log(`Share this URL to receive the file: ${shareUrl}`);
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={shareFile}>Share File</button>
    </div>
  );
};

export default Client;
