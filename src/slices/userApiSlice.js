import { USERS_URL } from "../constants";
import { apiSlice } from "./apiSlice";
export const usersApliSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: USERS_URL + "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
  }),
});

export const { useLoginMutation } = usersApliSlice;
