import { USERS_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: USERS_URL + "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),

    forgotPassword: builder.mutation({
      query: (email) => ({
        url: USERS_URL + "/users/forgot-password",
        method: "POST",
        body: { email },
      }),
    }),

    verifyOtp: builder.mutation({
      query: ({ email, otp }) => ({
        url: USERS_URL + "/users/verify-otp",
        method: "POST",
        body: { email, otp },
      }),
    }),

    resendOtp: builder.mutation({
      query: (email) => ({
        url: USERS_URL + "/users/resend-otp",
        method: "POST",
        body: { email },
      }),
    }),

    resetPassword: builder.mutation({
      query: ({ email, otp, newPassword }) => ({
        url: USERS_URL + "/users/reset-password",
        method: "POST",
        body: { email, otp, newPassword },
      }),
    }),

    postAcademy: builder.mutation({
      query: (formData) => ({
        url: USERS_URL + "/academies",
        method: "POST",
        body: formData,
      }),
    }),

    getAcademy: builder.query({
      query: () => ({
        url: USERS_URL + "/academies",
        method: "GET",
      }),
      providesTags: ["Academy"],
    }),

    // Get department
    getDepartment: builder.query({
      query: () => ({
        url: USERS_URL + "/departments",
        method: "GET",
      }),
      providesTags: ["Departments"],
    }),

    // Post Department
    createDepartment: builder.mutation({
      query: (departmentData) => ({
        url: USERS_URL + "/departments",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(departmentData),
      }),
    }),

    // updateAcademy: builder.mutation({
    //   query: ({ academyId, name, location, description, image }) => {
    //     const formData = new FormData();
    //     formData.append("name", name);
    //     formData.append("location", location);
    //     formData.append("description", description);
    //     if (image) {
    //       formData.append("image", image);
    //     }

    //     return {
    //       url: `${USERS_URL}/academies/${academyId}`,
    //       method: "PUT",
    //       body: formData,
    //     };
    //   },
    // }),

    updateAcademy: builder.mutation({
      query: ({ academyId, name, location, description, image }) => {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("location", location);
        formData.append("description", description);
    
        // Only append image if it's a File object (and not null or a string)
        if (image instanceof File) {
          formData.append("image", image);
        }
    
        return {
          url: `${USERS_URL}/academies/${academyId}`,
          method: "PUT",
          body: formData,
        };
      },
    }),

    // Delete Academy
    deleteAcademy: builder.mutation({
      query: (id) => ({
        url: USERS_URL + `/academies/${id}`,
        method: "DELETE",
      }),
    }),

    getUsers: builder.query({
      query: () => ({
        url: USERS_URL + "/users",
        method: "GET",
      }),
      providesTags: ["users"],
    }),

    createUser: builder.mutation({
      query: (userData) => {
        const formData = new FormData();
        formData.append("email", userData.email);
        formData.append("password", userData.password);
        formData.append("name", userData.name);
        formData.append("academyId", userData.academyId); // Ensure academyId is appended
        formData.append("departmentId", userData.departmentId); // departmentId should be appended if available
        formData.append("roleId", userData.roleId);

        if (userData.image) {
          formData.append("image", userData.image);
        }

        return {
          url: USERS_URL + "/users",
          method: "POST",
          body: formData,
        };
      },
    }),

    getUserByEmail: builder.query({
      query: (email) => ({
        url: `${USERS_URL}/users/email`,
        method: "GET",
        params: { email },
      }),
    }),

    updateUserImage: builder.mutation({
      query: ({ email, image }) => {
        const formData = new FormData();
        formData.append("email", email);
        if (image) {
          formData.append("image", image);
        }
        return {
          url: USERS_URL + "/users/image",
          method: "PUT",
          body: formData,
        };
      },
    }),

    changePassword: builder.mutation({
      query: ({ email, oldPassword, newPassword }) => ({
        url: USERS_URL + "/users/change-password",
        method: "PUT",
        body: { email, oldPassword, newPassword },
      }),
    }),

    logout: builder.mutation({
      query: () => ({
        url: USERS_URL + "/auth/logout",
        method: "POST",
      }),
    }),

    getAllAcademies: builder.query({
      query: () => ({
        url: USERS_URL + "/academies",
        method: "GET",
      }),
    }),

    getAllDepartments: builder.query({
      query: () => ({
        url: USERS_URL + "/departments",
        method: "GET",
      }),
    }),

    getAcademyById: builder.query({
      query: (id) => ({
        url: `${USERS_URL}/academies/${id}`,
        method: "GET",
      }),
    }),

    getDepartmentById: builder.query({
      query: (id) => ({
        url: `${USERS_URL}/departments/${id}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useResetPasswordMutation,
  usePostAcademyMutation,
  useGetAcademyQuery,
  useDeleteAcademyMutation,
  useUpdateAcademyMutation,
  useCreateUserMutation,
  useGetDepartmentQuery,
  useCreateDepartmentMutation,
  useGetUsersQuery,
  useGetUserByEmailQuery,
  useUpdateUserImageMutation,
  useChangePasswordMutation,
  useLogoutMutation,
  useGetAcademyByIdQuery,
  useGetDepartmentByIdQuery,
} = usersApiSlice;
