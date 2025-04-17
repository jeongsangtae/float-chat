import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div>
      <h1>이 리소스를 찾을 수 없습니다</h1>
      <p>안타깝게도 이 리소스를 찾을 수 없습니다.</p>
      <Link to="/">
        <button>홈으로 돌아가기</button>
      </Link>
    </div>
  );
};

export default NotFound;
