import React, { useEffect } from "react";
import MainHeader from "./Header/MainHeader";
import axios from "axios";
import Sidemenu from "./sidemenu/sidemenu";
import { Box } from "@mui/material";
// import { useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";

const Chatpage: React.FC = () => {
  // const location = useLocation();
  // const { username } = location.state as { username: string }; // Type assertion to access the state

  const { user } = useUser();
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      /// alert("HI");
      // Send a request to the server to remove the user from the loggedInUsers array
      axios.post(`${process.env.REACT_APP_API_URL}/api/auth/logout`, {
        userId: user?.userdata?.UserID,
      });
      event.preventDefault();
      event.returnValue = "";
    };

    // Attach the event listener
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user?.userdata?.UserID]);

  return (
    <>
      <Box sx={{ height: "100vh" }}>
        <MainHeader />
        <Sidemenu />
      </Box>
    </>
  );
};
export default Chatpage;
