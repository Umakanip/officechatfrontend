// RenderChatComponent
import React from "react";
import SingleChatContent from "./SingleChatContent";
import GroupChatContent from "./GroupChatContent";
import { Message } from "./messagetypes";

interface UserDetails {
  GroupID: number;
  isGroupChat: boolean;
  // Add other user details here
}

interface ChatComponentProps {
  userDetails: UserDetails;
  messageList: Message[];
}

const ChatComponent: React.FC<ChatComponentProps> = ({
  userDetails,
  messageList,
}) => {
  const renderChatContent = () => {
    console.log("messageList", messageList);
    if (userDetails?.isGroupChat && userDetails.GroupID) {
      return (
        <GroupChatContent userDetails={userDetails} messageList={messageList} />
      );
    } else {
      return (
        <SingleChatContent
          userDetails={userDetails}
          messageList={messageList}
        />
      );
    }
  };

  return <>{renderChatContent()}</>;
};

export default ChatComponent;
