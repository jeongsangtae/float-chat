import React, { useState } from "react";
import useAuthStore from "../../store/authStore";
import useGroupChatStore from "../../store/groupChatStore";
import useModalStore from "../../store/modalStore";

import { ModalProps } from "../../types";
import AuthModal from "../UI/AuthModal";

const GroupChatForm = ({ onToggle }: ModalProps) => {
  const { userInfo } = useAuthStore();
  const { groupChatForm } = useGroupChatStore();
  const { modalData } = useModalStore();

  const [title, setTitle] = useState<string>("");

  const inputChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
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

    // const { _id, title, ...otherData } = modalData;
    // modalData 키 이름 변경
    // const modifiedModalData = {
    //   ...otherData,
    //   modalId: _id,
    //   modalTitle: title,
    // };

    // console.log(modifiedModalData);

    try {
      // await groupChatForm(title, userInfo, modifiedModalData);
      await groupChatForm(title, userInfo, modalData);
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
        <h2>그룹 채팅방 {modalData.method === "POST" ? "만들기" : "수정"}</h2>
        <p>
          {modalData.method === "POST"
            ? "새로운 그룹 채팅방을 만들어 보세요."
            : "그룹 채팅방 제목을 수정해 보세요."}
        </p>
        <div>
          <div>채팅방 이름</div>
          <input
            required
            type="text"
            id="title"
            name="title"
            defaultValue={modalData.method === "POST" ? title : modalData.title}
            placeholder="내용 입력"
            onChange={inputChangeHandler}
          />
        </div>
        <div>
          <button type="submit">
            {modalData.method === "POST" ? "만들기" : "수정"}
          </button>
        </div>
      </form>
    </AuthModal>
  );
};

export default GroupChatForm;
