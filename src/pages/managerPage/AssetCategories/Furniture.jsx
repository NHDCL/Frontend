import React, { useState, useRef } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoIosSearch } from "react-icons/io";
import { IoMdAdd } from "react-icons/io";
import { ImFolderDownload } from "react-icons/im";
import Category from "../AssetCategory";
import { IoIosCloseCircle } from "react-icons/io";
import Select from "react-select";
import { FaDownload } from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";

const Furniture = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [modalData, setModalData] = useState(null);
    const [editModalData, setEditModalData] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [scheduleModalData, setScheduleModalData] = useState(null); // This controls the modal's visibility
    const [newMachinery, setNewMachinery] = useState({ category: "", DepreciatedValue: "" });

    const qrRefs = useRef([]);

    const rowsPerPage = 9; // 3x3 grid for QR codes per page
    const qrSize = 40;     // Size of each QR code (adjust as needed)
    const qrSpacing = 12;  // Spacing between QR codes

    // Example asset data
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

    ]);
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

    const handleDeleteRow = (SerialNo) => {
        setData(data.filter((item) => item.SerialNo !== SerialNo));
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

    const handleAddMachinery = () => {
        setShowAddModal(true);
        setNewMachinery({ category: "", DepreciatedValue: "" });
    };

    const handleSaveNewMachinery = () => {
        if (newMachinery.Category && newMachinery.DepreciatedValue) {
            const newSerialNo = data.length > 0 ? (Math.max(...data.map((item) => Number(item.SerialNo))) + 1).toString() : "1";
            setData([...data, { SerialNo: newSerialNo, ...newMachinery }]);
            setShowAddModal(false);
            setNewMachinery({}); // Reset form after adding
        }
    };
    const handleScheduleMaintenance = () => {
        setScheduleModalData(modalData); // Set modal data to open the schedule modal
    };



    // DownloadPDF
    const handleDownloadPDF = () => {
        if (selectedRows.length === 0) return;

        const doc = new jsPDF();
        let pageY = 10; // Y position to start placing QR codes
        let pageX = 40; // X position for the QR codes
        let rowCount = 0;

        selectedRows.forEach((SerialNo, index) => {
            const rowData = data.find((item) => item.SerialNo === SerialNo);
            if (!rowData) return;

            // Add QR Code
            const qrCanvas = qrRefs.current[rowData.SerialNo];
            if (qrCanvas) {
                const qrDataUrl = qrCanvas.toDataURL("image/png");
                doc.addImage(qrDataUrl, "PNG", pageX, pageY, qrSize, qrSize);

                // Decrease font size
                doc.setFontSize(8); // Set the font size smaller

                // Add asset details under the QR code
                pageY += qrSize + qrSpacing;
                doc.text(`Asset Code: ${rowData.AssetCode}`, pageX, pageY);
                pageY += 8;
                doc.text(`Title: ${rowData.Title}`, pageX, pageY);
                pageY += 8;
                doc.text(`Category: ${rowData.Category}`, pageX, pageY);
                pageY += 10;

                rowCount++;

                // Move to the next column (after every 3 QR codes in a row)
                if (rowCount % 3 === 0) {
                    pageX += qrSize + qrSpacing;
                    pageY = 10; // Reset Y position for the next column
                }

                // If 9 QR codes are added, go to the next page
                if (rowCount === rowsPerPage) {
                    doc.addPage();
                    pageY = 10;
                    pageX = 40;
                    rowCount = 0; // Reset row count
                }
            }
        });

        // Save the PDF
        doc.save("Assets_with_QR_Codes.pdf");
    };

    const handleSelectRow = (SerialNo) => {
        setSelectedRows((prev) =>
            prev.includes(SerialNo)
                ? prev.filter((item) => item !== SerialNo)
                : [...prev, SerialNo]
        );
    };


    return (
        <div className="managerDashboard">
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
                        <button className="category-btn" onClick={handleAddMachinery} >Create category</button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="RequestTable">
                    <thead className="table-header">
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={selectedRows.length === filteredData.length}
                                    onChange={() =>
                                        setSelectedRows(
                                            selectedRows.length === filteredData.length
                                                ? []
                                                : filteredData.map((item) => item.SerialNo)
                                        )
                                    }
                                />
                            </th>
                            {["SI.No", "Asset Code", "Title", "Acquire Date", "Useful Life(year)", "size", "Depreciated Value (%)", "Status"].map(
                                (header, index) => (
                                    <th key={index}>{header}</th>
                                )
                            )}
                            <th>
                                {selectedRows.length > 0 && (
                                    <button
                                        className="delete-all-btn"
                                        style={{ paddingLeft: "98px" }}
                                        onClick={handleDownloadPDF}
                                    >
                                        <FaDownload style={{ width: "20px", height: "20px", color: "green" }} />
                                    </button>
                                )}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((item) => (
                            <tr key={item.SerialNo}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.includes(item.SerialNo)}
                                        onChange={() => handleSelectRow(item.SerialNo)}
                                    />
                                </td>
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
                                <td className="actions" style={{ display: "flex", flexDirection: "row", width: "100%", maxWidth: "150px" }}>
                                    <button className="view-btn" onClick={() => handleView(item)}>
                                        View
                                    </button>
                                    <div>
                                        <QRCodeCanvas
                                            value={item.AssetCode}
                                            size={qrSize}
                                            ref={(el) => (qrRefs.current[item.SerialNo] = el)}
                                        />
                                    </div>
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

            {/* Add Machinery Modal */}
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
                                    value={newMachinery.Title}
                                    onChange={(e) => setNewMachinery({ ...newMachinery, Title: e.target.value })}
                                />
                            </div>
                            <div className="modal-content-field">
                                <label>Asset Code:</label>
                                <input
                                    type="text"
                                    value={newMachinery.AssetCode}
                                    onChange={(e) => setNewMachinery({ ...newMachinery, AssetCode: e.target.value })}
                                />
                            </div>
                            <div className="modal-content-field">
                                <label>Category:</label>
                                <input
                                    type="text"
                                    value={newMachinery.Category}
                                    onChange={(e) => setNewMachinery({ ...newMachinery, Category: e.target.value })}
                                />
                            </div>
                            <div className="modal-content-field">
                                <label>Floor:</label>
                                <input
                                    type="text"
                                    value={newMachinery.Floor}
                                    onChange={(e) => setNewMachinery({ ...newMachinery, Floor: e.target.value })}
                                />
                            </div>
                            <div className="modal-content-field">
                                <label>Plint Area(sq.m):</label>
                                <input
                                    type="text"
                                    value={newMachinery.PlintArea}
                                    onChange={(e) => setNewMachinery({ ...newMachinery, PlintArea: e.target.value })}
                                />
                            </div>
                            <div className="modal-content-field">
                                <label>Acquired Date:</label>
                                <input
                                    type="text"
                                    value={newMachinery.AcquireDate}
                                    onChange={(e) => setNewMachinery({ ...newMachinery, AcquireDate: e.target.value })}
                                />
                            </div>
                            <div className="modal-content-field">
                                <label>Useful Life (Year):</label>
                                <input
                                    type="text"
                                    value={newMachinery.Useful_life}
                                    onChange={(e) => setNewMachinery({ ...newMachinery, Useful_life: e.target.value })}
                                />
                            </div>
                            {/* <div className="modal-content-field">
                                                    <label>Status:</label>
                                                    <input
                                                      type="text"
                                                      value={newMachinery.status}
                                                      onChange={(e) =>setNewMachinery({ ...newMachinery, Useful_life: e.target.value })}
                                                    />
                                                  </div> */}
                            <div className="modal-content-field">
                                <label>Cost:</label>
                                <input
                                    type="text"
                                    value={newMachinery.cost}
                                    onChange={(e) => setNewMachinery({ ...newMachinery, cost: e.target.value })}
                                />
                            </div>
                            <div className="modal-content-field">
                                <label>Area:</label>
                                <input
                                    type="text"
                                    value={newMachinery.Area}
                                    onChange={(e) => setNewMachinery({ ...newMachinery, Area: e.target.value })}
                                />
                            </div>
                            <div className="modal-content-field">
                                <label>Depreciated Value (%):</label>
                                <input
                                    type="number"
                                    value={newMachinery.DepreciatedValue}
                                    onChange={(e) => setNewMachinery({ ...newMachinery, DepreciatedValue: e.target.value })}
                                />
                            </div>
                            <div className="modal-content-field">
                                <label>Description:</label>
                                <input
                                    type="text"
                                    value={newMachinery.description}
                                    onChange={(e) => setNewMachinery({ ...newMachinery, description: e.target.value })}
                                />
                            </div>
                            <div className="modal-actions">
                                <button className="accept-btn" style={{ width: "80px" }} onClick={handleSaveNewMachinery}>Save</button>
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
                                <label>Area:</label>
                                <input value={modalData.Area} readOnly />
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
                                <button className="accept-btn" onClick={handleScheduleMaintenance}>
                                    Schedule Maintenance
                                </button>

                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Furniture;
