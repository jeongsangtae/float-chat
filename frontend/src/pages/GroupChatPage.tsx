import GroupChats from "../components/GroupChats/GroupChats";
import { GroupChatData } from "../types";

const GroupChatPage = () => {
  return (
    <>
      <GroupChats />
    </>
  );
};

export default GroupChatPage;

// 페이지 로드 시 호출되는 loader 함수
// 그룹 채팅방 목록을 가져옴
export const loader = async (): Promise<GroupChatData[] | null> => {
  // 환경 변수에서 API URL 가져오기
  const apiURL = import.meta.env.VITE_API_URL;

  try {
    const response = await fetch(`${apiURL}/groupChats`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("그룹 채팅방 목록 조회 실패");
    }

    // resData는 GroupChat[] 타입
    const resData: { groupChats: GroupChatData[] } = await response.json();

    return resData.groupChats;
  } catch (error) {
    if (error instanceof Error) {
      console.error("에러 내용:", error.message);
    } else {
      console.error("알 수 없는 에러:", error);
    }

    alert(
      "그룹 채팅방 목록을 불러오는 중에 문제가 발생했습니다. 새로고침 후 다시 시도해 주세요."
    );

    // null을 반환하여 페이지에 데이터가 없음을 명시
    return null;
  }
};
