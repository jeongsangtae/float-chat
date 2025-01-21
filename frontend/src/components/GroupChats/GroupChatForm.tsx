import React, { useState } from "react";
import useAuthStore from "../../store/authStore";
import useGroupChatStore from "../../store/groupChatStore";

import { ModalProps, FetchMethod } from "../../types";
import AuthModal from "../UI/AuthModal";

type GroupChatProps = ModalProps & FetchMethod;

const GroupChatForm = ({ onToggle, method }: GroupChatProps) => {
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
      await groupChatForm(title, userInfo, method);
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
        <h2>그룹 채팅방 {method === "POST" ? "만들기" : "수정"}</h2>
        <p>그룹 채팅방 정보를 입력하세요.</p>
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
          <button type="submit">{method === "POST" ? "만들기" : "수정"}</button>
        </div>
      </form>
    </AuthModal>
  );
};

export default GroupChatForm;
