import { useParams } from "react-router-dom";

import ChatInput from "../Chats/ChatInput";
import Chats from "../Chats/Chats";

const DirectChatDetails = () => {
  const { roomId } = useParams<{ roomId: string }>();

  return (
    <>
      <Chats roomId={roomId} />
      <ChatInput roomId={roomId} />
    </>
  );
};

export default DirectChatDetails;
