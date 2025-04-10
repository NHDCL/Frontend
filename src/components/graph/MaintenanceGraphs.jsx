import React, { useState } from "react";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label 
} from "recharts";
import "./../../pages/adminPages/css/MintenanceGraphs.css";
import Select from "react-select";

const sampleData = [
  {
    name: "Gyelpozhing",
    years: {
      "2023": [
        { month: "Jan", cost: 60, responseTime: 40 },
        { month: "Feb", cost: 45, responseTime: 60 },
        { month: "Mar", cost: 20, responseTime: 25 },
        { month: "Apr", cost: 55, responseTime: 80 },
        { month: "May", cost: 10, responseTime: 30 },
        { month: "Jun", cost: 5, responseTime: 35 },
        { month: "Jul", cost: 15, responseTime: 40 },
        { month: "Aug", cost: 80, responseTime: 85 },
        { month: "Sep", cost: 40, responseTime: 35 },
        { month: "Oct", cost: 60, responseTime: 45 },
        { month: "Nov", cost: 10, responseTime: 20 },
        { month: "Dec", cost: 30, responseTime: 50 }
      ],
      "2024": [
        { month: "Jan", cost: 40, responseTime: 50 },
        { month: "Feb", cost: 35, responseTime: 55 },
        { month: "Mar", cost: 25, responseTime: 30 },
        { month: "Apr", cost: 75, responseTime: 60 },
        { month: "May", cost: 20, responseTime: 35 },
        { month: "Jun", cost: 10, responseTime: 90 },
        { month: "Jul", cost: 25, responseTime: 45 },
        { month: "Aug", cost: 90, responseTime: 95 },
        { month: "Sep", cost: 50, responseTime: 40 },
        { month: "Oct", cost: 70, responseTime: 55 },
        { month: "Nov", cost: 15, responseTime: 25 },
        { month: "Dec", cost: 40, responseTime: 60 }
      ]
    }
  },
  {
    name: "Tareythang",
    years: {
      "2023": [
        { month: "Jan", cost: 30, responseTime: 40 },
        { month: "Feb", cost: 45, responseTime: 60 },
        { month: "Mar", cost: 20, responseTime: 25 },
        { month: "Apr", cost: 55, responseTime: 50 },
        { month: "May", cost: 10, responseTime: 30 },
        { month: "Jun", cost: 5, responseTime: 35 },
        { month: "Jul", cost: 15, responseTime: 40 },
        { month: "Aug", cost: 80, responseTime: 85 },
        { month: "Sep", cost: 40, responseTime: 35 },
        { month: "Oct", cost: 60, responseTime: 45 },
        { month: "Nov", cost: 10, responseTime: 20 },
        { month: "Dec", cost: 30, responseTime: 50 }
      ],
      "2024": [
        { month: "Jan", cost: 40, responseTime: 50 },
        { month: "Feb", cost: 35, responseTime: 55 },
        { month: "Mar", cost: 25, responseTime: 30 },
        { month: "Apr", cost: 65, responseTime: 60 },
        { month: "May", cost: 20, responseTime: 35 },
        { month: "Jun", cost: 10, responseTime: 40 },
        { month: "Jul", cost: 25, responseTime: 45 },
        { month: "Aug", cost: 90, responseTime: 95 },
        { month: "Sep", cost: 50, responseTime: 40 },
        { month: "Oct", cost: 70, responseTime: 55 },
        { month: "Nov", cost: 15, responseTime: 25 },
        { month: "Dec", cost: 40, responseTime: 60 }
      ]
    }
  }
];

const MaintenanceGraphs = () => {
  const [selectedAcademy, setSelectedAcademy] = useState("Gyelpozhing");
  const [selectedYear, setSelectedYear] = useState("2023");

  const selectedAcademyData = sampleData.find(a => a.name === selectedAcademy);
  const selectedData = selectedAcademyData?.years[selectedYear] || [];

  return (
    <div className="graph-container">
      <h2 className="graph-title">Simple Analysis</h2>
      <div className="graph-select-container">
        <Select
          classNamePrefix="custom-select-workstatus"
          options={sampleData.map((academy) => ({ value: academy.name, label: academy.name }))}
          value={{ value: selectedAcademy, label: selectedAcademy }}
          onChange={(selectedOption) => setSelectedAcademy(selectedOption.value)}
        />
        <Select
          classNamePrefix="custom-select-workstatus"
          options={Object.keys(selectedAcademyData?.years || {}).map((year) => ({ value: year, label: year }))}
          value={{ value: selectedYear, label: selectedYear }}
          onChange={(selectedOption) => setSelectedYear(selectedOption.value)}
        />
      </div>
      <div className="graph-grid">
        <div className="graph-card">
          <h3 className="graph-subtitle">Maintenance Cost</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={selectedData}>
              <XAxis tick={{ fontSize: 12 }} dataKey="month">
                <Label value="Month" offset={-5} position="insideBottom" />
              </XAxis>
              <YAxis tick={{ fontSize: 12 }}>
                <Label value="Cost (Nu)" angle={-90} position="Center" dx={-20} style={{ textAnchor: "middle" }} />
              </YAxis>
              <Tooltip />
              <Bar dataKey="cost" fill="#897463" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="graph-card">
          <h3 className="graph-subtitle">Average Response Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={selectedData}>
              <XAxis tick={{ fontSize: 12 }} dataKey="month">
                <Label value="Month" offset={-5} position="insideBottom" />
              </XAxis>
              <YAxis tick={{ fontSize: 12 }}>
                <Label value="Response Time (min)" angle={-90} position="center" dx={-20} style={{ textAnchor: "middle" }} />
              </YAxis>
              <Tooltip />
              <Line type="monotone" dataKey="responseTime" stroke="#315845" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceGraphs;
