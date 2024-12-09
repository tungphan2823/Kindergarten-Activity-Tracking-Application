import nonAva from "../assets/nonAva.jpg";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ParentAction from "../components/ParentAction";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EmailIcon from "@mui/icons-material/Email";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ChildProfile from "../components/ChildProfile";
import GuestAction from "../components/GuestAction";
import ManagerAction from "../components/ManagerAction";
import CaretakerAction from "../components/CaretakerAction";
import api from "../components/api";
interface UserPost {
  address: string;
  dateOfBirth: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  slug: string;
  username: string;
  _id: string;
}
interface Child {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  parentId: string;
  groupId: {
    _id: string;
    name: string;
    caretakerId: string;
  };
  gender: string;
}
const Home = () => {
  const [posts, setPosts] = useState<UserPost>();
  const [children, setChildren] = useState<Child[]>([]);
  const navigate = useNavigate();
  const handleSignOut = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get("/auth/posts");

        setPosts(response.data.userPosts);
        localStorage.setItem("userRole", response.data.userPosts.role);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      }
    };

    fetchPosts();
  }, []);
  console.log(posts);
  useEffect(() => {
    const fetchChildren = async (parentId: string) => {
      try {
        const response = await api.get(`/children/parent/${parentId}`); 
        setChildren(response.data);
      } catch (error) {
        console.error("Failed to fetch children:", error);
      }
    };

    if (posts && posts._id) {
      fetchChildren(posts._id); 
    }
  }, [posts]);
  console.log(children);
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) {
      return "Unknown Date";
    }
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="flex flex-col md:flex-row w-full md:w-3/4 max-w-5xl bg-white rounded-2xl shadow-lg overflow-hidden min-h-[600px]">
        {/* Left Sidebar - becomes top section on mobile */}
        <div className="flex flex-col items-center p-4 md:p-6 w-full md:w-1/3 bg-white border-b md:border-b-0 md:border-r rounded-t-3xl md:rounded-3xl shadow-lg relative">
          {/* Top Section with Blue Background */}
          <div className="w-full h-20 md:h-24 bg-blue-500 rounded-t-3xl"></div>

          {/* Avatar Positioned Between Sections */}
          <div className="absolute top-16 md:top-28 transform -translate-y-1/2">
            <img
              src={nonAva}
              alt="Profile"
              className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white"
            />
          </div>

          {/* User Information */}
          <div className="mt-12 md:mt-16 w-full">
            <h2 className="text-center text-xl md:text-2xl font-semibold p-2">
              {posts?.firstName} {posts?.lastName}
            </h2>
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center text-gray-800 p-2 text-sm md:text-base">
                <CalendarTodayIcon className="text-lg md:text-xl" />
                <span className="ml-2">{formatDate(posts?.dateOfBirth)}</span>
              </div>
              <div className="flex items-center text-gray-800 p-2 text-sm md:text-base">
                <LocalPhoneIcon className="text-lg md:text-xl" />
                <span className="ml-2">{posts?.phoneNumber}</span>
              </div>
              <div className="flex items-center text-gray-800 p-2 text-sm md:text-base">
                <LocationOnIcon className="text-lg md:text-xl" />
                <span className="ml-2 break-words">{posts?.address}</span>
              </div>
              <div className="flex items-center text-gray-800 p-2 text-sm md:text-base">
                <EmailIcon className="text-lg md:text-xl" />
                <span className="ml-2 break-words">{posts?.email}</span>
              </div>
            </div>
          </div>

          {/* Role Button */}
          <div className="mt-4">
            {posts?.role === "parent" && (
              <button className="bg-green-400 bg-opacity-80 text-white py-1.5 md:py-2 px-4 md:px-6 rounded-full text-sm md:text-base">
                {posts?.role}
              </button>
            )}
            {posts?.role === "manager" && (
              <button className="bg-blueM bg-opacity-50 text-textBlue py-1.5 md:py-2 px-4 md:px-6 rounded-full text-sm md:text-base">
                {posts?.role}
              </button>
            )}
            {posts?.role === "caretaker" && (
              <button className="bg-yellowGuest bg-opacity-50 text-yellowText py-1.5 md:py-2 px-4 md:px-6 rounded-full text-sm md:text-base">
                {posts?.role}
              </button>
            )}
            {posts?.role === "guest" && (
              <button className="bg-rose-300 bg-opacity-50 text-red-600 py-1.5 md:py-2 px-4 md:px-6 rounded-full text-sm md:text-base">
                {posts?.role}
              </button>
            )}
          </div>

          {/* Sign Out Button */}
          <button
            className="mt-4 md:mt-auto text-gray-500 hover:text-gray-700 flex items-center space-x-2 text-sm md:text-base"
            onClick={handleSignOut}
          >
            <span>Sign out</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-col w-full md:w-2/3 p-4 md:p-10 bg-gray-50">
          {/* Child Profile Card */}
          {posts?.role === "parent" && <ChildProfile child={children} />}

          {/* Action Buttons */}
          {posts?.role === "parent" && <ParentAction />}
          {posts?.role === "guest" && <GuestAction />}
          {posts?.role === "manager" && <ManagerAction />}
          {posts?.role === "caretaker" && <CaretakerAction />}
        </div>
      </div>
    </div>
  );
};

export default Home;
