import { useState } from "react";

import useAuthStore from "../../store/authStore";
import useChatStore from "../../store/chatStore";

const ChatInput = ({ roomId }) => {
  const { sendMessage, testButton } = useChatStore();
  const { userInfo } = useAuthStore();
  const [message, setMessage] = useState("");

  const inputChangeHandler = (event) => {
    setMessage(event.target.value);
  };

  const sendMessageHandler = (event) => {
    event.preventDefault();

    sendMessage(roomId, message, userInfo);
  };

  return (
    <>
      <textarea
        onChange={inputChangeHandler}
        rows="1"
        value={message}
        placeholder="메시지를 입력해주세요."
      />
      <button onClick={sendMessageHandler}>전송</button>
      <button onClick={testButton}>Socket.io 테스트</button>
    </>
  );
};

export default ChatInput;
