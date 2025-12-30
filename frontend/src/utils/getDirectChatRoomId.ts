import useDirectChatStore from "../store/directChatStore";

interface DirectChatUserData {
  id: string;
  nickname: string;
  avatarColor: string | null;
  avatarImageUrl: string | null;
}

export const getDirectChatRoomId = async (
  payload: DirectChatUserData
): Promise<string> => {
  const { directChatForm } = useDirectChatStore.getState();
  const { id, nickname, avatarColor, avatarImageUrl } = payload;

  return await directChatForm(id, nickname, avatarColor, avatarImageUrl);
};
