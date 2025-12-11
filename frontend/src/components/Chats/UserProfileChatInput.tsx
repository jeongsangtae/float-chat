import { useState } from "react";
import useAuthStore from "../../store/authStore";
import useChatStore from "../../store/chatStore";

const UserProfileChatInput = ({
  userId,
  nickname,
  avatarColor,
  avatarImageUrl,
}) => {
  const { userInfo } = useAuthStore();
  const { userProfileDirectSendMessage } = useChatStore();
  const [message, setMessage] = useState<string>("");

  const inputChangeHandler = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setMessage(event.target.value);
  };

  const sendMessageHandler = () => {
    if (!userId || !userInfo) return;

    const targetUser = {
      userId,
      nickname,
      avatarColor,
      avatarImageUrl,
    };

    userProfileDirectSendMessage(targetUser, message.trim(), userInfo);
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
