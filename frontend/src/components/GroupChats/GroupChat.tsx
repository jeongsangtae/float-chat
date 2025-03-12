import { Link, useNavigate } from "react-router-dom";

import useGroupChatStore from "../../store/groupChatStore";
import useModalStore from "../../store/modalStore";

import { GroupChatData } from "../../types";

const GroupChat = ({ _id, title }: GroupChatData) => {
  const { deleteGroupChat } = useGroupChatStore();
  const { toggleModal } = useModalStore();
  const navigate = useNavigate();

  const groupChatDeleteHandler = async (): Promise<void> => {
    await deleteGroupChat(_id);

    navigate("/");
  };

  return (
    <>
      <Link to={`/group-chat/${_id.toString()}`}>{title}</Link>
      <button
        type="button"
        onClick={() => toggleModal("groupChatForm", "PATCH", { _id, title })}
      >
        수정
      </button>
      <button type="button" onClick={groupChatDeleteHandler}>
        삭제
      </button>
    </>
  );
};

export default GroupChat;
