import { Link, useNavigate } from "react-router-dom";
import { DirectChatProps } from "../../types";

import useDirectChatStore from "../../store/directChatStore";
import useSocketStore from "../../store/socketStore";

const DirectChat = ({
  _id,
  otherUserNickname,
  onlineChecked,
}: DirectChatProps) => {
  const navigate = useNavigate();

  const { getDirectChat, closeDirectChat } = useDirectChatStore();
  const { currentRoom } = useSocketStore();

  const closeDirectChatHandler = async (): Promise<void> => {
    await closeDirectChat(_id);
    await getDirectChat();

    if (currentRoom === _id) {
      navigate("/");
    }
  };

  return (
    <>
      <div>{onlineChecked ? "온라인" : "오프라인"}</div>
      <Link to={`${_id}`}>
        <div>{otherUserNickname}</div>
      </Link>
      <button onClick={closeDirectChatHandler}>닫기</button>
    </>
  );
};

export default DirectChat;
