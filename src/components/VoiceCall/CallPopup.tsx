
import React from "react";
import {
  Dialog,
  DialogActions,
  DialogTitle,
  Button,
  Typography,
  Avatar,
} from "@mui/material";
import CallIcon from "@mui/icons-material/Call";
import { User } from "../chatpage/ChatWindow/messagetypes";


interface CallPopupProps {
  incomingCall?: string;
  caller?: User; 
  onAccept: () => Promise<void>;
  onReject: () => void;
}

const CallPopup: React.FC<CallPopupProps> = ({
  incomingCall,
  caller,
  onAccept,
  onReject,
}) => {
  console.log("caller", caller);
  const callerDisplay = caller?.Username || "Unknown";

  return (
    <Dialog open={!!incomingCall} onClose={onReject}>
      <DialogTitle>Incoming Call</DialogTitle>
      <div style={{ textAlign: "center", padding: "20px" }}>
        <Avatar src={caller?.ProfilePicture} alt={callerDisplay} />
        <Typography variant="h6">{callerDisplay}</Typography>
        <Typography variant="body1">is calling you</Typography>
      </div>
      <DialogActions>
        <Button onClick={onReject} color="error">
          <CallIcon /> Reject
        </Button>
        <Button onClick={onAccept} color="primary">
          <CallIcon /> Accept
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CallPopup;
