import React, { useState } from "react";

import useAuthStore from "../../store/authStore";
import useChatStore from "../../store/chatStore";
import useDirectChatStore from "../../store/directChatStore";

import { RoomId } from "../../types";

const ChatInput = ({ roomId }: RoomId) => {
  const { sendMessage } = useChatStore();
  const { userInfo } = useAuthStore();
  const { directChats, getDirectChat } = useDirectChatStore();
  const [message, setMessage] = useState<string>("");

  const inputChangeHandler = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    setMessage(event.target.value);
  };

  // const sendMessageHandler = (
  //   event: React.MouseEvent<HTMLButtonElement>
  // ): void => {
  //   event.preventDefault();

  //   if (!roomId || !userInfo) {
  //     console.error("roomId 또는 userInfo가 정의되지 않았습니다.");
  //     return;
  //   }

  //   sendMessage(roomId, message, userInfo);
  //   setMessage("");

  //   const directChatChecked = directChats.find((room) => room._id === roomId);

  //   if (directChatChecked?.lastMessageDate) {
  //     getDirectChat();
  //   }
  // };

  const sendMessageHandler = async (
    event: React.MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    event.preventDefault();

    if (!roomId || !userInfo) {
      console.error("roomId 또는 userInfo가 정의되지 않았습니다.");
      return;
    }

    await sendMessage(roomId, message, userInfo);
    setMessage("");

    const directChatChecked = directChats.find((room) => room._id === roomId);

    if (directChatChecked?.lastMessageDate) {
      await getDirectChat();
    }
  };

  return (
    <>
      <textarea
        onChange={inputChangeHandler}
        rows={1}
        value={message}
        placeholder="메시지를 입력해주세요."
      />
      <button onClick={sendMessageHandler}>전송</button>
    </>
  );
};

export default ChatInput;
