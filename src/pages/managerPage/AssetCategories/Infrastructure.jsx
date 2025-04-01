import React, { useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoIosSearch } from "react-icons/io";
import { IoMdAdd } from "react-icons/io";
import { ImFolderDownload } from "react-icons/im";
import Category from "../AssetCategory";
import { IoIosCloseCircle } from "react-icons/io";
import Select from "react-select";


const Infrastructure = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [modalData, setModalData] = useState(null);
    const [editModalData, setEditModalData] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newInfrastructure, setNewInfrastructure] = useState({ Title: "", AssetCode: "", Category: "Building", Floor: "", PlintArea: "", AcquireDate: "", Useful_life: "", status: "", cost: "", Area: "", DepreciatedValue: "", File: "" });

    const rowsPerPage = 10;

    const [data, setData] = useState([
        {
            SerialNo: "1",
            AssetCode: "NHDCL-22-2003",
            Title: "Storage Tank",
            AcquireDate: "27-02-2024",
            Useful_life: 3,
            size: "10m height, 20m width",
            Depreciated_value: 4,
            status: "In Maintenance",
            cost: 600000,
            Category: {},
            Area: "Area-1",
            Created_by: "12210100.gcit@rub.edu.bt",
            description: "This is the biggest land we own",
        },
        {
            SerialNo: "2",
            AssetCode: "NHDCL-22-2004",
            Title: "Office Building",
            AcquireDate: "15-03-2023",
            Useful_life: 20,
            size: "50m height, 100m width",
            Depreciated_value: 5,
            status: "In Usage",
            cost: 20000000,
            Category: {},
            Area: "Area-2",
            Created_by: "12210100.gcit@rub.edu.bt",
            description: "Main corporate office building",
        },
        {
            SerialNo: "3",
            AssetCode: "NHDCL-22-2005",
            Title: "Water Pump",
            AcquireDate: "10-05-2022",
            Useful_life: 10,
            size: "3m height, 5m width",
            Depreciated_value: 2,
            status: "disposed",
            cost: 200000,
            Category: {},
            Area: "Area-3",
            Created_by: "12210100.gcit@rub.edu.bt",
            description: "Essential for water distribution",
        },
        {
            SerialNo: "4",
            AssetCode: "NHDCL-22-2006",
            Title: "Solar Panels",
            AcquireDate: "01-01-2021",
            Useful_life: 15,
            size: "50m²",
            Depreciated_value: 10,
            status: "In Usage",
            cost: 500000,
            Category: {},
            Area: "Area-4",
            Created_by: "12210100.gcit@rub.edu.bt",
            description: "Provides sustainable energy",
        },
        {
            SerialNo: "5",
            AssetCode: "NHDCL-22-2007",
            Title: "Generator",
            AcquireDate: "12-06-2020",
            Useful_life: 12,
            size: "10m²",
            Depreciated_value: 6,
            status: "In Maintenance",
            cost: 1000000,
            Category: {},
            Area: "Area-5",
            Created_by: "12210100.gcit@rub.edu.bt",
            description: "Backup power source for office",
        },
        {
            SerialNo: "6",
            AssetCode: "NHDCL-22-2008",
            Title: "CCTV System",
            AcquireDate: "08-09-2021",
            Useful_life: 7,
            size: "Building-wide coverage",
            Depreciated_value: 3,
            status: "disposed",
            cost: 400000,
            Category: {},
            Area: "Area-6",
            Created_by: "12210100.gcit@rub.edu.bt",
            description: "Security surveillance system",
        },
        {
            SerialNo: "7",
            AssetCode: "NHDCL-22-2009",
            Title: "Conference Room Equipment",
            AcquireDate: "20-11-2023",
            Useful_life: 5,
            size: "15m²",
            Depreciated_value: 1,
            status: "disposed",
            cost: 150000,
            Category: {},
            Area: "Area-7",
            Created_by: "12210100.gcit@rub.edu.bt",
            description: "Projector, sound system, and furniture",
        },
        {
            SerialNo: "8",
            AssetCode: "NHDCL-22-2010",
            Title: "Underground Parking",
            AcquireDate: "14-07-2019",
            Useful_life: 30,
            size: "2000m²",
            Depreciated_value: 15,
            status: "In Usage",
            cost: 5000000,
            Category: {},
            Area: "Area-8",
            Created_by: "12210100.gcit@rub.edu.bt",
            description: "Parking space for company vehicles",
        },
        {
            SerialNo: "9",
            AssetCode: "NHDCL-22-2011",
            Title: "IT Server Room",
            AcquireDate: "22-05-2022",
            Useful_life: 10,
            size: "30m²",
            Depreciated_value: 3,
            status: "In Usage",
            cost: 2000000,
            Category: {},
            Area: "Area-9",
            Created_by: "12210100.gcit@rub.edu.bt",
            description: "Secure and climate-controlled data center",
        },
        {
            SerialNo: "10",
            AssetCode: "NHDCL-22-2012",
            Title: "Fire Extinguisher System",
            AcquireDate: "05-02-2021",
            Useful_life: 8,
            size: "Building-wide",
            Depreciated_value: 2,
            status: "In Maintenance",
            cost: 500000,
            Category: {},
            Area: "Area-10",
            Created_by: "12210100.gcit@rub.edu.bt",
            description: "Fire safety system for emergency response",
        }
    ])

    // Filtering data based on search and priority selection and work status
    const sortedData = [...data].sort((a, b) => b.mid - a.mid);
    const filteredData = sortedData.filter((item) => {
        const matchesSearch = Object.values(item).some((value) =>
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesStatus =
            selectedStatus === "" || item.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const displayedData = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const handleDeleteSelected = () => {
        setData(data.filter((item) => !selectedRows.includes(item.AID)));
        setSelectedRows([]);
    };
    const handleView = (item) => {
        setModalData(item);
    };

    // Function to get the class based on workstatus
    const getStatusClass = (status) => {
        switch (status) {
            case "In Maintenance":
                return "In-maintenance-status";
            case "In Usage":
                return "in-usage-status";
            case "disposed":
                return "disposed-status";
            default:
                return "";
        }
    };
    // Extract unique work statuses from data
    const uniqueStatuses = [
        { value: "", label: "All Work status" },
        ...Array.from(new Set(data.map(item => item.status))).map(status => ({
            value: status,
            label: status
        }))
    ];
    const handleCloseModal = () => {
        setModalData(null);
    };

    const handleAddInfrastructure = () => {
        setShowAddModal(true);
        setNewInfrastructure({ category: "", DepreciatedValue: "" });
    };

    const handleSaveNewInfrastructure= () => {
        if (newInfrastructure.Category && newInfrastructure.DepreciatedValue) {
            const newAID = data.length > 0 ? (Math.max(...data.map((item) => Number(item.SerialNo))) + 1).toString() : "1";
            setData([...data, { AID: newAID, ...newInfrastructure }]);
            setShowAddModal(false);
            setNewInfrastructure({}); // Reset form after adding
        }
    };

    return (
        <div className="managerDashboard" >
            <div className="search-sort-container">
                <div className="search-container">
                    <IoIosSearch style={{ width: "20px", height: "20px" }} />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="dropdown-ls">
                    {/* Work Status Dropdown */}
                    <Select
                        classNamePrefix="custom-select-workstatus"
                        className="workstatus-dropdown"
                        options={uniqueStatuses}
                        value={uniqueStatuses.find(option => option.value === selectedStatus)}
                        onChange={(selectedOption) => {
                            setSelectedStatus(selectedOption ? selectedOption.value : "");
                        }}
                        isClearable
                        isSearchable={false}
                    />
                    <div className="create-category-btn">
                        <ImFolderDownload style={{ color: "#ffffff", marginLeft: "12px" }} />
                        <button className="category-btn">Bulk Import</button>
                    </div>
                    <div className="create-category-btn">
                        <IoMdAdd style={{ color: "#ffffff", marginLeft: "12px" }} />
                        <button className="category-btn" onClick={handleAddInfrastructure} >Create category</button>
                    </div>

                </div>
            </div>
            {/* Table */}
            <div className="table-container">
                <table className="RequestTable">
                    <thead className="table-header">
                        <tr>

                            {["SI.No", "Asset Code", "Title", "Acquire Date", "Useful Life(year)", "size", "Depreciated Value (%)", "Status"].map((header, index) => (
                                <th key={index}>{header}</th>
                            ))}
                            <th>
                                {selectedRows.length > 0 && (
                                    <button className="delete-all-btn" onClick={handleDeleteSelected}>
                                        <RiDeleteBin6Line style={{ width: "20px", height: "20px", color: "red" }} />
                                    </button>
                                )}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedData.map((item, index) => (
                            <tr key={index}>
                                <td>{item.SerialNo}</td>
                                <td>{item.AssetCode}</td>
                                <td>{item.Title}</td>
                                <td>{item.AcquireDate}</td>
                                <td>{item.Useful_life}</td>
                                <td>{item.size}</td>
                                <td>{item.Depreciated_value}</td>
                                <td>
                                    <div className={getStatusClass(item.status)}>
                                        {item.status}
                                    </div>
                                </td>
                                <td className="actions">
                                    <button className="view-btn" onClick={() => handleView(item)}>
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Pagination */}
            <div className="pagination">
                <span>{filteredData.length} Results</span>
                <div>
                    {[...Array(totalPages).keys()].slice(0, 5).map((num) => (
                        <button key={num} className={currentPage === num + 1 ? "active" : ""} onClick={() => setCurrentPage(num + 1)}>
                            {num + 1}
                        </button>
                    ))}
                    <span>...</span>
                    <button onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>
                </div>
            </div>

            {/* Add Infrustructure Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="form-h">Create Asset</h2>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>
                                <IoIosCloseCircle style={{ color: "#897463", width: "20px", height: "20px" }} />
                            </button>
                        </div>
                        <div className="schedule-form">
                            <div className="modal-content-field">
                                <label>Title:</label>
                                <input
                                    type="text"
                                    value={newInfrastructure.Title}
                                    onChange={(e) => setNewInfrastructure({ ...newInfrastructure, Title: e.target.value })}
                                />
                            </div>
                            <div className="modal-content-field">
                                <label>Asset Code:</label>
                                <input
                                    type="text"
                                    value={newInfrastructure.AssetCode}
                                    onChange={(e) => setNewInfrastructure({ ...newInfrastructure, AssetCode: e.target.value })}
                                />
                            </div>
                            <div className="modal-content-field">
                                <label>Category:</label>
                                <input
                                    type="text"
                                    value={newInfrastructure.Category}
                                    onChange={(e) => setNewInfrastructure({ ...newInfrastructure, Category: e.target.value })}
                                />
                            </div>
                            <div className="modal-content-field">
                                <label>Floor:</label>
                                <input
                                    type="text"
                                    value={newInfrastructure.Floor}
                                    onChange={(e) => setNewInfrastructure({ ...newInfrastructure, Floor: e.target.value })}
                                />
                            </div>
                            <div className="modal-content-field">
                                <label>Plint Area(sq.m):</label>
                                <input
                                    type="text"
                                    value={newInfrastructure.PlintArea}
                                    onChange={(e) => setNewInfrastructure({ ...newInfrastructure, PlintArea: e.target.value })}
                                />
                            </div>
                            <div className="modal-content-field">
                                <label>Acquired Date:</label>
                                <input
                                    type="text"
                                    value={newInfrastructure.AcquireDate}
                                    onChange={(e) => setNewInfrastructure({ ...newInfrastructure, AcquireDate: e.target.value })}
                                />
                            </div>
                            <div className="modal-content-field">
                                <label>Useful Life (Year):</label>
                                <input
                                    type="text"
                                    value={newInfrastructure.Useful_life}
                                    onChange={(e) => setNewInfrastructure({ ...newInfrastructure, Useful_life: e.target.value })}
                                />
                            </div>
                            {/* <div className="modal-content-field">
                                        <label>Status:</label>
                                        <input
                                          type="text"
                                          value={newInfrustructure.status}
                                          onChange={(e) =>setNewInfrustructure({ ...newInfrustructure, Useful_life: e.target.value })}
                                        />
                                      </div> */}
                            <div className="modal-content-field">
                                <label>Cost:</label>
                                <input
                                    type="text"
                                    value={newInfrastructure.cost}
                                    onChange={(e) => setNewInfrastructure({ ...newInfrastructure, cost: e.target.value })}
                                />
                            </div>
                            <div className="modal-content-field">
                                <label>Area:</label>
                                <input
                                    type="text"
                                    value={newInfrastructure.Area}
                                    onChange={(e) => setNewInfrastructure({ ...newInfrastructure, Area: e.target.value })}
                                />
                            </div>
                            <div className="modal-content-field">
                                <label>Depreciated Value (%):</label>
                                <input
                                    type="number"
                                    value={newInfrastructure.DepreciatedValue}
                                    onChange={(e) => setNewInfrastructure({ ...newInfrastructure, DepreciatedValue: e.target.value })}
                                />
                            </div>
                            <div className="modal-content-field">
                                <label>Description:</label>
                                <input
                                    type="text"
                                    value={newInfrastructure.description}
                                    onChange={(e) => setNewInfrastructure({ ...newInfrastructure, description: e.target.value })}
                                />
                            </div>
                            <div className="modal-actions">
                                <button className="accept-btn" style={{ width: "80px" }} onClick={handleSaveNewInfrastructure}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Viewing Request */}
            {modalData && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        {/* Close Button */}
                        <div className="modal-header">
                            <h2 className="form-h">Asset Details</h2>
                            <button className="close-btn" onClick={handleCloseModal}>
                                <IoIosCloseCircle
                                    style={{ color: "#897463", width: "20px", height: "20px" }}
                                />
                            </button>
                        </div>
                        <form className="repair-form">
                            <div className="modal-content-field">
                                <label>Asset Id:</label>
                                <input type="text" value={modalData.SerialNo} readOnly />
                            </div>

                            <div className="modal-content-field">
                                <label>Title:</label>
                                <input type="text" value={modalData.Title} readOnly />
                            </div>
                            <div className="modal-content-field">
                                <label>Asset Code:</label>
                                <input type="email" value={modalData.AssetCode} readOnly />
                            </div>
                            <div className="modal-content-field">
                                <label>Size</label>
                                <input type="text" value={modalData.size} readOnly />
                            </div>

                            <div className="modal-content-field">
                                <label>Cost:</label>
                                <input type="text" value={modalData.cost} readOnly />
                            </div>
                            <div className="modal-content-field">
                                <label>Depreciated Value:</label>
                                <input value={modalData.Depreciated_value} readOnly />
                            </div>
                            <div className="modal-content-field">
                                <label>Acquired Date:</label>
                                <input type="text" value={modalData.AcquireDate} readOnly />
                            </div>
                            <div className="modal-content-field">
                                <label>Useful Life(Years):</label>
                                <input value={modalData.Useful_life} readOnly />
                            </div>
                            <div className="modal-content-field">
                                <label>status:</label>
                                <input value={modalData.status} readOnly />
                            </div>
                            <div className="modal-content-field">
                                <label>category:</label>
                                <input value={modalData.category} readOnly />
                            </div>
                            <div className="modal-content-field">
                                <label>Created by</label>
                                <input value={modalData.Created_by} readOnly />
                            </div>
                            <div className="modal-content-field">
                                <label>Description: </label>
                                <textarea value={modalData.description} readOnly />
                            </div>

                            <div className="modal-buttons">
                                <button className="accept-btn" style={{ backgroundColor: "red" }}>
                                    <RiDeleteBin6Line />
                                </button>
                                <button className="reject-btn">Schedule Maintenance</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div >
    )
};

export default Infrastructure;
