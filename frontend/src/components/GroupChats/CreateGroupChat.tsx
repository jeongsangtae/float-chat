import React, { useState } from "react";

import { ModalProps } from "../../types";
import AuthModal from "../UI/AuthModal";

const CreateGroupChat: React.FC<ModalProps> = ({ onToggle }) => {
  // 나중에 사용될 환경 변수 API URL
  // 미리 구성
  const apiURL = import.meta.env.VITE_API_URL;

  const [title, setTitle] = useState<string>("");

  const inputChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const submitHandler = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    let requestBody = {
      title,
    };

    const response = await fetch(`${apiURL}/createGroupChat`, {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`그룹 채팅방 생성 실패`);
    }

    console.log("방 생성 성공");
    onToggle();
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

export default CreateGroupChat;
