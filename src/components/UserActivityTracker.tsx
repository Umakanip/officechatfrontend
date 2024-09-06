import { useEffect } from "react";
import axios from "axios";
import { useUser } from "./context/UserContext";

const UserActivityTracker: React.FC = () => {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/api/getActiveUser`, {
          //   userId: user?.userdata?.UserID,
          //   isActive: true,
        });
      }, 5000); // Send every 5 seconds

      return () => clearInterval(interval); // Clean up on unmount
    }
  }, [user]);

  return null;
};

export default UserActivityTracker;
