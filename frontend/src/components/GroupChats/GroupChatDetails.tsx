import { useParams } from "react-router-dom";

import ChatInput from "../Chats/ChatInput";
import Chats from "../Chats/Chats";

const GroupChatDetails = () => {
  const { roomId } = useParams();

  return (
    <>
      <p>{roomId}</p>
      <Chats />
      <ChatInput />
    </>
  );
};

export default GroupChatDetails;
