// import { useLoaderData } from "react-router-dom";
import { useEffect, useState } from "react";
import GroupChat from "./GroupChat";

import { GroupChatData } from "../../types";

const GroupChats = () => {
  // const groupChats = useLoaderData<GroupChatData[]>();

  // console.log(groupChats);
  const [groupChats, setGroupChats] = useState<GroupChatData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const apiURL = import.meta.env.VITE_API_URL;

      try {
        const response = await fetch(`${apiURL}/groupChats`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("그룹 채팅방 목록 조회 실패");
        }

        const resData: { groupChats: GroupChatData[] } = await response.json();

        setGroupChats(resData.groupChats);
      } catch (error) {
        console.error("에러 내용:", error);
        alert(
          "그룹 채팅방 목록을 불러오는 중에 문제가 발생했습니다. 새로고침 후 다시 시도해 주세요."
        );
      } finally {
        setLoading(false); // 로딩 상태 끝내기
      }
    };

    fetchData();
  }, []);

  // 로딩 중일 때
  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <>
      {/* <div>그룹 채팅방</div> */}
      {groupChats.length === 0 ? (
        <p>그룹 채팅방이 없습니다.</p>
      ) : (
        groupChats.map((groupChat) => (
          <GroupChat
            key={groupChat._id}
            _id={groupChat._id}
            title={groupChat.title}
          />
        ))
      )}
    </>
  );
};

export default GroupChats;
