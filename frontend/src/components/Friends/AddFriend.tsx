import { useState, useEffect } from "react";

import useAuthStore from "../../store/authStore";

const AddFriend = () => {
  const apiURL = import.meta.env.VITE_API_URL;

  const { userInfo } = useAuthStore();

  const [searchUserEmail, setSearchUserEmail] = useState("");
  // const [searchUser, setSearchUser] = useState([]);
  const [resultMessage, setResultMessage] = useState("");

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       const response = await fetch(`${apiURL}/searchUser`, {
  //         credentials: "include",
  //       });

  //       if (!response.ok) {
  //         throw new Error("사용자 검색 실패");
  //       }

  //       const resData = await response.json();

  //       setSearchUser(resData.searchUser);
  //     } catch (error) {
  //       console.error("에러 내용:", error);
  //       alert(
  //         "사용자를 검색하는 중에 문제가 발생했습니다. 새로고침 후 다시 시도해 주세요."
  //       );
  //     }
  //   };
  //   fetchUser();
  // }, [searchUser]);

  const addFriendHandler = async () => {
    if (!searchUserEmail.trim()) {
      alert("이메일을 입력하세요.");
      return;
    }

    const { _id, email, username, nickname } = userInfo;

    const requestBody = {
      _id,
      email,
      username,
      nickname,
      searchUserEmail,
    };

    try {
      const response = await fetch(`${apiURL}/addFriend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("친구 추가 요청 실패");
      }

      const resData = await response.json();
      setResultMessage(resData.message);
      setSearchUserEmail("");
    } catch (error) {
      console.error("에러 내용:", error);
      alert("친구 추가 요청 중 문제가 발생했습니다.");
    }
  };

  // const filteredSearchUser = searchUser.filter((userData) =>
  //   userData.email.toLowerCase().includes(searchTerm.toLowerCase())
  // );

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
      <p>{resultMessage}</p>
      {/* <ul>
        {filteredSearchUser.map((userData) => (
          <li key={userData._id}>{userData.email}</li>
        ))}
      </ul> */}
    </>
  );
};

export default AddFriend;
