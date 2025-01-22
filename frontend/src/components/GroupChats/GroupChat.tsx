import useGroupChatStore from "../../store/groupChatStore";
import useModalStore from "../../store/modalStore";

import { GroupChatData } from "../../types";

const GroupChat = ({ _id, title }: GroupChatData) => {
  const { deleteGroupChat } = useGroupChatStore();
  const { toggleModal } = useModalStore();

  const groupChatDeleteHandler = async (): Promise<void> => {
    await deleteGroupChat(_id);
  };

  return (
    <div>
      {title}
      <button
        type="button"
        onClick={() => toggleModal("groupChatForm", "PATCH", { _id, title })}
      >
        수정
      </button>
      <button type="button" onClick={groupChatDeleteHandler}>
        삭제
      </button>
    </div>
  );
};

export default GroupChat;
