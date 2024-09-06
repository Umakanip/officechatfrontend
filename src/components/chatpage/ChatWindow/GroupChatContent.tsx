import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Container,
} from "@mui/material";
import { Message } from "./messagetypes";

interface GroupChatContentProps {
  userDetails: any;
  messageList: Message[];
}

const GroupChatContent: React.FC<GroupChatContentProps> = ({
  userDetails,
  messageList,
}) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  console.log("groupmessageList", messageList);
  return (
    <Container
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        overflow: "auto",
      }}
    >
      <Box sx={{ flex: 1 }}>
        {messageList && messageList.length > 0 ? (
          <List>
            {messageList.map((messageContent, index) => {
              const isSender = userDetails.Username === messageContent.author;
              return (
                <ListItem
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: isSender ? "flex-end" : "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: "60%",
                      padding: "0.75rem",
                      borderRadius: "10px",
                      backgroundColor: isSender ? "#e1ffc7" : "#f1f0f0",
                      boxShadow: 2,
                      alignSelf: isSender ? "flex-end" : "flex-start",
                    }}
                  >
                    <ListItemText
                      primary={messageContent.Content}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {messageContent.author}
                          </Typography>
                          {formatTime(messageContent.SentAt)}
                        </>
                      }
                    />
                  </Box>
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Typography> There is no messages.</Typography>
        )}
      </Box>
    </Container>
  );
};

export default GroupChatContent;
