import { useState } from "react";

import { toast } from "react-toastify";

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

  const trimmedAnnouncement = announcement.trim();
  const announcementValid = trimmedAnnouncement.length <= 50;

  // 공지사항 글자 수에 따라 안내 메시지 표시
  const errorMessage =
    announcement.length === 50 ? "최대 글자 수에 도달했습니다." : "";

  // 공지사항 입력 및 글자 수 제한 처리
  const inputChangeHandler = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    const value = event.target.value;

    if (value.length > 50) {
      return; // 50자 넘으면 반영하지 않음
    }

    setAnnouncement(value);
  };

  // 공지사항 수정 요청
  const submitHandler = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    try {
      await groupChatAnnouncementForm(trimmedAnnouncement, modalData);

      onToggle();
    } catch (error) {
      console.error("에러 내용:", error);
      toast.error("수정 실패 - 새로고침 후 다시 시도해주세요");
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
            placeholder="내용 입력"
            onChange={inputChangeHandler}
            className={classes["group-chat-announcement-textarea"]}
          />
        </div>

        {/* 공지사항 입력 길이 진행률 */}
        <div className={classes["group-chat-announcement-count-wrapper"]}>
          <div className={classes["progress-container"]}>
            <div
              className={`${classes["progress-bar"]} ${
                announcement.length >= 50
                  ? classes["progress-bar-max"]
                  : announcement.length >= 30
                  ? classes["progress-bar-warning"]
                  : ""
              }`}
              style={{ width: `${(announcement.length / 50) * 100}%` }}
            ></div>
          </div>
          <span
            className={`${classes["progress-count"]} ${
              announcement.length >= 50
                ? classes["progress-count-max"]
                : announcement.length >= 30
                ? classes["progress-count-warning"]
                : ""
            }`}
          >
            {announcement.length}/50
          </span>
        </div>

        {/* 글자 수 안내 */}
        <div className={classes["count-warning-message"]}>{errorMessage}</div>

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
