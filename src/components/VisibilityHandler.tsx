import { useEffect } from "react";
import axios from "axios";
import { useUser } from "./context/UserContext";

const VisibilityHandler: React.FC = () => {
  const { user } = useUser();

  useEffect(() => {
    const handleVisibilityChange = () => {
      //   if (document.hidden) {
      //     axios.post(`${process.env.REACT_APP_API_URL}users`, {
      //       userId: user?.userdata?.UserID,
      //       isActive: false,
      //     });
      //   } else {
      //     axios.post(`${process.env.REACT_APP_API_URL}updateStatus`, {
      //       userId: user?.userdata?.UserID,
      //       isActive: true,
      //     });
      //   }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user]);

  return null;
};

export default VisibilityHandler;
