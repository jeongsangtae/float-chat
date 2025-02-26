import React, { useState } from "react";

import useAuthStore from "../../store/authStore";
import useChatStore from "../../store/chatStore";

import { RoomId } from "../../types";

const ChatInput = ({ roomId }: RoomId) => {
  const { sendMessage } = useChatStore();
  const { userInfo } = useAuthStore();
  const [message, setMessage] = useState("");

  const inputChangeHandler = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setMessage(event.target.value);
  };

  const sendMessageHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (!roomId || !userInfo) {
      console.error("roomId 또는 userInfo가 정의되지 않았습니다.");
      return;
    }

    sendMessage(roomId, message, userInfo);
    setMessage("");
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
