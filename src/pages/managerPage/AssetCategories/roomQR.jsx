import React, { useState, useRef } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoIosSearch } from "react-icons/io";
import { IoMdAdd } from "react-icons/io";
import { ImFolderDownload } from "react-icons/im";
import Category from "../AssetCategory";
import { IoIosCloseCircle } from "react-icons/io";
import Select from "react-select";
import Building from "./Building";
import { FaDownload } from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";

const RoomQR = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedBuilding, setSelectedBuilding] = useState("");
    const [selectedFloor, setSelectedFloor] = useState("");
    const [selectedRoom, setSelectedRoom] = useState("");
    const [modalData, setModalData] = useState(null);
    const [editModalData, setEditModalData] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [floorAndRooms, setFloorAndRooms] = useState({});
    const [floorInput, setFloorInput] = useState("");
    const [roomInput, setRoomInput] = useState("");

    const qrRefs = useRef([]);

    const rowsPerPage = 9; // 3x3 grid for QR codes per page
    const qrSize = 40;     // Size of each QR code (adjust as needed)
    const qrSpacing = 12;  // Spacing between QR codes

    const handleDeleteSelected = () => {
        setData(data.filter((item) => !selectedRows.includes(item.AID)));
        setSelectedRows([]);
    };
    const handleView = (item) => {
        setModalData(item);
    };

    const [data, setData] = useState([
        {
            serialNo: "1",
            AsserCode: "NHDCL-22-2023",
            BuildingName: "Block A",
            Floor: "2",
            Room: "A",
            QR: ""
        },
        {
            serialNo: "2",
            AsserCode: "NHDCL-22-2023",
            BuildingName: "Block A",
            Floor: "4",
            Room: "C",
            QR: ""
        },
        {
            serialNo: "3",
            AsserCode: "NHDCL-22-2023",
            BuildingName: "Block A",
            Floor: "4",
            Room: "A",
            QR: ""
        },
        {
            serialNo: "4",
            AsserCode: "NHDCL-22-2023",
            BuildingName: "Block B",
            Floor: "1",
            Room: "A",
            QR: ""
        },
        {
            serialNo: "5",
            AsserCode: "NHDCL-22-2023",
            BuildingName: "Block C",
            Floor: "4",
            Room: "A",
            QR: ""
        },
        {
            serialNo: "6",
            AsserCode: "NHDCL-22-2023",
            BuildingName: "Block D",
            Floor: "5",
            Room: "A",
            QR: ""
        },
    ])

    // Filtering data based on search and priority selection and work status
    const sortedData = [...data].sort((a, b) => b.mid - a.mid);
    const filteredData = sortedData.filter((item) => {
        const matchesSearch = Object.values(item).some((value) =>
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );

        const matchesBuilding =
            selectedBuilding === "" || item.BuildingName === selectedBuilding;

        const matchesFloor =
            selectedFloor === "" || item.Floor === selectedFloor;

        return matchesSearch && matchesBuilding && matchesFloor;
    });

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const displayedData = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );


    const uniqueBuilding = [
        { value: "", label: "All buildings" },
        ...Array.from(new Set(data.map(item => item.BuildingName))).map(BuildingName => ({
            value: BuildingName,
            label: BuildingName
        }))
    ];

    const uniqueFloors = [
        { value: "", label: "All Floors" },
        ...Array.from(new Set(
            data
                .filter(item => selectedBuilding === "" || item.BuildingName === selectedBuilding)
                .map(item => item.Floor)
        )).map(Floor => ({
            value: Floor,
            label: `Floor ${Floor}`
        }))
    ];
    const uniqueRoom = [
        { value: "", label: "All Rooms" },
        ...Array.from(new Set(
            data
                .filter(item => selectedFloor === "" || item.Floor === selectedFloor)
                .map(item => item.Room)
        )).map(Room => ({
            value: Room,
            label: `Room ${Room}`
        }))
    ];

    // DownloadPDF
    const handleDownloadPDF = () => {
        if (selectedRows.length === 0) return;

        const doc = new jsPDF();
        let pageY = 10; // Y position to start placing QR codes
        let pageX = 40; // X position for the QR codes
        let rowCount = 0;

        selectedRows.forEach((serialNo, index) => {
            const rowData = data.find((item) => item.serialNo === serialNo);
            if (!rowData) return;

            // Add QR Code
            const qrCanvas = qrRefs.current[rowData.serialNo];
            if (qrCanvas) {
                const qrDataUrl = qrCanvas.toDataURL("image/png");
                doc.addImage(qrDataUrl, "PNG", pageX, pageY, qrSize, qrSize);

                // Decrease font size
                doc.setFontSize(8); // Set the font size smaller

                // Add asset details under the QR code
                pageY += qrSize + qrSpacing;
                doc.text(`Building Name: ${rowData.BuildingName}`, pageX, pageY);
                pageY += 8;
                doc.text(`Floor Name: ${rowData.Floor}`, pageX, pageY);
                pageY += 8;
                doc.text(`Room Name: ${rowData.Room}`, pageX, pageY);
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
                {/* <div className="dropdown-ls">
    
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
                </div> */}
            </div>
            <div className="Building-sort">

                {/* Building Dropdown */}
                <Select
                    classNamePrefix="custom-select-workstatus"
                    className="workstatus-dropdown"
                    options={uniqueBuilding}
                    value={uniqueBuilding.find(option => option.value === selectedBuilding)}
                    onChange={(selectedOption) => {
                        setSelectedBuilding(selectedOption ? selectedOption.value : "");
                        setSelectedFloor(""); // Reset floor selection when a new building is chosen
                    }}
                    isClearable
                />

                {/* Floor Dropdown (Only Shows if Building is Selected) */}
                {selectedBuilding && (
                    <Select
                        classNamePrefix="custom-select-workstatus"
                        className="workstatus-dropdown"
                        options={uniqueFloors}
                        value={uniqueFloors.find(option => option.value === selectedFloor)}
                        onChange={(selectedOption) => {
                            setSelectedFloor(selectedOption ? selectedOption.value : "");
                        }}
                        isClearable
                    />
                )}
                {selectedFloor && (
                    <Select
                        classNamePrefix="custom-select-workstatus"
                        className="workstatus-dropdown"
                        options={uniqueRoom}
                        value={uniqueRoom.find(option => option.value === selectedRoom)}
                        onChange={(selectedOption) => {
                            setSelectedFloor(selectedOption ? selectedOption.value : "");
                        }}
                        isClearable
                    />
                )}
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
                                                : filteredData.map((item) => item.serialNo)
                                        )
                                    }
                                />
                            </th>

                            {["SI.No", "Asset Code", "Building Name", "Floor", "Room",].map((header, index) => (
                                <th key={index}>{header}</th>
                            ))}
                            <th>
                                {selectedRows.length > 0 && (
                                    <button
                                        className="delete-all-btn"
                                        style={{ paddingLeft: "5px" }}
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
                            <tr key={item.serialNo}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.includes(item.serialNo)}
                                        onChange={() => handleSelectRow(item.serialNo)}
                                    />
                                </td>
                                <td>{item.serialNo}</td>
                                <td>{item.AsserCode}</td>
                                <td>{item.BuildingName}</td>
                                <td>{item.Floor}</td>
                                <td>{item.Room}</td>
                                <td className="actions" style={{ display: "flex", flexDirection: "row", width: "100%", maxWidth: "150px" }}>
                                    <div>
                                        <QRCodeCanvas
                                            value={item.QR}
                                            size={qrSize}
                                            ref={(el) => (qrRefs.current[item.serialNo] = el)}
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

        </div >
    )

}

export default RoomQR;

