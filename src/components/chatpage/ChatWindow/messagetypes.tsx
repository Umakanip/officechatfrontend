// Define the Message type in a shared types file
// types.ts or messageTypes.ts (for example)

export interface Message {
  file: any;
  author: any;
  receiverID: number;
  groupID: number;
  SenderID: number;
  Content: string;
  SentAt: string;
  IsDeleted: boolean;
  IsPinned: boolean;
  isGroupChat: boolean;
  fileData?: {
    fileBlob: string;
    filename: string;
    filetype: string;
    filesize: number;
  };
}
export interface User {
  name: any;
  UserID: number;
  Username: string;
  ProfilePicture: undefined;
  GroupID: number;
  GroupName: string;
  isGroupChat: boolean;
  isActive: boolean;
  Item: any;
}
export interface Group {}
export interface GroupChat {
  id: number;
  name: string;
  // Add any other relevant properties here
}
