import { useEffect } from "react";
import { useParams } from "react-router-dom";
import useChatStore from "../../store/chatStore";

import ChatInput from "../Chats/ChatInput";
import Chats from "../Chats/Chats";

const GroupChatDetails = () => {
  const { roomId } = useParams();

  const { connect, chatData } = useChatStore();

  // console.log(chatData(roomId));

  useEffect(() => {
    connect(roomId);
  }, []);

  return (
    <>
      {/* <p>{roomId}</p> */}
      <Chats roomId={roomId} />
      <ChatInput roomId={roomId} />
    </>
  );
};

export default GroupChatDetails;
