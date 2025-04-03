import { DirectChatProps } from "../../types";

const DirectChat = ({ _id, otherUserNickname }: DirectChatProps) => {
  return (
    <>
      <div>다이렉트 채팅방 _id: {_id}</div>
      <div>다른 사용자 닉네임: {otherUserNickname}</div>
    </>
  );
};

export default DirectChat;
