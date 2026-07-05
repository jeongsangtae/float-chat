import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const { userInfo } = useAuthStore();
  const { userProfileDirectSendMessage } = useChatStore();

  const [message, setMessage] = useState<string>("");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const isMessageValid = message.trim().length > 0;

  // 입력창 내용 변경 및 높이 자동 조절
  const inputChangeHandler = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    // 높이를 초기화하여 scrollHeight 값을 올바르게 계산
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

    setMessage(event.target.value);
  };

  // 메시지 전송
  const sendMessageHandler = async (): Promise<void> => {
    if (!userId || !userInfo) return;

    const targetUser = {
      userId,
      nickname,
      avatarColor,
      avatarImageUrl,
    };

    // 다이렉트 채팅 메시지 전송 후 채팅방 ID 반환
    const roomId = await userProfileDirectSendMessage(
      targetUser,
      message.trim(),
      userInfo
    );

    setMessage("");

    const textarea = textareaRef.current;

    if (!textarea) return;
    // 입력창 높이 초기화
    textarea.style.height = "48px";
    textarea.style.overflow = "hidden";

    // 전송한 다이렉트 채팅방으로 이동
    navigate(`/me/${roomId}`);
  };

  // Enter 키 입력 처리
  const keyPressHandler = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter 입력 시 메시지 전송 (Shift+Enter는 줄바꿈)
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
