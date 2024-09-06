import React, { useEffect, useState, useCallback } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Container,
  Paper,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import CallIcon from "@mui/icons-material/Call";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import LeaveIcon from "@mui/icons-material/ExitToApp";
import AgoraRTC, {
  ILocalAudioTrack,
  IAgoraRTCClient,
  UID,
  IAgoraRTCRemoteUser,
  IRemoteAudioTrack,
} from "agora-rtc-sdk-ng";
import axios from "axios";
import appid from "../../config";

type AudioTracks = {
  localAudioTrack: ILocalAudioTrack | null;
  remoteAudioTracks: { [uid: string]: IRemoteAudioTrack };
};

const AgoraVoiceChat: React.FC = () => {
  const [rtcClient, setRtcClient] = useState<IAgoraRTCClient | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [audioTracks, setAudioTracks] = useState<AudioTracks>({
    localAudioTrack: null,
    remoteAudioTracks: {},
  });
  const [roomJoined, setRoomJoined] = useState<boolean>(false);
  const [members, setMembers] = useState<{ uid: string }[]>([]);
  const [callID, setCallID] = useState<number | null>(null); // Track the current call ID
  const rtcUid = Math.floor(Math.random() * 2032).toString();

  const handleUserJoined = useCallback((user: { uid: UID }) => {
    setMembers((prevMembers) => [...prevMembers, { uid: user.uid.toString() }]);
    console.log("User joined:", user);
  }, []);

  const handleUserPublished = useCallback(
    async (remoteUser: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
      if (rtcClient && mediaType === "audio") {
        try {
          await rtcClient.subscribe(remoteUser, mediaType);
          const remoteAudioTrack = remoteUser.audioTrack;
          if (remoteAudioTrack) {
            remoteAudioTrack.play();
            console.log("Playing remote audio track for user:", remoteUser.uid);
            setAudioTracks((prev) => ({
              ...prev,
              remoteAudioTracks: {
                ...prev.remoteAudioTracks,
                [remoteUser.uid]: remoteAudioTrack,
              },
            }));
          } else {
            console.error(
              "Failed to get remote audio track for user:",
              remoteUser.uid
            );
          }
        } catch (error) {
          console.error("Failed to handle user published:", error);
        }
      }
    },
    [rtcClient]
  );

  const handleUserLeft = useCallback((user: { uid: UID }) => {
    setAudioTracks((prev) => {
      const updatedRemoteAudioTracks = { ...prev.remoteAudioTracks };
      delete updatedRemoteAudioTracks[user.uid];
      return {
        ...prev,
        remoteAudioTracks: updatedRemoteAudioTracks,
      };
    });
    setMembers((prevMembers) =>
      prevMembers.filter((member) => member.uid !== user.uid.toString())
    );
    console.log("User left:", user.uid);
  }, []);

  const initRtc = useCallback(
    async (roomId: string) => {
      try {
        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        setRtcClient(client);

        client.on("user-joined", handleUserJoined);
        client.on("user-published", handleUserPublished);
        client.on("user-left", handleUserLeft);

        await client.join(appid, roomId, null, rtcUid);
        const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        if (!localAudioTrack) {
          console.error("Failed to create local audio track");
          return;
        }
        console.log("Local audio track created:", localAudioTrack);
        setAudioTracks((prev) => ({ ...prev, localAudioTrack }));
        await client.publish(localAudioTrack);
        console.log("Local audio track published");

        setMembers((prevMembers) => [...prevMembers, { uid: rtcUid }]);
        console.log("Joined channel and published local audio track");

        // Create a call entry in the database
        const startTime = new Date().toISOString();
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/calls`,
          {
            CallerID: rtcUid,
            ReceiverID: null,
            GroupID: null,
            StartTime: startTime,
            EndTime: null,
            CallType: "audio",
            ScreenShared: false,
          }
        );

        setCallID(response.data.id); // Store the call ID
      } catch (error) {
        console.error("Failed to initialize RTC:", error);
      }
    },
    [rtcUid, handleUserJoined, handleUserPublished, handleUserLeft]
  );

  const enterRoom = useCallback(async () => {
    await initRtc("main");
    setRoomJoined(true);
  }, [initRtc]);

  const leaveRoom = useCallback(async () => {
    if (audioTracks.localAudioTrack) {
      audioTracks.localAudioTrack.stop();
      audioTracks.localAudioTrack.close();
    }
    if (rtcClient) {
      if (audioTracks.localAudioTrack) {
        await rtcClient.unpublish(audioTracks.localAudioTrack);
      }
      await rtcClient.leave();
    }
    setRtcClient(null);
    setAudioTracks({
      localAudioTrack: null,
      remoteAudioTracks: {},
    });
    setRoomJoined(false);
    setMembers([]);

    // Update the call entry in the database
    if (callID) {
      const endTime = new Date().toISOString();
      await axios.put(`${process.env.REACT_APP_API_URL}/api/calls/${callID}`, {
        EndTime: endTime,
      });
      setCallID(null); // Reset the call ID
    }
  }, [rtcClient, audioTracks, callID]);

  const toggleMute = useCallback(() => {
    if (audioTracks.localAudioTrack) {
      if (isMuted) {
        audioTracks.localAudioTrack.setEnabled(true);
        console.log("Unmuted local audio track");
      } else {
        audioTracks.localAudioTrack.setEnabled(false);
        console.log("Muted local audio track");
      }
      setIsMuted(!isMuted);
    }
  }, [audioTracks.localAudioTrack, isMuted]);

  useEffect(() => {
    const checkAudioTrack = async () => {
      try {
        if (audioTracks.localAudioTrack) {
          const volumeLevel =
            await audioTracks.localAudioTrack.getVolumeLevel();
          setIsMuted(volumeLevel === 0);
          console.log(
            `Local audio track is ${volumeLevel === 0 ? "muted" : "unmuted"}`
          );
        }
      } catch (error) {
        console.error("Failed to check audio track volume level:", error);
      }
    };
    checkAudioTrack();
  }, [audioTracks.localAudioTrack]);

  return (
    <Container maxWidth="sm">
      <AppBar
        position="static"
        sx={{
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#ffffff",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" component="div">
            Office Chat
          </Typography>
          <Box>
            <IconButton
              aria-label="audio call"
              onClick={enterRoom}
              disabled={roomJoined}
            >
              <CallIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Paper elevation={3} sx={{ marginTop: 2, padding: 2 }}>
        <Box
          sx={{
            display: roomJoined ? "flex" : "none",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 2,
          }}
        >
          <Typography variant="h4">Main Room</Typography>
          <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
            <IconButton aria-label="mute toggle" onClick={toggleMute}>
              {isMuted ? <MicOffIcon /> : <MicIcon />}
            </IconButton>
            <IconButton aria-label="leave room" onClick={leaveRoom}>
              <LeaveIcon />
            </IconButton>
          </Box>
        </Box>
        <List>
          {members.map((member) => (
            <ListItem key={member.uid}>
              <ListItemText primary={`User: ${member.uid}`} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default AgoraVoiceChat;
