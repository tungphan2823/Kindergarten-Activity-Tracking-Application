
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../index";
import api from "../../components/api";


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


interface NewComment {
  childId: string;
  caretakerId: string;
  content: string;
  rating: number;
}

interface CommentsState {
  comments: Comment[];
  loading: boolean;
  error: string | null;
}

const initialState: CommentsState = {
  comments: [],
  loading: false,
  error: null,
};

export const fetchComments = createAsyncThunk<
  Comment[],
  { childId?: string; caretakerId?: string } | undefined,
  { rejectValue: string }
>("comments/fetchComments", async (filters, { rejectWithValue }) => {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.childId) queryParams.append("childId", filters.childId);
    if (filters?.caretakerId)
      queryParams.append("caretakerId", filters.caretakerId);

    const response = await api.get(`/comments?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("An unknown error occurred");
  }
});

export const createComment = createAsyncThunk<
  Comment,
  NewComment,
  { rejectValue: string }
>(
  "comments/createComment",
  async (newCommentData, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post("/comments", newCommentData);
      dispatch(fetchComments());
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const editComment = createAsyncThunk<
  Comment,
  { id: string; updatedData: Pick<NewComment, "content" | "rating"> },
  { rejectValue: string }
>(
  "comments/editComment",
  async ({ id, updatedData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.put(`/comments/${id}`, updatedData);
      dispatch(fetchComments());
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      
      .addCase(createComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      
      .addCase(editComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editComment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.comments.findIndex(
          (comment) => comment._id === action.payload._id
        );
        if (index !== -1) {
          state.comments[index] = action.payload;
        }
      })
      .addCase(editComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default commentsSlice.reducer;


export const selectComments = (state: RootState) => state.comments.comments;
export const selectLoading = (state: RootState) => state.comments.loading;
export const selectError = (state: RootState) => state.comments.error;


export const selectCommentsByChildId =
  (childId: string) => (state: RootState) =>
    state.comments.comments.filter(
      (comment) => comment.childId._id === childId
    );

export const selectCommentsByCaretakerId =
  (caretakerId: string) => (state: RootState) =>
    state.comments.comments.filter(
      (comment) => comment.caretakerId._id === caretakerId
    );
