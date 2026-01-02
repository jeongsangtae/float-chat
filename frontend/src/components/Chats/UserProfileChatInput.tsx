import { useState } from "react";
import useAuthStore from "../../store/authStore";
import useChatStore from "../../store/chatStore";

import { IoMdSend } from "react-icons/io";

import classes from "./UserProfileChatInput.module.css";

interface UserProfileChatInputProps {
  userId: string;
  nickname: string;
  avatarColor: string | null;
  avatarImageUrl: string | null;
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

  const isMessageValid = message.trim().length > 0;

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
    <div className={classes["user-profile-chat-input-container"]}>
      <div className={classes["user-profile-chat-input-wrapper"]}>
        <textarea
          onChange={inputChangeHandler}
          onKeyDown={keyPressHandler}
          value={message}
          placeholder=""
        />
        <IoMdSend
          className={`${classes["user-profile-chat-input-send-button"]} ${
            !isMessageValid ? classes.disable : ""
          }`}
          onClick={sendMessageHandler}
        />
      </div>
    </div>
  );
};

export default UserProfileChatInput;
