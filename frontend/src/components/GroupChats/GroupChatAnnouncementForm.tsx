import { useState } from "react";

import useModalStore from "../../store/modalStore";
import useGroupChatStore from "../../store/groupChatStore";

import { ModalProps } from "../../types";
import Modal from "../UI/Modal";

import classes from "./GroupChatAnnouncementForm.module.css";

const GroupChatAnnouncementForm = ({ onToggle }: ModalProps) => {
  const { modalData } = useModalStore();
  const { groupChatAnnouncementForm } = useGroupChatStore();

  const [announcement, setAnnouncement] = useState<string>(
    modalData.announcement ?? ""
  );

  const [errorMessage, setErrorMessage] = useState<string>("");

  const trimmedAnnouncement = announcement.trim();
  const announcementValid =
    trimmedAnnouncement.length >= 1 && trimmedAnnouncement.length <= 50;

  const inputChangeHandler = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    const value = event.target.value;

    setAnnouncement(value);

    if (value.trim().length >= 50) {
      setErrorMessage("최대 글자 수에 도달했습니다.");
    } else {
      setErrorMessage("");
    }
  };

  const submitHandler = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    // if (trimmedAnnouncement.length < 30) {
    //   setErrorMessage("30자 이하로 입력해주세요.");
    //   return;
    // }

    try {
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
      <form
        className={classes["group-chat-announcement-form"]}
        onSubmit={submitHandler}
      >
        <h2 className={classes.title}>그룹 채팅방 공지</h2>
        <div>
          <div className={classes["group-chat-announcement-title"]}>
            공지 내용
          </div>
          <textarea
            id="announcement"
            name="announcement"
            value={announcement}
            maxLength={50}
            placeholder="내용 입력"
            onChange={inputChangeHandler}
            className={classes["group-chat-announcement-textarea"]}
          />
        </div>

        <div className={classes["group-chat-announcement-count-wrapper"]}>
          <span
            className={
              announcement.length >= 50 ? classes["count-max"] : classes.count
            }
          >
            {announcement.length}/50
          </span>
          {announcement.length >= 50 && (
            <span className={classes["count-warning-message"]}>
              {errorMessage}
            </span>
          )}
        </div>

        {/* <div>{errorMessage}</div> */}

        <div className={classes["submit-button"]}>
          <button
            type="submit"
            className={announcementValid ? classes.active : classes.disable}
          >
            수정
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default GroupChatAnnouncementForm;
