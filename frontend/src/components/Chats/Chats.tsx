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
    // setTimeout(() => {
    //   newMessage();
    // }, 100); // 약간의 지연을 줘서 socket 초기화 후 실행되도록 함
    // newMessage();
    joinGroupChat(roomId);
  }, [roomId]);

  // useEffect(() => {
  //   newMessage();
  // }, [roomId]);

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
