import useDirectChatStore from "../store/directChatStore";

interface DirectChatUserData {
  id: string;
  nickname: string;
  avatarColor: string | null;
  avatarImageUrl: string | null;
}

// 다이렉트 채팅방 ID를 조회하고, 없으면 새로 생성하여 반환
export const getDirectChatRoomId = async (
  payload: DirectChatUserData
): Promise<string> => {
  const { directChatForm } = useDirectChatStore.getState();
  const { id, nickname, avatarColor, avatarImageUrl } = payload;

  return await directChatForm(id, nickname, avatarColor, avatarImageUrl);
};
