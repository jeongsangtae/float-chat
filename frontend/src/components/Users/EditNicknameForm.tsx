import { useState } from "react";

import useAuthStore from "../../store/authStore";
import useModalStore from "../../store/modalStore";

import { ModalProps } from "../../types";
import Modal from "../UI/Modal";

const EditNicknameForm = ({ onToggle }: ModalProps) => {
  const { userInfo, editNicknameForm } = useAuthStore();
  const { modalData } = useModalStore();

  const [nickname, setNickname] = useState<string>("");

  const inputChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setNickname(event.target.value);
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
      await editNicknameForm(nickname, userInfo, modalData);

      console.log("사용자 닉네임 수정 성공");
      onToggle();
    } catch (error) {
      console.error("에러 내용:", error);
      alert(
        "사용자 닉네임을 수정하는 중에 문제가 발생했습니다. 새로고침 후 다시 시도해 주세요."
      );
    }
  };

  return (
    <Modal onToggle={onToggle}>
      <form onSubmit={submitHandler}>
        <h2>사용자 닉네임 변경</h2>
        <div>
          <div>채팅방 이름</div>
          <input
            required
            type="text"
            id="nickname"
            name="nickname"
            defaultValue={modalData.nickname}
            maxLength={5}
            placeholder="내용 입력"
            onChange={inputChangeHandler}
          />
        </div>
        <div>
          <button type="submit">수정</button>
        </div>
      </form>
    </Modal>
  );
};

export default EditNicknameForm;
