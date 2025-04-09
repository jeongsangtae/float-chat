import { useEffect } from "react";
import { useParams } from "react-router-dom";

import ChatInput from "../Chats/ChatInput";
import Chats from "../Chats/Chats";

import useDirectChatStore from "../../store/directChatStore";

const DirectChatDetails = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { setCurrentRoomId } = useDirectChatStore();

  useEffect(() => {
    setCurrentRoomId(roomId ?? null);
  }, [roomId]);

  return (
    <>
      <Chats roomId={roomId} />
      <ChatInput roomId={roomId} />
    </>
  );
};

export default DirectChatDetails;
