import { useState } from "react";
import useAuthStore from "../../store/authStore";
import useChatStore from "../../store/chatStore";

interface UserProfileChatInputProps {
  userId: string;
  nickname: string;
  avatarColor?: string;
  avatarImageUrl?: string;
}

const UserProfileChatInput = ({
  userId,
  nickname,
  avatarColor,
  avatarImageUrl,
}: UserProfileChatInputProps) => {
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

    setMessage("");
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
          value={message}
          placeholder=""
        />
        <button onClick={sendMessageHandler}></button>
      </div>
    </div>
  );
};

export default UserProfileChatInput;
