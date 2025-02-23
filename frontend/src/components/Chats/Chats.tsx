import { useEffect } from "react";

import useChatStore from "../../store/chatStore";
import useSocketStore from "../../store/socketStore";

import Chat from "./Chat";
import { RoomId } from "../../types";

const Chats = ({ roomId }: RoomId) => {
  const { newMessage, connect, chatData, messages } = useChatStore();
  const { joinGroupChat } = useSocketStore();

  useEffect(() => {
    if (!roomId) {
      console.error("roomId가 정의되지 않았습니다.");
      return;
    }
    // newMessage(roomId);
    joinGroupChat(roomId);
  }, [roomId]);

  useEffect(() => {
    newMessage();
  }, []);

  useEffect(() => {
    if (!roomId) {
      console.error("roomId가 정의되지 않았습니다.");
      return;
    }
    chatData(roomId);
  }, [roomId]);

  return (
    <>
      <p>{roomId}</p>
      {messages.map((message) => (
        <Chat key={message._id} message={message.message} />
      ))}
    </>
  );
};

export default Chats;
