import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";

const ActionModal = ({
  open,
  handleClose,
  title,
  description,
  actionText,
  onConfirm,
}) => {
  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 300,
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h6" component="h2">
          {title}
        </Typography>
        <Typography sx={{ mt: 2 }}>{description}</Typography>
        <Box mt={3} display="flex" justifyContent="flex-end">
          <Button onClick={handleClose} variant="contained" sx={{ mr: 2 }}>
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="contained" color="primary">
            {actionText}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ActionModal;
