import { Link, useNavigate } from "react-router-dom";

import useAuthStore from "../../store/authStore";
import useGroupChatStore from "../../store/groupChatStore";
import useModalStore from "../../store/modalStore";

import { GroupChatData } from "../../types";

const GroupChat = ({ _id, hostId, title }: GroupChatData) => {
  const { userInfo } = useAuthStore();
  const { deleteGroupChat, leaveGroupChat } = useGroupChatStore();
  const { toggleModal } = useModalStore();
  const navigate = useNavigate();

  const groupChatDeleteHandler = async (): Promise<void> => {
    await deleteGroupChat(_id);

    navigate("/");
  };

  const groupChatLeaveHandler = async (): Promise<void> => {
    await leaveGroupChat(_id);

    navigate("/");
  };

  return (
    <>
      <Link to={`/group-chat/${_id.toString()}`}>{title}</Link>
      {hostId === userInfo?._id ? (
        <>
          <button
            type="button"
            onClick={() =>
              toggleModal("groupChatForm", "PATCH", { _id, title })
            }
          >
            수정
          </button>
          <button type="button" onClick={groupChatDeleteHandler}>
            삭제
          </button>
        </>
      ) : (
        <>
          <button type="button" onClick={groupChatLeaveHandler}>
            나가기
          </button>
        </>
      )}
    </>
  );
};

export default GroupChat;
