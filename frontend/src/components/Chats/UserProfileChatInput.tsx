import { useState, useRef } from "react";
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

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const isMessageValid = message.trim().length > 0;

  const inputChangeHandler = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    // const profileElement = textarea.closest(".user-profile-container");

    // if (!profileElement) return;

    // 높이 초기화
    textarea.style.height = "48px";
    // textarea.style.height = "auto";

    // 화면 기준 최대 높이 계산
    const viewportHeight = window.innerHeight; // 브라우저 실제 표시 영역 높이
    const textareaTop = textarea.getBoundingClientRect().top; // viewport 기준 textarea Y 위치

    // const textareaRect = textarea.getBoundingClientRect();
    // const profileRect = profileElement.getBoundingClientRect();

    const bottomPadding = 36; // 하단 여유 공간
    const maxHeight = viewportHeight - textareaTop - bottomPadding; // 늘릴 수 있는 최대 높이 계산

    // textarea가 늘어날 수 있는 실제 최대 높이
    // const maxHeight =
    // viewportHeight - textareaRect.top - 16;
    // const maxHeight = Math.min(
    //   viewportHeight - textareaRect.top - 100,
    //   profileRect.bottom - textareaRect.top - 50
    // );

    // 실제 적용할 높이 (내용 높이와 허용 최대 높이 중 더 작은 값 사용)
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);

    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? "auto" : "hidden";

    // const isNearBottom =
    //   textarea.scrollHeight - textarea.scrollTop - textarea.clientHeight < 24;

    // if (isNearBottom) {
    //   textarea.scrollTop = textarea.scrollHeight;
    // }

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

    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "48px";
    textarea.style.overflow = "hidden";
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
          placeholder={`${nickname}님에게 메시지 보내기`}
          ref={textareaRef}
          rows={1}
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
