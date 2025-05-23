import React, { useState, useRef } from "react";

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

  const inputChangeHandler = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    const textarea = textareaRef.current;

    console.log(textarea);

    if (textarea) {
      // 높이를 초기화하여 scrollHeight 값을 올바르게 계산
      textarea.style.height = "auto";
      const newHeight = textarea.scrollHeight; // 새로운 높이 계산
      // textarea.style.height = `${newHeight}px`;

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

  const sendMessageHandler = async (): Promise<void> => {
    if (!roomId || !userInfo || !isMessageValid) return;

    await sendMessage(roomId, message.trim(), userInfo);
    setMessage("");

    const directChatChecked = directChats.find((room) => room._id === roomId);

    if (directChatChecked?.lastMessageDate) {
      await getDirectChat();
    }
  };

  const keyPressHandler = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
        <button
          onClick={sendMessageHandler}
          className={!isMessageValid ? classes.disable : ""}
        >
          전송
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
