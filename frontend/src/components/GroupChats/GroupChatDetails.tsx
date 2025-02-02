import { useParams } from "react-router-dom";

import ChatInput from "../Chats/ChatInput";
import Chats from "../Chats/Chats";

const GroupChatDetails = () => {
  const { roomId } = useParams();

  return (
    <>
      <Chats roomId={roomId} />
      <ChatInput roomId={roomId} />
    </>
  );
};

export default GroupChatDetails;
