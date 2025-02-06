import { useState } from "react";

import useAuthStore from "../../store/authStore";
import useFriendStore from "../../store/friendStore";

const AddFriend = () => {
  const { userInfo } = useAuthStore();
  const { statusMessage, sendFriendRequest } = useFriendStore();

  const [searchUserEmail, setSearchUserEmail] = useState("");

  const addFriendHandler = async () => {
    if (!searchUserEmail.trim()) {
      alert("이메일을 입력하세요.");
      return;
    }

    sendFriendRequest(userInfo, searchUserEmail);
  };

  return (
    <>
      <p>검색창</p>
      <input
        type="text"
        placeholder="추가할 친구의 이메일을 입력하세요."
        value={searchUserEmail}
        onChange={(e) => setSearchUserEmail(e.target.value)}
      />
      <button onClick={addFriendHandler}>친구 요청 보내기</button>
      <p>{statusMessage}</p>
    </>
  );
};

export default AddFriend;
