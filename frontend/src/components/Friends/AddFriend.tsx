import { useState, useEffect } from "react";
import { toast } from "react-toastify";

import useAuthStore from "../../store/authStore";
import useFriendStore from "../../store/friendStore";

import classes from "./AddFriend.module.css";

const AddFriend = () => {
  const { userInfo } = useAuthStore();
  const {
    status,
    statusMessage,
    resetStatusMessage,
    loadFriendRequests,
    sendFriendRequest,
  } = useFriendStore();

  const [searchUserEmail, setSearchUserEmail] = useState<string>("");

  // 컴포넌트 마운트/언마운트 시 상태 메시지 초기화
  useEffect(() => {
    resetStatusMessage();

    return () => resetStatusMessage();
  }, []);

  // 친구 요청 성공 시 입력창 초기화
  useEffect(() => {
    if (status === 200) {
      setSearchUserEmail("");
    }
  }, [status]);

  // 친구 요청 전송
  const addFriendHandler = async (): Promise<void> => {
    if (!searchUserEmail.trim()) {
      toast.error("이메일을 입력하세요.");
      return;
    }

    if (!userInfo) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    await sendFriendRequest(userInfo, searchUserEmail);
    await loadFriendRequests();
  };

  return (
    <>
      <h2 className={classes.title}>친구 추가하기</h2>
      <p className={classes.description}>
        사용자 이메일을 사용하여 친구를 추가할 수 있어요.
      </p>
      <div className={classes["add-friend-search-wrapper"]}>
        <input
          type="text"
          autoComplete="off"
          placeholder="추가할 사용자의 이메일을 입력하세요."
          value={searchUserEmail}
          className={classes["add-friend-search-input"]}
          onChange={(e) => setSearchUserEmail(e.target.value)}
        />
        <button
          className={`${classes["add-friend-send-button"]} ${
            searchUserEmail ? classes.active : classes.disable
          }`}
          onClick={addFriendHandler}
        >
          친구 요청 보내기
        </button>
      </div>
      <p className={classes["status-message"]}>{statusMessage}</p>
    </>
  );
};

export default AddFriend;
