import useGroupChatStore from "../../store/groupChatStore";

import { GroupChatData } from "../../types";

const GroupChat = ({ _id, title }: GroupChatData) => {
  // const apiURL = import.meta.env.VITE_API_URL;

  const { deleteGroupChat } = useGroupChatStore();

  // console.log(_id);

  const groupChatDeleteHandler = async (): Promise<void> => {
    await deleteGroupChat(_id);
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
