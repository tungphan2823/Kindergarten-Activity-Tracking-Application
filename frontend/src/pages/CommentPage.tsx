import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import nonAva from "../assets/nonAva.jpg";
import { useLocation } from "react-router-dom";
import Notify from "../components/NotifyProps";
import {
  fetchComments,
  createComment,
  editComment,
  selectComments,
  selectLoading,
  selectError,
} from "../store/slices/commentSlice";
import { fetchChildren, selectChildren } from "../store/slices/childrenSlice";
import { AppDispatch } from "../store/index";
import EditIcon from "@mui/icons-material/Edit";
import api from "../components/api";
interface NewComment {
  childId: string;
  //   caretakerId: string;
  content: string;
  rating: number;
}

interface Comment {
  _id: string;
  childId: {
    _id: string;
    firstName: string;
    lastName: string;
    groupId: string;
    parentId: string;
  };
  caretakerId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  content: string;
  date: string;
  rating: number;
}
interface CurrentUser {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  groupId: string[];
}
interface Child {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  parentId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  groupId: {
    _id: string;
    name: string;
    caretakerId: string;
  };
  gender: string;
}

const CommentPage = () => {
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [filteredChildren, setFilteredChildren] = useState<any[]>([]);
  const location = useLocation();
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });
  const { selectedChildId } = location.state || {};
  const [newComment, setNewComment] = useState<NewComment>({
    childId: "",

    content: "",
    rating: 1,
  });
  const [editData, setEditData] = useState({
    content: "",
    rating: 1,
  });

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const comments = useSelector(selectComments);
  const children = useSelector(selectChildren);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  useEffect(() => {
    if (selectedChildId && filteredChildren.length > 0) {
      const child = filteredChildren.find(
        (child) => child._id === selectedChildId
      );
      if (child) {
        setSelectedChild(child);
      }
    }
  }, [selectedChildId, filteredChildren]);

  useEffect(() => {
    dispatch(fetchChildren());
    dispatch(fetchComments());
  }, [dispatch]);
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get("/auth/posts");
        setCurrentUser(response.data.userPosts);
        dispatch(fetchChildren());
        dispatch(fetchComments());
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
  }, [dispatch]);
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };
  // useEffect(() => {
  //   if (children && currentUser) {
  //     const filteredData1 = children.filter(
  //       (child) => child.groupId.caretakerId === currentUser?._id
  //     );
  //     const filteredData2 = children.filter(
  //       (child) => child.parentId._id === currentUser?._id
  //     );
  //     if (currentUser?.role === "caretaker") {
  //       setFilteredChildren(filteredData1);
  //     } else if (currentUser?.role === "parent") {
  //       setFilteredChildren(filteredData2);
  //     }
  //   }
  // }, [children]);
  useEffect(() => {
    if (children && currentUser) {
      // @ts-ignore
      let filteredData = [];
      if (currentUser.role === "caretaker") {
        filteredData = children.filter(
          (child) => child.groupId.caretakerId === currentUser._id
        );
      } else if (currentUser.role === "parent") {
        filteredData = children.filter(
          (child) => child.parentId._id === currentUser._id
        );
      }
      // @ts-ignore
      setFilteredChildren(filteredData.reverse()); // Reverse the array
    }
  }, [children, currentUser]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedChild && currentUser) {
      try {
        dispatch(
          createComment({
            ...newComment,
            childId: selectedChild._id,
            caretakerId: currentUser._id,
          })
        );
        setNotification({
          show: true,
          message: "Comment created successfully!",
          type: "success",
        });
        setShowForm(false);
        setNewComment({
          childId: "",
          content: "",
          rating: 1,
        });
      } catch (error) {
        setNotification({
          show: true,
          message: "Failed to create comment. Please try again.",
          type: "error",
        });
      }
    }
  };

  const handleSubmitEditForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedComment) {
      try {
        dispatch(
          editComment({
            id: selectedComment._id,
            updatedData: editData,
          })
        );
        setNotification({
          show: true,
          message: "Comment updated successfully!",
          type: "success",
        });
        setShowEditForm(false);
        setSelectedComment(null);
        setEditData({
          content: "",
          rating: 1,
        });
      } catch (error) {
        setNotification({
          show: true,
          message: "Failed to update comment. Please try again.",
          type: "error",
        });
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const value =
      e.target.name === "rating" ? Number(e.target.value) : e.target.value;

    if (showEditForm) {
      setEditData({
        ...editData,
        [e.target.name]: value,
      });
    } else {
      setNewComment({
        ...newComment,
        [e.target.name]: value,
      });
    }
  };

  const filteredComments = comments.filter(
    (comment) => comment.childId._id === selectedChild?._id
  );

  return (
    <div className="relative min-h-screen p-2 sm:p-6">
      <Notify
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
      />
      {/* Back to Home Button */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-2 sm:top-4 left-2 sm:left-4 bg-gray-500 text-white py-1 sm:py-2 px-4 sm:px-6 rounded-full text-sm sm:text-base z-10"
      >
        Back to Home
      </button>

      {/* Main Card Container */}
      <div className="flex flex-col lg:flex-row w-full lg:w-3/4 max-w-5xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden mt-16 sm:mt-20 lg:mt-0">
        {/* Left Sidebar - List of Children */}
        <div className="w-full lg:w-1/3 bg-white border-b lg:border-r lg:border-b-0 p-4 sm:p-6 overflow-y-auto">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center">
            Children List
          </h2>
          <div className="max-h-[300px] lg:max-h-[500px] overflow-y-auto">
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : filteredChildren.length > 0 ? (
              filteredChildren.reverse().map((child) => (
                <div
                  key={child._id}
                  onClick={() => setSelectedChild(child)}
                  className={`p-3 sm:p-4 border-b cursor-pointer hover:bg-gray-200 ${
                    selectedChild?._id === child._id ? "bg-gray-200" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-4">
                    <img
                      src={nonAva}
                      alt={child.firstName}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">
                        {child.firstName} {child.lastName}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Group: {child.groupId.name}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No children found</p>
            )}
          </div>
        </div>

        {/* Right Side - Comments */}
        <div className="flex flex-col w-full lg:w-2/3 p-4 sm:p-6 bg-gray-50">
          {selectedChild ? (
            <>
              <div className="mb-4 flex items-center gap-3 sm:gap-4">
                <img
                  src={nonAva}
                  alt={selectedChild.firstName}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold">
                    {selectedChild.firstName} {selectedChild.lastName}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600">
                    Group: {selectedChild.groupId.name}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto mb-4 space-y-3 sm:space-y-4">
                {[...filteredComments].reverse().map((comment) => (
                  <div
                    key={comment._id}
                    className="p-3 sm:p-4 bg-white rounded-lg shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-sm sm:text-base">
                          {comment.caretakerId.firstName}{" "}
                          {comment.caretakerId.lastName}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {formatDate(comment.date)}
                        </p>
                      </div>
                      {currentUser?.role === "caretaker" && (
                        <EditIcon
                          onClick={() => {
                            setShowEditForm(true);
                            setSelectedComment(comment);
                            setEditData({
                              content: comment.content,
                              rating: comment.rating,
                            });
                          }}
                          className="cursor-pointer text-blue-500 text-base sm:text-xl"
                        />
                      )}
                    </div>
                    <p className="text-gray-700 mb-2 text-sm sm:text-base">
                      {comment.content}
                    </p>
                    <div className="text-yellow-400 text-sm sm:text-base">
                      {"⭐".repeat(comment.rating)}
                    </div>
                  </div>
                ))}
              </div>

              {!showForm &&
                !showEditForm &&
                currentUser?.role === "caretaker" && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-500 text-white py-2 px-6 rounded-full w-full sm:w-auto text-sm sm:text-base"
                  >
                    Add Comment
                  </button>
                )}

              {showForm && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-center mb-4">
                    Add New Comment
                  </h2>
                  <textarea
                    name="content"
                    value={newComment.content}
                    onChange={handleInputChange}
                    placeholder="Comment content"
                    className="w-full p-2 sm:p-3 border rounded min-h-[100px] text-sm sm:text-base"
                    required
                  />
                  <select
                    name="rating"
                    value={newComment.rating}
                    onChange={handleInputChange}
                    className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {"⭐".repeat(num)}
                      </option>
                    ))}
                  </select>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <button
                      type="submit"
                      className="bg-green-500 text-white py-2 px-6 rounded-full w-full sm:w-auto text-sm sm:text-base"
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="bg-red-500 text-white py-2 px-6 rounded-full w-full sm:w-auto text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {showEditForm && (
                <form onSubmit={handleSubmitEditForm} className="space-y-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-center mb-4">
                    Edit Comment
                  </h2>
                  <textarea
                    name="content"
                    value={editData.content}
                    onChange={handleInputChange}
                    placeholder="Comment content"
                    className="w-full p-2 sm:p-3 border rounded min-h-[100px] text-sm sm:text-base"
                    required
                  />
                  <select
                    name="rating"
                    value={editData.rating}
                    onChange={handleInputChange}
                    className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {"⭐".repeat(num)}
                      </option>
                    ))}
                  </select>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <button
                      type="submit"
                      className="bg-green-500 text-white py-2 px-6 rounded-full w-full sm:w-auto text-sm sm:text-base"
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditForm(false)}
                      className="bg-red-500 text-white py-2 px-6 rounded-full w-full sm:w-auto text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-500">
                Select a child to view comments
              </h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default CommentPage;
