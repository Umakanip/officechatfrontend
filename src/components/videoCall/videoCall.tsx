// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import AgoraRTC, {
//   IAgoraRTCClient,
//   IMicrophoneAudioTrack,
//   ICameraVideoTrack,
//   IRemoteUser,
// } from "agora-rtc-sdk-ng";
// import "./main.css";

// const APP_ID = "1369151da2df4f33bdd842b8c0797085";
// const TOKEN =
//   "007eJxTYBDVPODz9pbh9/THJl9C/JTe5F10bldtVj72aFPUiYtGH24qMFimpaaaWpoYGZkbpplYphknJRlZWJonp1kmmiWZpppYvKo4mtYQyMhw6vR/JkYGCATxWRh8EzPzGBgABOEi7g==";
// const CHANNEL = "Main";

// const VideoChat: React.FC = () => {
//   const navigate = useNavigate();
//   const [client] = useState<IAgoraRTCClient>(
//     AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
//   );
//   const [localTracks, setLocalTracks] = useState<
//     [IMicrophoneAudioTrack, ICameraVideoTrack] | []
//   >([]);
//   const [remoteUsers, setRemoteUsers] = useState<IRemoteUser[]>([]);
//   const [isStreamActive, setStreamActive] = useState(false);

//   useEffect(() => {
//     // Join call on component mount
//     setStreamActive(true);
//   }, []);

//   useEffect(() => {
//     if (isStreamActive) {
//       joinAndDisplayLocalStream();
//     }

//     client.on("user-published", handleUserJoined);
//     client.on("user-left", handleUserLeft);

//     return () => {
//       client.off("user-published", handleUserJoined);
//       client.off("user-left", handleUserLeft);
//     };
//   }, [isStreamActive]);

//   const joinAndDisplayLocalStream = async () => {
//     const UID = await client.join(APP_ID, CHANNEL, TOKEN, null);

//     const tracks = await AgoraRTC.createMicrophoneAndCameraTracks();
//     setLocalTracks(tracks);

//     const player = `<div class="video-container" id="user-container-${UID}">
//                         <div class="video-player" id="user-${UID}"></div>
//                     </div>`;
//     document
//       .getElementById("video-streams")
//       ?.insertAdjacentHTML("beforeend", player);

//     tracks[1].play(`user-${UID}`);
//     await client.publish(tracks);
//   };

//   const handleLeaveCall = async () => {
//     setStreamActive(false);

//     localTracks.forEach((track) => {
//       track.stop();
//       track.close();
//     });

//     await client.leave();
//     setLocalTracks([]);
//     setRemoteUsers([]);

//     const videoStreamsElement = document.getElementById("video-streams");
//     if (videoStreamsElement) {
//       videoStreamsElement.innerHTML = ""; // or use innerText if that's appropriate
//     } else {
//       console.error('Element with ID "video-streams" not found');
//     }

//     // Redirect to /chatpage
//     navigate("/chatpage");
//   };

//   const handleUserJoined = async (
//     user: IRemoteUser,
//     mediaType: "audio" | "video"
//   ) => {
//     await client.subscribe(user, mediaType);

//     if (mediaType === "video") {
//       const player = document.getElementById(`user-container-${user.uid}`);
//       if (player) {
//         player.remove();
//       }

//       const newPlayer = `<div class="video-container" id="user-container-${user.uid}">
//                             <div class="video-player" id="user-${user.uid}"></div>
//                         </div>`;
//       document
//         .getElementById("video-streams")
//         ?.insertAdjacentHTML("beforeend", newPlayer);

//       user.videoTrack?.play(`user-${user.uid}`);
//     }

//     if (mediaType === "audio") {
//       user.audioTrack?.play();
//     }

//     setRemoteUsers((prevUsers) => [...prevUsers, user]);
//   };

//   const handleUserLeft = (user: IRemoteUser) => {
//     setRemoteUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
//     document.getElementById(`user-container-${user.uid}`)?.remove();
//   };

//   const toggleMic = async (
//     event: React.MouseEvent<HTMLButtonElement, MouseEvent>
//   ) => {
//     const button = event.currentTarget;

//     // Check if button is not null
//     if (!button) return;

//     if (localTracks[0]?.muted) {
//       await localTracks[0].setMuted(false);
//       button.innerHTML = "Mic on";
//       button.style.backgroundColor = "#1976d2";
//     } else {
//       await localTracks[0].setMuted(true);
//       button.innerHTML = "Mic off";
//       button.style.backgroundColor = "#EE4B2B";
//     }
//   };

//   const toggleCamera = async (
//     event: React.MouseEvent<HTMLButtonElement, MouseEvent>
//   ) => {
//     const button = event.currentTarget;

//     // Check if button is not null
//     if (!button) return;

//     if (localTracks[1]?.muted) {
//       await localTracks[1].setMuted(false);
//       button.innerHTML = "Camera on";
//       button.style.backgroundColor = "#1976d2";
//     } else {
//       await localTracks[1].setMuted(true);
//       button.innerHTML = "Camera off";
//       button.style.backgroundColor = "#EE4B2B";
//     }
//   };

//   return (
//     <div>
//       {isStreamActive && (
//         <div id="stream-wrapper">
//           <div id="video-streams"></div>
//           <div
//             id="stream-controls"
//             style={{
//               display: "flex",
//               justifyContent: "center",
//               marginTop: "0.5em",
//             }}
//           >
//             <button id="leave-btn" onClick={handleLeaveCall}>
//               Leave Call
//             </button>
//             <button id="mic-btn" onClick={toggleMic}>
//               Mic On
//             </button>
//             <button id="camera-btn" onClick={toggleCamera}>
//               Camera on
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default VideoChat;
