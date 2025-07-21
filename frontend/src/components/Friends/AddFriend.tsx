import { useState, useEffect } from "react";

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

  useEffect(() => {
    resetStatusMessage();

    return () => resetStatusMessage();
  }, []);

  useEffect(() => {
    if (status === 200) {
      setSearchUserEmail("");
    }
  }, [status]);

  const addFriendHandler = async (): Promise<void> => {
    if (!searchUserEmail.trim()) {
      alert("이메일을 입력하세요.");
      return;
    }

    if (!userInfo) {
      alert("로그인이 필요합니다. 로그인 후 다시 시도해 주세요.");
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
