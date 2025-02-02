import { useEffect } from "react";

import useChatStore from "../../store/chatStore";

import Chat from "./Chat";

const Chats = ({ roomId }) => {
  const { connect, chatData, messages } = useChatStore();

  console.log(messages);
  // console.log(chatData);

  useEffect(() => {
    connect(roomId);
  }, []);

  useEffect(() => {
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
