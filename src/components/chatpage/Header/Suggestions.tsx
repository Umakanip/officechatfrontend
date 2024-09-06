import React from "react";
import { Box, List, ListItem, Typography } from "@mui/material";
import { User } from "../ChatWindow/messagetypes"; // Adjust path if needed

interface SuggestionsProps {
  suggestions: User[];
  onSelect: (username: string) => void;
}

const Suggestions: React.FC<SuggestionsProps> = ({ suggestions, onSelect }) => {
  console.log("suggestions", suggestions);
  return (
    <Box
      sx={{
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        backgroundColor: "white",
        border: "1px solid #ccc",
        borderRadius: "4px",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
        zIndex: 1000,
        maxHeight: "200px",
        overflowY: "auto",
      }}
    >
      <List>
        {suggestions.length > 0 ? (
          suggestions.map((user: any) => {
            console.log(user);
            return (
              <>
                <ListItem
                  className="mainheader-suggestions"
                  onClick={() => onSelect(user)}
                  key={user.UserID}
                >
                  <Typography variant="body2" style={{ color: "black" }}>
                    {user.Username}
                  </Typography>
                </ListItem>
              </>
            );
          })
        ) : (
          <ListItem>
            <Typography variant="body2">No suggestions</Typography>
          </ListItem>
        )}
      </List>
    </Box>
  );
};

export default Suggestions;
