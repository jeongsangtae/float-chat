import { useState, useEffect } from "react";
import useChatStore from "../../store/chatStore";

const ChatInput = ({ roomId }) => {
  const { connect, testButton } = useChatStore();
  const [message, setMessage] = useState("");

  // const inputChangeHandler = (event) => {
  //   setMessage(event.trget.value);
  // };

  useEffect(() => {
    connect();
  }, []);

  return (
    <>
      {/* <textarea
        onChange={inputChangeHandler}
        rows="1"
        placeholder="메시지를 입력해주세요."
      /> */}
      <button onClick={testButton}>Socket.io 테스트</button>
    </>
  );
};

export default ChatInput;
