import { useEffect } from "react";
import useChatStore from "../../store/chatStore";

import Chat from "./Chat";

const Chats = ({ roomId }) => {
  const { chatData, messages } = useChatStore();

  console.log(messages);
  // console.log(chatData);

  useEffect(() => {
    // if (roomId) {
    //   chatData(roomId);
    // }
    chatData(roomId);
  }, []);

  return (
    <>
      {messages.map((message) => (
        <Chat key={message._id} message={message.message} />
      ))}
    </>
  );
};

export default Chats;
