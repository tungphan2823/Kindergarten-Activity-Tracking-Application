
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../store/index";
import { fetchUsers, selectUsers } from "../store/slices/userSlice";
import api from "../components/api";
import { useNavigate } from "react-router-dom";
interface CurrentUser {
  _id: string;
  role: string;
  firstName: string;
  lastName: string;
}

interface Child {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  groupId: {
    _id: string;
    name: string;
    caretakerId: string;
  };
  parentId: string;
  __v: number;
}

interface CaretakerContact {
  groupName: string;
  caretaker: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  children: Child[];
}

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [myManager, setMyManager] = useState<any[]>([]);
  const users = useSelector(selectUsers);
  useEffect(() => {
    if (users) {
      const managers = users.filter((user) => user.role === "manager");
      setMyManager(managers);
    }
  }, [users]);
  console.log(myManager);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const [myChildren, setMyChildren] = useState<Child[]>([]);
  const [caretakerContacts, setCaretakerContacts] = useState<
    CaretakerContact[]
  >([]);
  // @ts-expect-error
  const [loading, setLoading] = useState(true);
  // @ts-expect-error
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get("/auth/posts");
        setCurrentUser(response.data.userPosts);
      } catch (error) {
        console.error("Error fetching current user:", error);
        setError("Failed to fetch user information");
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchChildren = async (parentId: string) => {
      try {
        const response = await api.get(`/children/parent/${parentId}`);
        setMyChildren(response.data);
        await processCaretakerContacts(response.data);
      } catch (error) {
        console.error("Failed to fetch children:", error);
        setError("Failed to fetch children information");
      }
    };

    if (currentUser?._id) {
      fetchChildren(currentUser._id);
    }
  }, [currentUser]);

  const processCaretakerContacts = async (children: Child[]) => {
    try {
      const contactsMap = new Map<string, CaretakerContact>();

      for (const child of children) {
        const { groupId } = child;

        if (!contactsMap.has(groupId.caretakerId)) {
          try {
            const caretakerResponse = await api.get(
              `/users/${groupId.caretakerId}`
            );
            contactsMap.set(groupId.caretakerId, {
              groupName: groupId.name,
              caretaker: {
                _id: groupId.caretakerId,
                firstName: caretakerResponse.data.firstName,
                lastName: caretakerResponse.data.lastName,
                email: caretakerResponse.data.email,
                phoneNumber: caretakerResponse.data.phoneNumber || "",
              },
              children: [child],
            });
          } catch (error) {
            console.error(
              `Failed to fetch caretaker info for ID ${groupId.caretakerId}:`,
              error
            );
          }
        } else {
          const existingContact = contactsMap.get(groupId.caretakerId);
          if (existingContact) {
            existingContact.children.push(child);
          }
        }
      }

      setCaretakerContacts(Array.from(contactsMap.values()));
    } catch (error) {
      console.error("Failed to process caretaker contacts:", error);
      setError("Failed to process caretaker information");
    } finally {
      setLoading(false);
    }
  };

  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-xl text-gray-600">Loading...</div>
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-xl text-red-600">{error}</div>
  //     </div>
  //   );
  // }

  // if (!currentUser || currentUser.role !== "parent") {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-xl text-gray-600">
  //         This page is only accessible to parents.
  //       </div>
  //     </div>
  //   );
  // }

  // if (caretakerContacts.length === 0) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-xl text-gray-600">
  //         No caretaker contacts available.
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="  relative min-h-screen p-2 sm:p-6">
      <button
        onClick={() => navigate("/")}
        className=" top-2 sm:top-4 left-2 sm:left-4 bg-gray-500 text-white py-1 sm:py-2 px-4 sm:px-6 rounded-full text-sm sm:text-base z-10"
      >
        Back to Home
      </button>
      <div className="w-full max-w-7xl mx-auto bg-gray-50 p-4 sm:p-6 lg:p-8 rounded-lg">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-4 sm:mb-8">
          Contacts
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {currentUser?.role === "parent" &&
            myChildren.map((child) => {
              const contact = caretakerContacts.find(
                (c) => c.caretaker._id === child.groupId.caretakerId
              );
              return (
                contact && (
                  <div
                    key={child._id}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 w-full"
                  >
                    <div className="bg-blue-500 px-4 sm:px-6 py-3 sm:py-4">
                      <h2 className="text-lg sm:text-xl font-semibold text-white truncate">
                        {child.firstName} {child.lastName}
                      </h2>
                    </div>
                    <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                      <div className="space-y-1 sm:space-y-2">
                        <div className="text-gray-600 text-xs sm:text-sm">
                          Caretaker
                        </div>
                        <div className="text-gray-800 font-medium text-sm sm:text-base">
                          {`${contact.caretaker.firstName} ${contact.caretaker.lastName}`}
                        </div>
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <div className="text-gray-600 text-xs sm:text-sm">
                          Email
                        </div>
                        <div className="text-gray-800 text-sm sm:text-base break-words">
                          {contact.caretaker.email}
                        </div>
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <div className="text-gray-600 text-xs sm:text-sm">
                          Phone
                        </div>
                        <div className="text-gray-800 text-sm sm:text-base">
                          {contact.caretaker.phoneNumber || "Not provided"}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              );
            })}

          {myManager &&
            myManager.map((contact) => (
              <div
                key={contact._id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 w-full"
              >
                <div className="bg-purple-600 px-4 sm:px-6 py-3 sm:py-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-white">
                    Manager
                  </h2>
                </div>

                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="space-y-1 sm:space-y-2">
                    <div className="text-gray-600 text-xs sm:text-sm">Name</div>
                    <div className="text-gray-800 font-medium text-sm sm:text-base">
                      {`${contact.firstName} ${contact.lastName}`}
                    </div>
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <div className="text-gray-600 text-xs sm:text-sm">
                      Email
                    </div>
                    <div className="text-gray-800 text-sm sm:text-base break-words">
                      {contact.email}
                    </div>
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <div className="text-gray-600 text-xs sm:text-sm">
                      Phone
                    </div>
                    <div className="text-gray-800 text-sm sm:text-base">
                      {contact.phoneNumber || "Not provided"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
