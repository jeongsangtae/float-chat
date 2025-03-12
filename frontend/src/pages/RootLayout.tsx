import { Outlet, Link } from "react-router-dom";
// import MainHeader from "../components/Layout/MainHeader";
import SideBar from "../components/Layout/SideBar";

const RootLayout = () => {
  return (
    <>
      <Link to={`/`}>아이콘 들어갈 위치</Link>
      <Outlet />
      <SideBar />
      {/* <MainHeader /> */}
    </>
  );
};

export default RootLayout;
