import React, { useState } from "react";
import useAuthStore from "../../store/authStore";
import useGroupChatStore from "../../store/groupChatStore";

import { ModalProps } from "../../types";
import AuthModal from "../UI/AuthModal";

const GroupChatForm = ({ onToggle }: ModalProps) => {
  const { userInfo } = useAuthStore();
  const { groupChatForm } = useGroupChatStore();

  const [title, setTitle] = useState<string>("");

  const inputChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const submitHandler = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    if (!userInfo) {
      alert("로그인이 필요합니다. 로그인 후 다시 시도해 주세요.");
      return;
    }

    try {
      await groupChatForm(title, userInfo);
      console.log("그룹 채팅방 생성 성공");
      onToggle();
    } catch (error) {
      console.error("에러 내용:", error);
      alert(
        "그룹 채팅방을 생성하는 중에 문제가 발생했습니다. 새로고침 후 다시 시도해 주세요."
      );
    }
  };

  return (
    <AuthModal onToggle={onToggle}>
      <form onSubmit={submitHandler}>
        <h2>그룹 채팅방 만들기</h2>
        <p>새로운 그룹 채팅방을 만들어 보세요.</p>
        <div>
          <div>채팅방 이름</div>
          <input
            required
            type="text"
            id="title"
            name="title"
            value={title}
            placeholder="내용 입력"
            onChange={inputChangeHandler}
          />
        </div>
        <div>
          <button type="submit">만들기</button>
        </div>
      </form>
    </AuthModal>
  );
};

export default GroupChatForm;
