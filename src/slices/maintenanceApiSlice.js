import { MAINTENANCE_URL } from "../constants";
import { apiSlice } from "./apiSlice";
export const maintenanceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    postRepairRequest: builder.mutation({
      query: (requestData) => ({
        url: MAINTENANCE_URL + "/repairs", // API endpoint for posting assets
        method: "POST",
        body: requestData, // Send the new asset data as the request body
      }),
    }),
    // postRepairSchedule: builder.mutation({
    //   query: () => ({
    //     url: MAINTENANCE_URL + "/schedules", // API endpoint for posting assets
    //     method: "POST",
    //   }),
    // }),
    postRepairSchedule: builder.mutation({
      query: (scheduleData) => ({
        url: MAINTENANCE_URL + "/schedules",
        method: "POST",
        body: scheduleData,
        headers: {
          "Content-Type": "application/json", // make sure backend expects JSON
        },
      }),

    }),

    assignRepair: builder.mutation({
      query: ({ repairId, email }) => ({
        url: `${MAINTENANCE_URL}/repairs/schedule/${repairId}`,
        method: "PUT",
        // body: { email },
        // headers: {
        //   "Content-Type": "application/json",
        body: JSON.stringify({ email }),
        headers: {
          "Content-Type": "application/json",
        },
        responseHandler: (response) => response.text(),
        // },
      }),
      invalidatesTags: ["MaintenanceRequest"],

    }),


    // get repir resquest
    getRepairRequest: builder.query({
      query: () => ({
        url: MAINTENANCE_URL + "/repairs",
        method: 'GET',
      }),
      providesTags: ["repair"]
    }),

    // get MAINTENANCE resquest
    getMaintenanceRequest: builder.query({
      query: () => ({
        url: MAINTENANCE_URL + "/maintenance",
        method: 'GET',
      }),
      providesTags: ["maintenance"]
    }),

    // GET All Repair Reports
    getRepairReports: builder.query({
      query: () => ({
        url: MAINTENANCE_URL + "/repair-reports",
        method: "GET",
      }),
      transformResponse: (response) => response, // Optional, if no nesting like { data: [...] }
      providesTags: ["RepairReports"],
    }),

    // GET All maintenance Reports
    getMaintenanceReports: builder.query({
      query: () => ({
        url: MAINTENANCE_URL + "/maintenance-reports",
        method: "GET",
      }),
      transformResponse: (response) => response, // Optional, if no nesting like { data: [...] }
      providesTags: ["maintenanceReports"],
    }),

    acceptOrRejectRepairRequest: builder.mutation({
      query: ({ repairId, accept }) => ({
        url: `${MAINTENANCE_URL}/repairs/${repairId}/accept`,
        method: "PUT",
        body: JSON.stringify({ accept }),
        headers: {
          "Content-Type": "application/json",
        },
        responseHandler: (response) => response.text(), // 👈 Tell it to handle text
      }),
      invalidatesTags: ["RepairRequest"],
    }),

    updatePreventiveMaintenance: builder.mutation({
      query: ({ id, maintenance }) => ({
        url: `${MAINTENANCE_URL}/maintenance/${id}`,
        method: "PUT",
        body: maintenance,
      }),
      invalidatesTags: ["maintenance"], // optional: useful for refetch
    }),

  }),
});

export const {
  usePostRepairRequestMutation,
  usePostRepairScheduleMutation,
  useAssignRepairMutation,
  useGetRepairRequestQuery,
  useGetMaintenanceRequestQuery,
  useAcceptOrRejectRepairRequestMutation,
  useUpdatePreventiveMaintenanceMutation,
  useGetRepairReportsQuery,
  useGetMaintenanceReportsQuery,
} = maintenanceApiSlice;
