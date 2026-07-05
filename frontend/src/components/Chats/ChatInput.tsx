import React, { useState, useRef } from "react";
import { IoMdSend } from "react-icons/io";

import useAuthStore from "../../store/authStore";
import useChatStore from "../../store/chatStore";
import useDirectChatStore from "../../store/directChatStore";

import { RoomId } from "../../types";

import classes from "./ChatInput.module.css";

const ChatInput = ({ roomId }: RoomId) => {
  const { sendMessage } = useChatStore();
  const { userInfo } = useAuthStore();
  const { directChats, getDirectChat } = useDirectChatStore();

  const [message, setMessage] = useState<string>("");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const isMessageValid = message.trim().length > 0;

  // 입력창 내용 변경 및 높이 자동 조절
  const inputChangeHandler = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    const textarea = textareaRef.current;

    if (textarea) {
      // 높이를 초기화하여 scrollHeight 값을 올바르게 계산
      textarea.style.height = "auto";
      const newHeight = textarea.scrollHeight; // 새로운 높이 계산

      // 텍스트 입력창의 최대 높이를 설정하고, 그 이상은 스크롤 사용
      if (newHeight <= 360) {
        textarea.style.overflowY = "hidden";
        textarea.style.height = `${newHeight}px`;
      } else {
        textarea.style.overflowY = "auto";
        textarea.style.height = "360px";
      }
    }

    setMessage(event.target.value);
  };

  // 메시지 전송
  const sendMessageHandler = async (): Promise<void> => {
    // 채팅방 정보, 사용자 정보, 입력 메시지 유효성 확인
    if (!roomId || !userInfo || !isMessageValid) return;

    // 메시지 전송
    await sendMessage(roomId, message.trim(), userInfo);

    // 입력창 초기화
    setMessage("");

    const textarea = textareaRef.current;

    if (textarea) {
      // 입력창 높이 초기화
      textarea.style.height = "62px";
      textarea.style.overflow = "hidden";
    }

    // 마지막 메시지 정보가 있는 경우 채팅방 목록 갱신
    const directChatChecked = directChats.find((room) => room._id === roomId);

    if (directChatChecked?.lastMessageDate) {
      await getDirectChat();
    }
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
    <div className={classes["chat-input-container"]}>
      <div className={classes["input-wrapper"]}>
        <textarea
          onChange={inputChangeHandler}
          onKeyDown={keyPressHandler}
          rows={1}
          value={message}
          placeholder="메시지를 입력해주세요."
          ref={textareaRef}
        />
        <IoMdSend
          onClick={sendMessageHandler}
          className={`${classes["send-button"]} ${
            !isMessageValid ? classes.disable : ""
          }`}
        />
      </div>
    </div>
  );
};

export default ChatInput;
