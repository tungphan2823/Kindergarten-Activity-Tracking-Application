import { useNavigate } from "react-router-dom";
const ManagerAction = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        className="flex flex-col items-center justify-center p-6 bg-green-200 rounded-lg shadow-md"
        onClick={() => {
          navigate("/child");
        }}
      >
        <span className="text-2xl font-semibold text-green-700">+</span>
        <span className="mt-2 text-gray-700 font-semibold">Create Child</span>
      </button>
      <button
        className="flex flex-col items-center justify-center p-6 bg-yellow-200 rounded-lg shadow-md"
        onClick={() => {
          navigate("/users");
        }}
      >
        <span className="text-2xl font-semibold text-yellow-700">👤</span>
        <span className="mt-2 text-gray-700 font-semibold">Users</span>
      </button>
      <button
        className="flex flex-col items-center justify-center p-6 bg-red-200 rounded-lg shadow-md"
        onClick={() => {
          navigate("/groups");
        }}
      >
        <span className="text-2xl font-semibold text-red-700">👥+</span>
        <span className="mt-2 text-gray-700 font-semibold">Create Group</span>
      </button>
      <button
        className="flex flex-col items-center justify-center p-6 bg-blue-200 rounded-lg shadow-md"
        onClick={() => {
          navigate("/child");
        }}
      >
        <span className="text-2xl font-semibold text-blue-700">👤</span>
        <span className="mt-2 text-gray-700 font-semibold">Children</span>
      </button>
      <button
        className="flex flex-col items-center justify-center p-6 bg-pink-200 rounded-lg shadow-md"
        onClick={() => {
          navigate("/groups");
        }}
      >
        <span className="text-2xl font-semibold text-pink-700">👥</span>
        <span className="mt-2 text-gray-700 font-semibold">Groups</span>
      </button>
      <button
        className="flex flex-col items-center justify-center p-6 bg-green-300 rounded-lg shadow-md"
        onClick={() => {
          navigate("/events");
        }}
      >
        <span className="text-2xl font-semibold text-red-700">🎫</span>
        <span className="mt-2 text-gray-700 font-semibold">
          Events
        </span>
      </button>
    </div>
  );
};

export default ManagerAction;
