import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  Avatar,
  Box,
} from "@mui/material";
import { useUser } from "../../context/UserContext";
import io from "socket.io-client";

interface Contact {
  id: number;
  name: string;
  image: string;
  isActive: boolean;
  UserID: number;
  Username: string;
  ProfilePicture: string; // Ensure this matches User's property type
}

interface ContactListProps {
  onSelectUser: (user: Contact) => void;
}

const socket = io(process.env.REACT_APP_SOCKET_URL);
console.log(socket);

const ContactList: React.FC<ContactListProps> = ({ onSelectUser }: any) => {
  // const [Group, setGroup] = useState();
  const { user, groups, setGroups } = useUser();
  const [, setError] = useState<string | null>(null);
  const [loggedInUsers, setLoggedInUsers] = useState<any[]>([]);
  // const [activeGroup, setActiveGroup] = useState<number | null>(null);
  const {
    activeGroup,
    setActiveGroup,
    activeUser,
    setActiveUser,
    // selectedUserId,
    setSelectedUserId,
    Contact,
    setContact,
  } = useUser();

  useEffect(() => {
    console.log("groupsgroups", groups);
    // if (selectedUserId) {
    axios
      .get(
        `${process.env.REACT_APP_API_URL}/api/users/${user?.userdata?.UserID}`
      )
      .then((response) => {
        const users = response.data;
        console.log("contact", users);

        setContact(response.data);
        if (response.data.length > 0) {
          // Automatically select the first user
          const firstUser = response.data[0];
          setActiveUser(firstUser.UserID);

          //     // Any other logic that should be memoized
          setSelectedUserId(firstUser.UserID); // Set first user as active
          onSelectUser(firstUser); // Pass the first user to parent component
        }
      })
      .catch((error) => {
        setError(error.message);
      });
    // }
  }, [user?.userdata?.UserID, setContact]);

  // }, [user?.userdata?.UserID, setContact, onSelectUser, handleSetActiveUser]);
  // for groups

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/grouplist`)
      .then((response) => {
        // console.log("Goruplist", response.data);
        setGroups(response.data);
      })
      .catch((error) => {
        setError(error.message);
      });

    return () => {
      socket.off("userStatusUpdate");
    };
  }, [setGroups]);

  useEffect(() => {
    if (user) {
      const interval = setInterval(async () => {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/getActiveUser`
        );

        setLoggedInUsers(response.data);
      }, 5000); // Send every 5 seconds

      return () => clearInterval(interval); // Clean up on unmount
    }
  }, [
    setLoggedInUsers,
    // user?.userdata?.UserID,
  ]);
  useEffect(() => {
    // console.log(loggedInUsers);
    const updatedArray = Contact.map((item) => ({
      ...item,
      isActive: loggedInUsers.includes(item.UserID) ? true : false,
    }));
    if (JSON.stringify(updatedArray) !== JSON.stringify(Contact)) {
      setContact(updatedArray);
    }
  }, [loggedInUsers, Contact, setContact]);

  const handleContactClick = (userid: number) => {
    console.log(userid);
    setSelectedUserId(userid);
    setActiveUser(userid); // Set active contact
    setActiveGroup(null);
  };
  const handlegroupActive = (groupid: any) => {
    setActiveGroup(groupid);
    setActiveUser(null);
    onSelectUser(groupid);
  };
  return (
    <Box
      sx={{
        width: "400px",
        bgcolor: "#dbd5d1",
        display: "flex",
        flexDirection: "column",
        border: "1px solid #bdbdbd",
        marginTop: "60px",
      }}
    >
      {" "}
      {/* Ensure full height */}
      <Typography
        variant="h6"
        sx={{
          p: 2,
          bgcolor: "#ebebeb40",
          color: "black",
          borderBottom: "2px solid #80808021",
          fontWeight: "bold",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen','Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
        }}
      >
        Chat
      </Typography>
      {Contact && Contact.length > 0 ? (
        <List
          sx={{
            flexGrow: 1,
            overflow: "auto",
            height: "250px",
            "&::-webkit-scrollbar": {
              width: "0",
              transition: "width 0.3s ease",
            },
            "&:hover::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#888",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "#555",
            },
          }}
        >
          {" "}
          {/* Allow list to scroll */}
          {Contact.map((item) => {
            // const Status = userStatus.find(
            //   (Status: any) => Status.UserID === item.UserID
            // );

            return (
              <ListItem
                button
                key={item.UserID}
                onClick={() => {
                  onSelectUser(item);
                  handleContactClick(item.UserID);
                }}
                sx={{
                  bgcolor: activeUser === item.UserID ? "#999da259" : "inherit", // Change background for active group
                }}
              >
                <ListItemAvatar>
                  <Box sx={{ position: "relative" }}>
                    <Avatar
                      alt={item.Username}
                      src={item.ProfilePicture}
                      sx={{
                        width: 45,
                        height: 45,
                        borderRadius: "50%",
                        // border: item.Status ? "2px solid #4caf50" : "none",
                        position: "relative",
                      }}
                    />
                    {item.isActive && (
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          right: 7,
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          bgcolor: "#4caf50",
                          border: "2px solid white",
                        }}
                      />
                    )}
                  </Box>
                </ListItemAvatar>
                <ListItemText
                  primary={item.Username}
                  secondary={
                    <Typography variant="body2" color="textSecondary">
                      Click here to chat
                    </Typography>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      ) : (
        <List sx={{ flexGrow: 1, height: "327px", overflow: "auto" }}>
          <Typography
            variant="body2"
            color="textSecondary"
            style={{ fontStyle: "Italic", textAlign: "center" }}
          >
            Search a New User
          </Typography>
        </List>
      )}
      <Typography
        variant="h6"
        sx={{
          p: 2,
          bgcolor: "#ebebeb40",
          color: "black",
          borderBottom: "2px solid #80808021",
          fontWeight: "bold",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen','Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
        }}
      >
        Groups
      </Typography>
      {groups && groups.length > 0 ? (
        <List
          sx={{
            flexGrow: 1,
            overflow: "auto",
            height: "250px",
            "&::-webkit-scrollbar": {
              width: "0",
              transition: "width 0.3s ease",
            },
            "&:hover::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#888",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "#555",
            },
          }}
        >
          {" "}
          {/* Allow list to scroll */}
          {groups.map((item: any) => (
            <ListItem
              button
              key={item.GroupID}
              onClick={() => {
                onSelectUser(item);
                handlegroupActive(item.GroupID);
              }}
              sx={{
                backgroundColor:
                  activeGroup === item.GroupID
                    ? "#999da259" // Change background color for active group (with slight transparency)
                    : "inherit", // No change for non-active group // Change background for active group
              }}
            >
              <ListItemAvatar>
                <Avatar alt={item.GroupName} />
              </ListItemAvatar>
              <ListItemText
                primary={item.GroupName}
                secondary={
                  <Typography variant="body2" color="textSecondary">
                    Some Text to write
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <List sx={{ flexGrow: 1, height: "327px", overflow: "auto" }}>
          <Typography
            variant="body2"
            color="textSecondary"
            style={{ fontStyle: "Italic", textAlign: "center" }}
          >
            Create a New group
          </Typography>
        </List>
      )}
    </Box>
  );
};

export default ContactList;
