import React, {
  useEffect,
  useState,
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
} from "react";
import {
  Box,
  TextField,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  List,
  ListItemText,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import { useUser } from "../../context/UserContext";
import io, { Socket } from "socket.io-client";
import { Message } from "./messagetypes";

interface FooterProps {
  userDetails: any;
  setMessageList: React.Dispatch<React.SetStateAction<Message[]>>;
}

const socket: Socket = io(process.env.REACT_APP_SOCKET_URL);

const Footer: React.FC<FooterProps> = ({ userDetails, setMessageList }) => {
  console.log(process.env.REACT_APP_SOCKET_URL);
  const [currentMessage, setcurrentMessage] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [showFileList, setShowFileList] = useState(false);
  const { user } = useUser();

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setShowFileList(!showFileList);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
      setShowFileList(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const sendMessage = async () => {
    const currentTime = new Date().toISOString();
    let fileData;

    if (selectedFile) {
      const base64File = await fileToBase64(selectedFile);
      const fileBlob = base64File.split(",")[1];

      fileData = {
        fileBlob,
        filename: selectedFile.name,
        filetype: selectedFile.type,
        filesize: selectedFile.size,
      };

      setSelectedFile(null);
      setFilePreview(null);
    }

    console.log("userDetails userid", user?.userdata?.UserID);

    const messageData: Message = {
      author: user?.userdata?.UserName || "Unknown",
      receiverID: userDetails.UserID ? userDetails.UserID : undefined,
      groupID: userDetails.GroupID ? userDetails.GroupID : undefined,
      SenderID: user?.userdata?.UserID ? user?.userdata?.UserID : undefined,
      Content: currentMessage ? currentMessage : selectedFile.name,
      SentAt: currentTime,
      IsDeleted: false,
      IsPinned: false,
      isGroupChat: userDetails.GroupID ? true : false,
      fileData: fileData,
      file: undefined,
    };

    if (currentMessage || selectedFile) {
      socket.emit("send_message", messageData);
      console.log("messageData", messageData);

      // Update the messageList state immediately after sending the message
      // setMessageList((prevList) => {
      //   // console.log("Previous List:", prevList);
      //   const updatedList = [...prevList, messageData];
      //   // console.log("Updated List:", updatedList);
      //   return updatedList;
      // });

      setcurrentMessage(""); // Clear the input after sending
    }
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server:", socket.id);
    });
    socket.on("disconnect", async () => {
      console.log("Connected to server:", socket.id);
    });

    const handleMessageReceive = (data) => {
      console.log("Message received on client:", data);
      setMessageList((list) => [...list, data]);
    };
    socket.on("receive_message", handleMessageReceive);
    return () => {
      socket.off("receive_message", handleMessageReceive);
    };
  }, [userDetails.UserID]);

  return (
    <Container sx={{ mt: "auto" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "left",
          p: 2,
          borderTop: 1,
          borderColor: "divider",
          position: "fixed",
          width: "70%",
          bottom: "20px",
          // marginBottom: "20px",
        }}
      >
        <Box sx={{ position: "relative", flexGrow: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            value={currentMessage}
            placeholder="Type a message.."
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setcurrentMessage(event.target.value);
            }}
            onKeyPress={(event: KeyboardEvent<HTMLInputElement>) => {
              if (event.key === "Enter") {
                sendMessage();
              }
            }}
            InputProps={{
              endAdornment: selectedFile ? (
                <Tooltip title="Remove file">
                  <IconButton
                    edge="end"
                    onClick={() => {
                      setSelectedFile(null);
                      setFilePreview(null);
                    }}
                    sx={{ p: 0.5 }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              ) : null,
              sx: {
                borderRadius: "8px",
                height: "85px",
              },
            }}
          />
          {filePreview && (
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "10px",
                transform: "translateY(-50%)",
                display: "flex",
                alignItems: "center",
                pointerEvents: "none", // Allows clicks to pass through the preview
              }}
            >
              <img
                src={filePreview}
                alt="File Preview"
                style={{
                  maxWidth: "100px",
                  maxHeight: "50px",
                  borderRadius: "4px",
                  marginRight: "10px",
                }}
              />
            </Box>
          )}
        </Box>
        <IconButton
          onClick={sendMessage}
          style={{ marginLeft: "5px", color: "black" }}
        >
          <SendIcon />
        </IconButton>
        {/* <IconButton onClick={handleClick}>
          <AttachFileIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem>
            <input
              type="file"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="upload-file"
            />
            <label htmlFor="upload-file">
              <Button component="span" variant="outlined" color="primary">
                Select File
              </Button>
            </label>
          </MenuItem>
          <MenuItem>
            <Button variant="outlined" color="primary">
              Attach Cloud Files
            </Button>
          </MenuItem>
        </Menu> */}

        <Box>
          <IconButton onClick={handleClick} sx={{ color: "black" }}>
            <AttachFileIcon />
          </IconButton>

          {showFileList && (
            <List
              sx={{
                width: "250px",
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
                padding: "10px",
                position: "absolute",
                bottom: "50px",
                right: "20px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
            >
              <label htmlFor="upload-file">
                <ListItemText
                  primary="Select File"
                  sx={{
                    "&:hover": {
                      backgroundColor: "#f0f0f0",
                      cursor: "pointer",
                    },
                  }}
                />
                <input
                  type="file"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  id="upload-file"
                />
              </label>
            </List>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default Footer;
