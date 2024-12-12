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
  const [connectionStatus, setConnectionStatus] =
    useState<string>("disconnected");

  useEffect(() => {
    const newPeer = new Peer({
      config: {
        iceServers: [
          {
            urls: "stun:stun.relay.metered.ca:80",
          },
          {
            urls: "turn:global.relay.metered.ca:80",
            username: "a25706e04f3f10caa95a681b",
            credential: "cT2+u03jab6q/7aC",
          },
          {
            urls: "turn:global.relay.metered.ca:80?transport=tcp",
            username: "a25706e04f3f10caa95a681b",
            credential: "cT2+u03jab6q/7aC",
          },
          {
            urls: "turn:global.relay.metered.ca:443",
            username: "a25706e04f3f10caa95a681b",
            credential: "cT2+u03jab6q/7aC",
          },
          {
            urls: "turns:global.relay.metered.ca:443?transport=tcp",
            username: "a25706e04f3f10caa95a681b",
            credential: "cT2+u03jab6q/7aC",
          },
        ],
        debug: 3, // Enable detailed logging
        host: process.env.NEXT_PUBLIC_DOMAIN,
        secure: true,
      },
    });

    // Enhanced error handling and logging
    newPeer.on("open", (id) => {
      setPeerId(id);
      setConnectionStatus("ready");
      console.log("Peer connection established. ID:", id);
    });

    newPeer.on("error", (error) => {
      console.error("Peer connection error:", error);
      setConnectionStatus("error");
    });

    newPeer.on("disconnected", () => {
      console.log("Peer disconnected");
      setConnectionStatus("disconnected");
    });

    newPeer.on("close", () => {
      console.log("Peer connection closed");
      setConnectionStatus("closed");
    });

    newPeer.on("call", async (call) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          // Add specific constraints for better compatibility
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        call.answer(stream);
        setConnectionStatus("connected");

        call.on("stream", (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });

        call.on("close", () => {
          if (!ismanullayDisconnected) {
            alert("The other user has disconnected");
            router.push("/");
          }
        });

        call.on("error", (error) => {
          console.error("Call error:", error);
          setConnectionStatus("error");
        });
      } catch (error) {
        console.error("Error accessing media devices:", error);
        setConnectionStatus("error");
      }
    });

    setPeer(newPeer);

    return () => {
      newPeer.destroy();
    };
  }, []);

  const startCall = async () => {
    if (!peer || !remotePeerId) {
      console.error("Peer or remote peer ID not available");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const call = peer.call(remotePeerId, stream);
      setConnectionStatus("connecting");

      call.on("stream", (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        setConnectionStatus("connected");
      });

      call.on("error", (error) => {
        console.error("Call error:", error);
        setConnectionStatus("error");
      });

      call.on("close", () => {
        setConnectionStatus("disconnected");
      });
    } catch (error) {
      console.error("Error starting call:", error);
      setConnectionStatus("error");
    }
  };

  const toggleMute = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    if (stream) {
      stream.getAudioTracks().forEach((track) => (track.enabled = isMuted));
      setIsMuted(!isMuted);
    }
  };

  const toggleCamera = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    if (stream) {
      stream.getVideoTracks().forEach((track) => (track.enabled = isCameraOff));
      setIsCameraOff(!isCameraOff);
    }
  };

  const endCall = () => {
    setIsManuallyDisconnected(true);
    if (peer) {
      peer.disconnect();
    }
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
          <Button
            onClick={startCall}
            className="ml-2"
            disabled={connectionStatus === "connecting"}
          >
            {connectionStatus === "connecting" ? "Connecting..." : "Start Call"}
          </Button>
        </div>
        <div className="mt-2">
          <p>Your Peer ID: {peerId}</p>
          <p>Connection Status: {connectionStatus}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CallPage;
