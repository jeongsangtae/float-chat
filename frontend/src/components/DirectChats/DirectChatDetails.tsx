import { useParams } from "react-router-dom";

const DirectChatDetails = () => {
  const { roomId } = useParams<{ roomId: string }>();

  console.log(roomId);
  return (
    <>
      <div>{roomId}</div>
    </>
  );
};

export default DirectChatDetails;
