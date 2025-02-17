import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../index";
import api from "../../components/api";

// Interface for User
interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  dateOfBirth: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  slug?: string;
}

// Interface for creating a new user
interface NewUser {
  username: string;
  password?: string;
  email?: string;
  role?: string;
  dateOfBirth?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
}

// Define the initial state using that type
interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
};

// Thunk for fetching all users
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/users");
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      } else {
        return rejectWithValue("An unknown error occurred");
      }
    }
  }
);

// Thunk for creating a new user
export const createUser = createAsyncThunk(
  "users/createUser",
  async (newUserData: NewUser, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post("/users", newUserData);
      dispatch(fetchUsers());
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      } else {
        return rejectWithValue("An unknown error occurred");
      }
    }
  }
);

// Thunk for fetching a user by slug
export const fetchUserBySlug = createAsyncThunk(
  "users/fetchUserBySlug",
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${slug}`);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      } else {
        return rejectWithValue("An unknown error occurred");
      }
    }
  }
);

// Thunk for fetching a user by ID
export const fetchUserById = createAsyncThunk(
  "users/fetchUserById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      } else {
        return rejectWithValue("An unknown error occurred");
      }
    }
  }
);

// Thunk for editing a user
export const editUser = createAsyncThunk(
  "users/editUser",
  async (
    { id, userData }: { id: string; userData: Partial<User> },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      dispatch(fetchUsers());
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      } else {
        return rejectWithValue("An unknown error occurred");
      }
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Users Cases
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create User Cases
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch User by Slug Cases
      .addCase(fetchUserBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserBySlug.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(
          (user) => user.slug === action.payload.slug
        );
        if (index === -1) {
          state.users.push(action.payload);
        } else {
          state.users[index] = action.payload;
        }
      })
      .addCase(fetchUserBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch User by ID Cases
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(
          (user) => user._id === action.payload.id
        );
        if (index === -1) {
          state.users.push(action.payload);
        } else {
          state.users[index] = action.payload;
        }
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Edit User Cases
      .addCase(editUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(
          (user) => user._id === action.payload._id
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(editUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export the reducer to be used in store configuration
export default usersSlice.reducer;

// Selectors
export const selectUsers = (state: RootState) => state.users.users;
export const selectLoading = (state: RootState) => state.users.loading;
export const selectError = (state: RootState) => state.users.error;
export const selectUserById = (state: RootState, userId: string) =>
  state.users.users.find((user) => user._id === userId);
