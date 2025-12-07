import { useState } from "react";
import useAuthStore from "../../store/authStore";

const UserProfileChatInput = ({ userId }) => {
  const { userInfo } = useAuthStore();
  const [message, setMessage] = useState<string>("");

  const inputChangeHandler = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setMessage(event.target.value);
  };

  const sendMessageHandler = () => {
    // sendMessage(userId, message.trim(), userInfo)
  };

  const keyPressHandler = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // 줄바꿈 방지
      sendMessageHandler();
    }
  };

  return (
    <div>
      <div>
        <textarea
          onChange={inputChangeHandler}
          onKeyDown={keyPressHandler}
          placeholder=""
        />
        <button onClick={sendMessageHandler}></button>
      </div>
    </div>
  );
};

export default UserProfileChatInput;
