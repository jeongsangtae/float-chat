import { useEffect } from "react";
import { useParams } from "react-router-dom";
import useChatStore from "../../store/chatStore";

import ChatInput from "../Chats/ChatInput";
import Chats from "../Chats/Chats";

const GroupChatDetails = () => {
  const { roomId } = useParams();

  const { chatData } = useChatStore();

  // useEffect(() => {
  //   chatData(roomId);
  // }, []);

  return (
    <>
      <p>{roomId}</p>
      <Chats />
      <ChatInput roomId={roomId} />
    </>
  );
};

export default GroupChatDetails;
