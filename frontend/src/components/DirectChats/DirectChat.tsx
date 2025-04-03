import { Link } from "react-router-dom";
import { DirectChatProps } from "../../types";

const DirectChat = ({ _id, otherUserNickname }: DirectChatProps) => {
  return (
    <>
      <div>다이렉트 채팅방 _id: {_id}</div>
      <Link to={`${_id}`}>
        <div>다른 사용자 닉네임: {otherUserNickname}</div>
      </Link>
    </>
  );
};

export default DirectChat;
