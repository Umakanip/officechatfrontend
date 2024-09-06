import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { User } from "../chatpage/ChatWindow/messagetypes";

interface UserDetails {
  userdata: any;
  // Add other user details here
}

interface GroupDetails {
  groupID: number;
  GroupName: string;
  CreatedAt: string;
  // Add other group details here if needed
}

interface UserContextProps {
  user: UserDetails | null;
  setUser: React.Dispatch<React.SetStateAction<UserDetails | null>>;
  groups: GroupDetails[]; // Add this line
  setGroups: React.Dispatch<React.SetStateAction<GroupDetails[]>>; // Add this line
  activeGroup: number | null;
  setActiveGroup: (GroupID: number | null) => void;
  activeUser: number | null;
  setActiveUser: (UserID: number | null) => void;
  selectedUserId: number | null;
  setSelectedUserId: (userId: number | null) => void;
  logout: () => void;
  selectActiveUser: User | null;
  setselectActiveUser: (user: User) => void;
  Contact: User[];
  setContact: React.Dispatch<React.SetStateAction<User[]>>; // Update this line
  headerTitle: string | null;
  setHeaderTitle: React.Dispatch<React.SetStateAction<string>>;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [groups, setGroups] = useState<GroupDetails[]>([]); // Add this state
  const [activeGroup, setActiveGroup] = useState<number | null>(null);
  const [activeUser, setActiveUser] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectActiveUser, setselectActiveUser] = useState<User | null>(null);
  const [headerTitle, setHeaderTitle] = useState<string>("");
  const [Contact, setContact] = useState<User[]>([]);
  //const [Contact, setContact] = useState<User[]>([]);
  // Memoized logout function
  const logout = useCallback(() => {
    setUser(null);
    // Optionally, perform additional cleanup (e.g., clear tokens)
    // e.g., localStorage.removeItem('userToken');
  }, []);
  useEffect(() => {
    // Retrieve user data from localStorage on initial load
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse user data:", error);
        // Handle the error, e.g., clear the invalid data from localStorage
        localStorage.removeItem("user");
      }
    }
  }, []);

  useEffect(() => {
    // Save user data to localStorage whenever it changes
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        groups,
        setGroups,
        activeGroup,
        setActiveGroup,
        activeUser,
        setActiveUser,
        selectedUserId,
        setSelectedUserId,
        logout,
        selectActiveUser,
        setselectActiveUser,
        Contact,
        setContact,
        headerTitle,
        setHeaderTitle,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextProps => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
