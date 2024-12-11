"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Mic, MicOff, VideoOff, PhoneOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Peer from "peerjs";
const CallPage = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const router = useRouter();
  const [peerId, setPeerId] = useState<string | null>(null);
  const [peer, setPeer] = useState<Peer | null>(null);
  const [remotePeerId, setRemotePeerId] = useState<string>("");
  const [ismanullayDisconnected, setIsManuallyDisconnected] = useState(false);

  useEffect(() => {
    const newPeer = new Peer({
      config: {
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:global.stun.twilio.com:3478",
            ],
          },
        ],
      },
      host: `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}` || "localhost",
      // host: "localhost",
      path: `${process.env.NEXT_PUBLIC_PEER_PATH}` || "/peerjs",
      secure: true,
    });

    newPeer.on("open", (id) => {
      setPeerId(id);
      console.log("Peer ID: ", id);
    });

    newPeer.on("call", (call) => {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          call.answer(stream);
          call.on("stream", (remoteStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }

            call.on("close", () => {
              if (!ismanullayDisconnected) {
                alert("The other user has disconnected");
                router.push("/");
              }
            });
          });
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null; // Clear remote video
          }
        })
        .catch((error) => {
          console.error("Error accessing media devices:", error);
        });
    });

    setPeer(newPeer);

    return () => {
      newPeer.destroy();
    };
  }, []);

  const startCall = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        const call = peer?.call(remotePeerId, stream);
        call?.on("stream", (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
      });
  };

  const toggleMute = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    stream.getAudioTracks().forEach((track) => (track.enabled = isMuted));
    setIsMuted(!isMuted);
  };

  const toggleCamera = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    stream.getVideoTracks().forEach((track) => (track.enabled = isCameraOff));
    setIsCameraOff(!isCameraOff);
  };
  const endCall = () => {
    setIsManuallyDisconnected(!ismanullayDisconnected);
    peer?.disconnect();
    router.push("/");
  };
  return (
    <Card className="w-full max-w-4xl">
      <CardContent className="p-4">
        <div className="relative aspect-video mb-4">
          <video
            ref={remoteVideoRef}
            className="w-full h-full object-cover rounded-lg"
            autoPlay
            playsInline
          />
          <video
            ref={localVideoRef}
            className="absolute bottom-4 right-4 w-1/4 h-1/4 object-cover rounded-lg border-2"
            autoPlay
            playsInline
            muted
          />
        </div>
        <div className="flex justify-center space-x-4">
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="icon"
            onClick={toggleMute}
          >
            {isMuted ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant={isCameraOff ? "destructive" : "secondary"}
            size="icon"
            onClick={toggleCamera}
          >
            {isCameraOff ? (
              <VideoOff className="h-4 w-4" />
            ) : (
              <Video className="h-4 w-4" />
            )}
          </Button>
          <Button variant="destructive" size="icon" onClick={endCall}>
            <PhoneOff className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Enter remote peer ID"
            value={remotePeerId}
            onChange={(e) => setRemotePeerId(e.target.value)}
            className="border p-2 rounded"
          />
          <Button onClick={startCall} className="ml-2">
            Start Call
          </Button>
        </div>
        {peerId && <p>Your Peer ID: {peerId}</p>}
      </CardContent>
    </Card>
  );
};

export default CallPage;
