import { ASSETS_URL } from "../constants";
import { apiSlice } from "./apiSlice";
export const assetApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategory: builder.query({
      query: () => ({
        url: ASSETS_URL + "/categories",
        method: "GET",
      }),
    }),
    getAsset: builder.query({
      query: () => ({
        url: ASSETS_URL + "/assets",
        method: "GET",
      }),
    }),
    getAssetByAcademy: builder.query({
      query: (academyId) => ({
        url: `${ASSETS_URL}/assets/academy/${academyId}`,
        method: "GET",
      }),
    }),
    postAsset: builder.mutation({
      query: (newAsset) => ({
        url: ASSETS_URL + "/assets", // API endpoint for posting assets
        method: "POST",
        body: newAsset, // Send the new asset data as the request body
      }),
    }),
    postUploadImages: builder.mutation({
      query: (formData) => {
        return {
          url: `${ASSETS_URL}/assets/${formData.get("assetID")}/upload-images`, // Get assetID from formData
          method: "POST",
          body: formData,
        };
      },
    }),
    uploadExcel: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: ASSETS_URL + "/assets/upload/excel",
          method: "POST",
          body: formData,
        };
      },
    }),
    postCategory: builder.mutation({
      query: (newCategory) => ({
        url: ASSETS_URL + "/categories", // API endpoint for posting assets
        method: "POST",
        body: newCategory, // Send the new asset data as the request body
      }),
    }),
    updateCategory: builder.mutation({
      query: ({ id, updatedCategory }) => ({
        url: `${ASSETS_URL}/categories/${id}`,
        method: 'PUT',
        body: updatedCategory,
      }),
    }),
    softDeleteCategory: builder.mutation({
      query: (id) => ({
        url: `${ASSETS_URL}/categories/${id}/delete`,
        method: 'PUT',
      }),
      invalidatesTags: ['Category'],
    }),
    updateAssetStatus: builder.mutation({
      query: (data) => ({
        url: ASSETS_URL + '/assets/update-status',
        method: 'POST',
        body: data,
      }),
    }),
    requestDispose: builder.mutation({
      query: (data) => ({
        url: ASSETS_URL + '/assets/request-dispose',
        method: 'POST',
        body: data
      }),
    }),
    handleAssetDeletion: builder.mutation({
      query: ({ assetCode, email, action }) => ({
        url: ASSETS_URL + '/assets/handle-deletion',
        method: 'POST',
        body: { assetCode, email, action },
      }),
    }),
    updateAsset: builder.mutation({
      query: ({ assetCode, assetData }) => ({
        url: `${ASSETS_URL}/assets/${assetCode}`,
        method: 'PUT',
        body: assetData,
      }),
      invalidatesTags: ['Asset'],
    }),
  }),
});

export const {
  useGetCategoryQuery,
  useGetAssetQuery,
  useGetAssetByAcademyQuery,
  usePostAssetMutation,
  usePostUploadImagesMutation,
  useUploadExcelMutation,
  usePostCategoryMutation,
  useUpdateCategoryMutation,
  useSoftDeleteCategoryMutation,
  useUpdateAssetStatusMutation,
  useRequestDisposeMutation,
  useHandleAssetDeletionMutation,
  useUpdateAssetMutation
} = assetApiSlice;
