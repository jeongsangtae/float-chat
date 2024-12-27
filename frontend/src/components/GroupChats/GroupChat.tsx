import { GroupChatData } from "../../types";

const GroupChat = ({ _id, title }: GroupChatData) => {
  const apiURL = import.meta.env.VITE_API_URL;

  console.log(_id);

  const groupChatDeleteHandler = async (): Promise<void> => {
    try {
      const response = await fetch(`${apiURL}/groupChat/${_id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`그룹 채팅방 삭제 실패`);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("에러 내용:", error.message);
      } else {
        console.error("알 수 없는 에러:", error);
      }

      alert(
        "그룹 채팅방을 삭제하는 중에 문제가 발생했습니다. 새로고침 후 다시 시도해 주세요."
      );
    }
  };

  return (
    <div>
      {title}
      <button type="button" onClick={groupChatDeleteHandler}>
        삭제
      </button>
    </div>
  );
};

export default GroupChat;
