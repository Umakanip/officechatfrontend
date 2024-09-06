import axios from "axios";
import React, { MouseEvent, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import InputBase from "@mui/material/InputBase";
import { styled, alpha } from "@mui/material/styles";
import {
  Box,
  IconButton,
  Popover,
  Typography,
  Avatar,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Stack,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";

import SearchIcon from "@mui/icons-material/Search";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import CloseIcon from "@mui/icons-material/Close";
import { User } from "./messagetypes";
import GroupIcon from "@mui/icons-material/Group";
import VideocamIcon from "@mui/icons-material/Videocam";
import { useUser } from "../../context/UserContext";
import io from "socket.io-client";
import Suggestions from "../Header/Suggestions";
import AgoraClient from "../../VoiceCall/AgoraClient";
import { AgoraRTCProvider } from "agora-rtc-react";
import CallIcon from "@mui/icons-material/Call";
import CallPopup from "../../VoiceCall/CallPopup";
import ActionModal from "./ActionModal";
import AgoraRTC, { IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";
// import { IconButton } from '@mui/material';
import CallEndIcon from "@mui/icons-material/CallEnd";

const socket = io(process.env.REACT_APP_SOCKET_URL);
const rtcClient: any = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

interface HeaderProps {
  selectedUser: User;
  onGroupCreate;
  Title: string | null;
}

const Search = styled("div")(({ theme }) => ({
  position: "relative",

  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

const Header: React.FC<HeaderProps> = ({ selectedUser, onGroupCreate }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  // State for child popover
  const [childAnchorEl, setChildAnchorEl] = useState<null | HTMLElement>(null);
  // State for email input in child popover
  const [username, setUsername] = useState<string>("");
  const [query, setQuery] = useState<any>("");
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [selectedUserIDs, setSelectedUserIDs] = useState<number[]>([]);
  const [, setGroupDetails] = useState<any>("");
  const [groupMembers, setGroupMembers] = useState<User[]>([]);
  const [hoveredUserId, setHoveredUserId] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [secondary] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    description: "",
    actionText: "",
    onConfirm: () => {},
  });

  const {
    setGroups,
    setActiveGroup,
    setActiveUser,
    setselectActiveUser,
    user,
    headerTitle,
    setHeaderTitle,
  } = useUser();
  const [channelName, setChannelName] = useState<string>("");
  const [token, setToken] = useState<string>("");
  // const [searchSuggestions, setSearchSuggestions] = useState<User[]>([]);
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const [incomingCall, setIncomingCall] = useState<string | null>(null);
  const [callAccepted, setCallAccepted] = useState<boolean>(false);
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const [, setIsCallPopupVisible] = useState(false);
  const [callDuration, setCallDuration] = useState<number>(0); // Call duration in seconds
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [, setCallData] = useState<{
    CallerID: number;
    ReceiverID: number | undefined;
    StartTime: Date;
    EndTime: Date | null;
    CallType: string;
    ScreenShared: boolean;
  } | null>(null);

  const [showCallPopup, setShowCallPopup] = useState(false);

  var callerdetail;

  useEffect(() => {
    socket.emit("register", user?.userdata?.UserID);

    socket.on(
      "incomingCall",
      async (data: {
        channelName: string;
        token: string;
        callerId: string;
      }) => {
        setChannelName(data.channelName);
        setToken(data.token);
        setIncomingCall(data.callerId);

        console.log("Incoming call data", data);
      }
    );

    socket.on("callAccepted", ({ channelName, callerId }) => {
      console.log(`Call accepted by ${callerId}`);
      setChannelName(channelName);
      setToken(token);
    });

    socket.on("callRejected", ({ callerId }) => {
      console.log(`Call rejected by ${callerId}`);
      setIncomingCall(null);
      setChannelName("");
      setToken("");
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current = null;
      }
    });

    if (incomingCall) {
      setShowCallPopup(true);
    }

    return () => {
      socket.off("incomingCall");
      socket.off("callAccepted");
      socket.off("callRejected");
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [token, user, incomingCall]);

  const startCallTimer = () => {
    setCallDuration(0); // Reset the timer
    callTimerRef.current = setInterval(() => {
      setCallDuration((prevDuration) => prevDuration + 1);
    }, 1000);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  const startCall = async () => {
    if (!selectedUser) return; // Handle case where selectedUser might be null

    const generatedChannelName = "testChannel";
    const callerId = user?.userdata?.UserID;
    const receiverId = selectedUser?.UserID;

    console.log("Starting call with:", {
      channelName: generatedChannelName,
      callerId,
      receiverIds: [receiverId],
    });

    socket.emit("callUsers", {
      channelName: generatedChannelName,
      callerId,
      receiverIds: [receiverId],
    });

    try {
      const callData = {
        CallerID: user?.userdata?.UserID as number,
        ReceiverID: selectedUser?.UserID,
        StartTime: new Date(),
        EndTime: null,
        CallType: "audio",
        ScreenShared: false,
      };

      setCallData(callData);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/postCall`,
        callData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Call data stored successfully:", response.data);
    } catch (error) {
      console.error("Error storing call data:", error);
    }
  };

  const handleCallAccepted = async () => {
    startCallTimer();
    try {
      setCallAccepted(true);
      setIsCallPopupVisible(false);
      setShowCallPopup(false);
      socket.emit("callAccepted", { channelName, callerId: incomingCall });

      // Start the local audio track
      const localAudioTrack: IMicrophoneAudioTrack =
        await rtcClient.createMicrophoneAudioTrack();
      localAudioTrackRef.current = localAudioTrack;
      await rtcClient.publish([localAudioTrack]);
    } catch (error) {
      console.error("Error accepting the call:", error);
    }
  };

  const rejectCall = () => {
    if (incomingCall) {
      console.log("Call rejected");
      // alert("call end");
      socket.emit("callRejected", { channelName, callerId: incomingCall });
      setIncomingCall(null);
      setChannelName("");
      setToken("");
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current = null;
      }
    }
  };

  const handlePopoverOpen = async (event: MouseEvent<HTMLElement>) => {
    console.log("currenttarget", selectedUser?.GroupID);
    setAnchorEl(event.currentTarget);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/groupmembers/${selectedUser?.GroupID}`
      );
      setGroupMembers(response.data);
    } catch (error) {
      console.error("Error fetching group members:", error);
    }
  };

  const navigate = useNavigate();

  const handleVideoClick = () => {
    navigate("/video-call");
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  // Handle child popover
  const handleChildClick = (event: React.MouseEvent<HTMLElement>) => {
    setChildAnchorEl(event.currentTarget);
  };

  const handleChildClose = () => {
    setChildAnchorEl(null);
  };

  // Handle username change
  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  // Handle Add button click
  const handleAddClick = async () => {
    // Logic for adding the Username (e.g., sending to the backend)
    console.log("Username added:", username);
    handleChildClose(); // Close the child popover

    const { GroupID } = selectedUser;
    const namesArray =
      query &&
      query
        ?.split(",")
        .map((name) => name.trim())
        .filter((name) => name.length > 0);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/addUsers?`,
        {
          // Email: groupEmail,
          GroupID: GroupID,
          Usernames: namesArray || null,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // const updatedGroup = response.data.group;
      // setGroupDetails(updatedGroup); // Update with new group details
      // setActiveGroup(updatedGroup.GroupID); // Ensure active group is updated
      // setActiveUser(null);
      // console.log(updatedGroup);
      // // setGroupDetails(response.data.group);

      // // Update local state to remove the deleted user
      // setGroupMembers((prevMembers) => [
      //   ...prevMembers,
      //   updatedGroup.GroupName,
      // ]);
      // console.log(groupMembers);
      // setHeaderTitle(headerTitle + "," + namesArray.join(", "));

      const updatedGroup = response.data.group;
      const newMemberName = namesArray.join(", "); // Assuming namesArray contains the new user names
      console.log(newMemberName);
      // Step 1: Update group details with the new user (group name should reflect all members)
      setGroupDetails((prevDetails) => ({
        ...prevDetails,
        GroupName: prevDetails?.GroupName + ", " + newMemberName, // Update group name with new members
      }));
      setGroups((prevGroup) => ({
        ...prevGroup,
        GroupName: updatedGroup.GroupName, // Only update the group name
      }));
      setActiveGroup(updatedGroup.GroupID);
      setActiveUser(null); // Clear the active user if necessary

      // Step 3: Update the group members state by adding new members
      setGroupMembers((prevMembers) => [...prevMembers, newMemberName]);

      // Step 4: Update the header title by appending the new user's name
      setHeaderTitle(headerTitle + ", " + newMemberName); // Add new member to the header title

      console.log("Updated Group Details:", updatedGroup);
      console.log("Updated Group Members:", groupMembers);
    } catch (error: any) {
      console.error("Error sending data:", error);
    }
  };

  const fetchSuggestions = async (searchQuery) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/usernamesugggestions`,
        {
          params: { query: searchQuery },
        }
      );
      console.log("resssssssssssss", response.data);
      setSuggestions(response.data);
      setSuggestionsVisible(true);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleEmailChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log("event.target.value", event.target.value);
    const value = event.target.value;
    setQuery(value); // Update the query state
    if (value) {
      fetchSuggestions(value); // Fetch suggestions if there's input
    } else {
      setSuggestions([]);
      setSuggestionsVisible(false);
    }
  };

  const handleCreateGroup = async () => {
    console.log("Selected User IDs:", selectedUserIDs);
    console.log("Logged-in User ID:", (selectedUser as User).UserID);

    const loggedInUserId = user?.userdata?.UserID || null;

    const namesArray =
      query &&
      query
        ?.split(",")
        .map((name) => name.trim())
        .filter((name) => name.length > 0);
    const groupname = [(selectedUser as User).Username, ...namesArray].join(
      ", "
    );

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/creategroup`,
        {
          GroupName: groupname,
          Username: [(selectedUser as User).Username, ...namesArray],
          CreatedBy: loggedInUserId,
          CreatedAt: new Date(),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Response", response.data);
      setGroupDetails(response.data);
      const newGroup = response.data;

      setGroups((prevGroups) => [newGroup, ...prevGroups]);
      setActiveGroup(response.data.GroupID);
      setActiveUser(null);
      setselectActiveUser(null);
      onGroupCreate(newGroup); // Pass the new group information
      setQuery(""); // Clear the input

      handlePopoverClose(); // Close the popover after action
    } catch (error: any) {
      console.error("Error sending data:", error);
    }
  };

  const handleSelectUser = (username) => {
    console.log("username", username);
    setQuery(username.Username);
    setSelectedUserIDs(username);
    setSuggestions([]);
    setSuggestionsVisible(false);
  };

  const endCall = () => {
    if (incomingCall) {
      console.log("Call rejected");
      // alert("call end");
      socket.emit("callRejected", { channelName, callerId: incomingCall });
      setIncomingCall(null);
      setChannelName("");
      setToken("");
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current = null;
      }
    }
  };

  const open = Boolean(anchorEl);
  const openChild = Boolean(childAnchorEl);

  const id = open ? "simple-popover" : undefined;

  const handleDelete = async (userId: number, groupId: number) => {
    try {
      // Make API call to delete user from the group
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/groups/${groupId}/members/${userId}`
      );

      // Update local state to remove the deleted user
      setGroupMembers((prevMembers) =>
        prevMembers.filter((member) => member.UserID !== userId)
      );
      setOpenModal(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      // Handle the error, e.g., show a notification
    }
  };

  const handleOpenModal = (
    actionType: "delete" | "leave",
    userId: number,
    groupId: number
  ) => {
    const isDeleteAction = actionType === "delete";
    setModalContent({
      title: isDeleteAction ? "Remove User" : "Leave Group",
      description: isDeleteAction
        ? "Are you sure you want to remove this user from the group?"
        : "Are you sure you want to leave this group?",
      actionText: isDeleteAction ? "Remove" : "Leave",
      onConfirm: () => handleDelete(userId, groupId),
    });
    setOpenModal(true);
  };

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        {selectedUser ? (
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: "#dbd5d1",
                p: 3,
                height: 65,
                marginTop: "60px",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  alt={
                    selectedUser.UserID
                      ? selectedUser.Username
                      : selectedUser.GroupName
                  }
                  src={selectedUser.ProfilePicture || undefined}
                  sx={{ mr: 2 }}
                />
                <Typography variant="h6" color="black">
                  {headerTitle
                    ? headerTitle
                    : selectedUser.UserID
                    ? selectedUser.Username
                    : selectedUser.GroupName}
                </Typography>
              </Box>

              <AgoraRTCProvider client={rtcClient}>
                <div>
                  <IconButton onClick={startCall}>
                    <CallIcon />
                  </IconButton>

                  {showCallPopup && (
                    <CallPopup
                      incomingCall={incomingCall!}
                      caller={callerdetail}
                      onAccept={handleCallAccepted}
                      onReject={rejectCall}
                    />
                  )}

                  {callAccepted && channelName && token && (
                    <div>
                      <AgoraClient channelName={channelName} token={token} />

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 3, // You can adjust the gap value as needed
                        }}
                      >
                        <div>Call Duration: {formatTime(callDuration)}</div>
                        <IconButton
                          onClick={() => endCall()} // Your function to end the call
                          style={{
                            backgroundColor: "red",
                            color: "white",
                            marginBottom: "20px",
                          }}
                        >
                          <CallEndIcon />
                        </IconButton>
                      </Box>
                    </div>
                  )}
                </div>
              </AgoraRTCProvider>

              <IconButton
                sx={{ marginLeft: "auto", color: "#1976d2" }}
                onClick={handleVideoClick}
              >
                <VideocamIcon sx={{ fontSize: 30, color: "black" }} />
              </IconButton>

              <IconButton sx={{ color: "black" }} onClick={handlePopoverOpen}>
                <GroupIcon />
              </IconButton>
            </Box>

            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handlePopoverClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              sx={{ p: 2 }}
            >
              {selectedUser.UserID ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    padding: 2,
                    position: "relative", // This ensures that suggestions are positioned relative to the box
                  }}
                >
                  <TextField
                    label="Enter Username"
                    type="email"
                    value={query}
                    onChange={handleEmailChange}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                  {suggestionsVisible && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: "100%", // Position the suggestions below the TextField
                        left: 0,
                        right: 0,
                        zIndex: 1,
                        backgroundColor: "white", // Ensure it's visible
                        boxShadow: 3,
                        borderRadius: 1,
                      }}
                    >
                      <Suggestions
                        suggestions={suggestions}
                        onSelect={handleSelectUser}
                      />
                    </Box>
                  )}
                  <Button variant="contained" onClick={handleCreateGroup}>
                    Create Group
                  </Button>
                </Box>
              ) : (
                <Box sx={{ padding: 2 }}>
                  <Typography>People({groupMembers.length})</Typography>

                  <List style={{ width: "250px" }}>
                    {groupMembers.map((member) => (
                      <ListItem
                        key={member.UserID}
                        sx={{
                          "&:hover": {
                            backgroundColor: "#f0f0f0", // Change to your desired hover color
                            cursor: "pointer",
                          },
                        }}
                        onMouseEnter={() => setHoveredUserId(member.UserID)}
                        onMouseLeave={() => setHoveredUserId(null)}
                      >
                        <ListItemAvatar>
                          <Avatar>
                            <FolderIcon />
                          </Avatar>
                        </ListItemAvatar>
                        {/* <ListItemIcon>
                          <FolderIcon />
                        </ListItemIcon> */}
                        <ListItemText
                          primary={member.Username} // Ensure this matches the correct property name in your data
                          secondary={
                            member.UserID === user?.userdata?.UserID
                              ? "You"
                              : null
                          }
                        />{" "}
                        {hoveredUserId === member.UserID &&
                          member.UserID !== user?.userdata?.UserID && (
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() =>
                                handleOpenModal(
                                  "delete",
                                  member.UserID,
                                  member.GroupID
                                )
                              }
                              // onClick={() =>
                              //   handleDelete(member.UserID, member.GroupID)
                              // } // Add your delete logic here
                              size="small"
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          )}
                      </ListItem>
                    ))}
                    <hr></hr>
                    <ListItem
                      sx={{
                        "&:hover": {
                          backgroundColor: "#f0f0f0", // Change to your desired hover color
                          cursor: "pointer",
                        },
                      }}
                      onClick={handleChildClick}
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <GroupAddIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Add People" // Ensure this matches the correct property name in your data
                        secondary={secondary ? "Secondary text" : null}
                      />
                    </ListItem>

                    <ListItem
                      sx={{
                        "&:hover": {
                          backgroundColor: "#f0f0f0", // Change to your desired hover color
                          cursor: "pointer",
                        },
                      }}
                      onClick={() =>
                        handleOpenModal(
                          "leave",
                          user?.userdata?.UserID,
                          selectedUser.GroupID
                        )
                      }

                      // onClick={() =>
                      //   handleDelete(
                      //     user?.userdata?.UserID,
                      //     selectedUser.GroupID
                      //   )
                      // }
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <PersonAddAltIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Leave" // Ensure this matches the correct property name in your data
                        secondary={secondary ? "Secondary text" : null}
                      />
                    </ListItem>
                  </List>

                  {/* Reusable Modal */}
                  <ActionModal
                    open={openModal}
                    handleClose={() => setOpenModal(false)}
                    title={modalContent.title}
                    description={modalContent.description}
                    actionText={modalContent.actionText}
                    onConfirm={modalContent.onConfirm}
                  />

                  {/* </Demo> */}
                </Box>
              )}
            </Popover>

            {/* Child Popover */}
            <Popover
              open={openChild}
              anchorEl={childAnchorEl}
              onClose={handleChildClose}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <Box sx={{ p: 2, width: 300 }}>
                <Typography variant="h6" gutterBottom>
                  Add Username
                </Typography>
                {/* <TextField
                  fullWidth
                  label="Username"
                  type="text"
                  value={query}
                  onChange={handleEmailChange}
                />
                {suggestionsVisible && (
                  <Suggestions
                    suggestions={suggestions}
                    onSelect={handleSelectUser}
                  />
                )} */}

                <Search>
                  <SearchIconWrapper>
                    <SearchIcon />
                  </SearchIconWrapper>
                  <StyledInputBase
                    placeholder="Search…"
                    inputProps={{ "aria-label": "search" }}
                    onChange={handleEmailChange}
                    value={query}
                  />
                  {suggestionsVisible && (
                    <Suggestions
                      suggestions={suggestions}
                      onSelect={handleSelectUser}
                    />
                  )}
                </Search>

                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="flex-end"
                  sx={{ mt: 2 }}
                >
                  <Button variant="outlined" onClick={handleChildClose}>
                    Cancel
                  </Button>
                  <Button variant="contained" onClick={handleAddClick}>
                    Add
                  </Button>
                </Stack>
              </Box>
            </Popover>
          </Box>
        ) : (
          <Typography variant="h5" sx={{ p: 2, mt: 20 }}></Typography>
        )}
      </Box>
    </>
  );
};

export default Header;
