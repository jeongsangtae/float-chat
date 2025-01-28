import { useState } from "react";

const ChatInput = () => {
  const [message, setMessage] = useState("");
  const inputChangeHandler = (event) => {
    event.preventDefault();
    setMessage(event.target.value);
  };

  return (
    <>
      <textarea
        onChange={inputChangeHandler}
        rows="1"
        placeholder="메시지를 입력해주세요."
      />
    </>
  );
};

export default ChatInput;
