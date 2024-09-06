import React, { FC, useEffect, useRef } from "react";
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  IMicrophoneAudioTrack,
  IRemoteAudioTrack,
} from "agora-rtc-sdk-ng";
import { io } from "socket.io-client";

interface AgoraClientProps {
  channelName: string;
  token: string;
}

const AgoraClient: FC<AgoraClientProps> = ({ channelName, token }) => {
  const appId: string = "1369151da2df4f33bdd842b8c0797085"; // Replace with your actual Agora App ID
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);

  useEffect(() => {
    const incomingCallSound = new Audio("/public/teams_default.mp3");

    const handleIncomingCall = (data: {
      channelName: string;
      token: string;
      callerId: number;
    }) => {
      console.log("Incoming call:", data);
      incomingCallSound.play();
    };

    // Assuming you are using socket.io for real-time communication
    const socket = io();
    socket.on("incomingCall", handleIncomingCall);

    return () => {
      socket.off("incomingCall", handleIncomingCall);
    };
  }, []);

  useEffect(() => {
    const client: IAgoraRTCClient = AgoraRTC.createClient({
      mode: "rtc",
      codec: "vp8",
    });

    console.log("App ID:", appId);
    console.log("Channel Name:", channelName);
    console.log("Token:", token);

    const init = async () => {
      try {
        // Join the channel
        console.log("appid", appId);
        await client.join(appId, channelName, token, null);
        console.log("Joined channel successfully");

        // Create and publish a local audio track
        const localAudioTrack: IMicrophoneAudioTrack =
          await AgoraRTC.createMicrophoneAudioTrack();
        await client.publish([localAudioTrack]);
        localAudioTrackRef.current = localAudioTrack;

        console.log("Published audio track successfully");

        // Subscribe to remote users
        client.on(
          "user-published",
          async (
            user: IAgoraRTCRemoteUser,
            mediaType: "audio" | "video" | "datachannel"
          ) => {
            await client.subscribe(user, mediaType);

            if (mediaType === "audio") {
              const remoteAudioTrack: IRemoteAudioTrack | undefined =
                user.audioTrack;
              remoteAudioTrack?.play();
            }
          }
        );
      } catch (error) {
        console.log("appi2", appId);
        console.error("Failed to join the channel:", error);
      }
    };

    init();

    return () => {
      const leaveChannel = async () => {
        if (client) {
          await client.leave();
          client.remoteUsers.forEach((user: IAgoraRTCRemoteUser) => {
            if (user.audioTrack) user.audioTrack.stop();
          });
        }
        if (localAudioTrackRef.current) {
          localAudioTrackRef.current.stop();
          localAudioTrackRef.current.close(); // Close to release the resource
          localAudioTrackRef.current = null;
        }
      };
      leaveChannel();
    };
  }, [appId, channelName, token]);

  return <div></div>;
};

export default AgoraClient;
