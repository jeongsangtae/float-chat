import useGroupChatStore from "../../store/groupChatStore";

import { GroupChatData, ModalProps } from "../../types";

type GroupChatProps = GroupChatData & ModalProps;

const GroupChat = ({ _id, title, onToggle }: GroupChatProps) => {
  // const apiURL = import.meta.env.VITE_API_URL;

  const { deleteGroupChat } = useGroupChatStore();

  // console.log(_id);

  const groupChatDeleteHandler = async (): Promise<void> => {
    await deleteGroupChat(_id);
  };

  // const groupChatTitleEditHandler = async (): Promise<void> => {};

  return (
    <div>
      {title}
      <button type="button" onClick={onToggle}>
        수정
      </button>
      <button type="button" onClick={groupChatDeleteHandler}>
        삭제
      </button>
    </div>
  );
};

export default GroupChat;
