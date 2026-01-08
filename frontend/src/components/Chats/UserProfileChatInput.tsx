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

    // 높이 초기화
    textarea.style.height = "48px";

    // 화면 기준 최대 높이 계산
    const viewportHeight = window.innerHeight; // 브라우저 실제 표시 영역 높이
    const textareaTop = textarea.getBoundingClientRect().top; // viewport 기준 textarea Y 위치

    const bottomPadding = 36; // 하단 여유 공간
    const maxHeight = viewportHeight - textareaTop - bottomPadding; // 늘릴 수 있는 최대 높이 계산

    // 실제 적용할 높이 (내용 높이와 허용 최대 높이 중 더 작은 값 사용)
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);

    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? "auto" : "hidden";

    // const hasScrollbar = textarea.scrollHeight > textarea.clientHeight;

    // if (hasScrollbar) {
    //   textarea.scrollTop = textarea.scrollHeight;
    // }

    const isNearBottom =
      textarea.scrollHeight - textarea.scrollTop - textarea.clientHeight < 48;

    if (isNearBottom) {
      textarea.scrollTop = textarea.scrollHeight;
    }

    // 테스트용 (의도적으로 문제 발생)
    // textarea.scrollTop = textarea.scrollHeight;

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
