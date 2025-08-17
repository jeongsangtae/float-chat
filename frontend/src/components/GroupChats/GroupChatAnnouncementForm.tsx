import { useState } from "react";

// import useAuthStore from "../../store/authStore";
import useModalStore from "../../store/modalStore";
import useGroupChatStore from "../../store/groupChatStore";

import { ModalProps } from "../../types";
import Modal from "../UI/Modal";

const GroupChatAnnouncementForm = ({ onToggle }: ModalProps) => {
  // const { userInfo } = useAuthStore();
  const { modalData } = useModalStore();
  const { groupChatAnnouncementForm } = useGroupChatStore();

  const [announcement, setAnnouncement] = useState<string>(
    modalData.announcement ?? ""
  );

  const [errorMessage, setErrorMessage] = useState<string>("");

  const trimmedAnnouncement = announcement.trim();
  // const announcementValid = trimmedAnnouncement.length >= 2;

  const inputChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = event.target.value;

    setAnnouncement(value);

    if (value.trim().length >= 30) {
      setErrorMessage("30자 이하로 입력해주세요.");
    } else {
      setErrorMessage("");
    }
  };

  const submitHandler = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    // if (!userInfo) {
    //   alert("로그인이 필요합니다. 로그인 후 다시 시도해 주세요.");
    //   return;
    // }

    // if (trimmedAnnouncement.length < 30) {
    //   setErrorMessage("30자 이하로 입력해주세요.");
    //   return;
    // }

    try {
      // await groupChatAnnouncementForm(trimmedAnnouncement, userInfo, modalData);
      await groupChatAnnouncementForm(trimmedAnnouncement, modalData);
      console.log("그룹 채팅방 공지 수정 성공");
      onToggle();
    } catch (error) {
      console.error("에러 내용:", error);
      alert(
        "그룹 채팅방 공지를 수정하는 중에 문제가 발생했습니다. 새로고침 후 다시 시도해 주세요."
      );
    }
  };

  return (
    <Modal onToggle={onToggle}>
      <form onSubmit={submitHandler}>
        <h2>그룹 채팅방 공지</h2>
        <p>호스트 전용 공간</p>
        <div>
          <div>공지 내용</div>
          <input
            type="text"
            id="announcement"
            name="announcement"
            value={announcement}
            maxLength={30}
            placeholder="내용 입력"
            onChange={inputChangeHandler}
          />
        </div>

        <div>{errorMessage}</div>

        <div>
          <button
            type="submit"
            // className={announcementValid ? classes.active : classes.disable}
          >
            수정
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default GroupChatAnnouncementForm;
