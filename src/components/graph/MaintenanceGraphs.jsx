import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";
import "./../../pages/adminPages/css/MintenanceGraphs.css";
import Select from "react-select";
import {
  useGetAllCombinedMaintenanceCostQuery,
  useGetAverageResponseTimeQuery,
} from "../../slices/maintenanceApiSlice";
import { useGetAcademyQuery } from "../../slices/userApiSlice";
import Swal from "sweetalert2";

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MaintenanceGraphs = () => {
  const [selectedAcademy, setSelectedAcademy] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const {
    data: maintenanceData,
    isLoading: loadingMaintenance,
    error: errorMaintenance,
  } = useGetAllCombinedMaintenanceCostQuery();

  const {
    data: academies,
    isLoading: loadingAcademies,
    error: errorAcademies,
  } = useGetAcademyQuery();

  const {
    data: responseTimeData,
    isLoading: loadingResponse,
    error: errorResponse,
  } = useGetAverageResponseTimeQuery();

  const isLoadingAll =
    loadingAcademies || loadingMaintenance || loadingResponse;
  const hasError = errorAcademies || errorMaintenance || errorResponse;

  useEffect(() => {
    if (isLoadingAll) {
      Swal.fire({
        title: "Loading graphs...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
    } else if (Swal.isVisible()) {
      Swal.close();
    }

    if (hasError) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load data from server.",
      });
    }

    return () => {
      if (Swal.isVisible()) Swal.close();
    };
  }, [isLoadingAll, hasError]);

  const validAcademyIds = useMemo(() => {
    return new Set((academies || []).map((a) => a.academyId));
  }, [academies]);

  const filteredMaintenanceData = useMemo(() => {
    if (!maintenanceData) return [];
    return maintenanceData.filter(
      (item) => item.academyId && validAcademyIds.has(item.academyId)
    );
  }, [maintenanceData, validAcademyIds]);

  const academyIdToName = useMemo(() => {
    return (academies || []).reduce((acc, curr) => {
      acc[curr.academyId] = curr.name;
      return acc;
    }, {});
  }, [academies]);

  const academyData = useMemo(() => {
    return filteredMaintenanceData.reduce((acc, curr) => {
      const { academyId, year, month, totalCost } = curr;
      const academyName = academyIdToName[academyId];
      if (!acc[academyId]) acc[academyId] = { name: academyName, years: {} };
      if (!acc[academyId].years[year])
        acc[academyId].years[year] = Array(12).fill(0);
      acc[academyId].years[year][month - 1] += totalCost;
      return acc;
    }, {});
  }, [filteredMaintenanceData, academyIdToName]);

  // Always called - safe hook usage
  useEffect(() => {
    if (
      academies &&
      academies.length > 0 &&
      !selectedAcademy
    ) {
      setSelectedAcademy(academies[0].academyId);
    }
  }, [academies, selectedAcademy]);

  // 🆕 Combine years from maintenance + response time
  const allYears = useMemo(() => {
    const yearsSet = new Set();

    // From maintenance data
    if (academyData[selectedAcademy]) {
      Object.keys(academyData[selectedAcademy].years).forEach((year) =>
        yearsSet.add(year)
      );
    }

    // From response time data
    (responseTimeData || []).forEach((entry) => {
      if (entry.academyId === selectedAcademy) {
        yearsSet.add(String(entry.year));
      }
    });

    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [selectedAcademy, academyData, responseTimeData]);

  useEffect(() => {
    if (selectedAcademy && allYears.length > 0) {
      setSelectedYear(allYears[0]); // Auto-select the first available year
    }
  }, [selectedAcademy, allYears]);

  
  if (isLoadingAll || !academies || !maintenanceData || !responseTimeData) {
    return <div></div>;
  }

  const selectedAcademyData = academyData[selectedAcademy];
  const selectedYearCostData =
    selectedAcademyData?.years[selectedYear] || Array(12).fill(0);

  const filteredResponseTime = (responseTimeData || []).filter(
    (entry) =>
      entry.academyId === selectedAcademy &&
      String(entry.year) === String(selectedYear)
  );

  const responseTimePerMonth = Array(12).fill(null);
  filteredResponseTime.forEach((entry) => {
    responseTimePerMonth[entry.month - 1] = entry.averageResponseTimeHours;
  });

  const mappedData = months.map((month, index) => ({
    month,
    cost: selectedYearCostData[index],
    responseTime: responseTimePerMonth[index] ?? 0,
  }));

  return (
    <div className="graph-container">
      <h2 className="graph-title">Simple Analysis</h2>
      <div className="graph-select-container">
        <Select
          classNamePrefix="custom-select-workstatus"
          options={academies.map((a) => ({
            value: a.academyId,
            label: a.name,
          }))}
          value={
            selectedAcademy
              ? {
                  value: selectedAcademy,
                  label: academyIdToName[selectedAcademy],
                }
              : null
          }
          onChange={(selectedOption) => {
            setSelectedAcademy(selectedOption.value);
            setSelectedYear("");
          }}
        />
        <Select
          classNamePrefix="custom-select-workstatus"
          options={allYears.map((year) => ({
            value: year,
            label: year,
          }))}
          value={
            selectedYear ? { value: selectedYear, label: selectedYear } : null
          }
          onChange={(selectedOption) => setSelectedYear(selectedOption.value)}
          isDisabled={!selectedAcademy}
        />
      </div>

      <div className="graph-grid">
        <div className="graph-card">
          <h3 className="graph-subtitle">Maintenance Cost</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mappedData}>
              <XAxis tick={{ fontSize: 12 }} dataKey="month">
                <Label value="Month" offset={-5} position="insideBottom" />
              </XAxis>
              <YAxis tick={{ fontSize: 12 }}>
                <Label
                  value="Cost (Nu)"
                  angle={-90}
                  position="center"
                  dx={-20}
                />
              </YAxis>
              <Tooltip />
              <Bar dataKey="cost" fill="#897463" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="graph-card">
          <h3 className="graph-subtitle">Average Response Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mappedData}>
              <XAxis tick={{ fontSize: 12 }} dataKey="month">
                <Label value="Month" offset={-5} position="insideBottom" />
              </XAxis>
              <YAxis tick={{ fontSize: 12 }}>
                <Label
                  value="Response Time (hrs)"
                  angle={-90}
                  position="center"
                  dx={-20}
                />
              </YAxis>
              <Tooltip />
              <Line
                type="monotone"
                dataKey="responseTime"
                stroke="#315845"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceGraphs;
