import { FaHome } from "react-icons/fa";
import { HiUsers } from "react-icons/hi";
import { PiTreasureChestFill } from "react-icons/pi";
import { TbCategoryPlus } from "react-icons/tb";
import { GiAutoRepair } from "react-icons/gi";
import { GrVmMaintenance } from "react-icons/gr";
import { TbReportSearch, TbReport } from "react-icons/tb";
import { BsHouseCheck } from "react-icons/bs";
import { HiOutlineClipboardDocumentCheck } from "react-icons/hi2";
import { MdOutlineAccountCircle, MdLogout } from "react-icons/md"; // Import Logout icon

export const managernavigationLinks = [
  { id: 1, title: "Home", path: "", icon: FaHome },
  { id: 2, title: "Users", path: "users", icon: HiUsers },
  { id: 3, title: "Assets", path: "assets", icon: PiTreasureChestFill },
  { id: 4, title: "Asset Category", path: "category", icon: TbCategoryPlus },
  {
    id: 5,
    title: "Repair and Maintenance",
    path: "repair-maintenance",
    icon: GiAutoRepair,
  },
  {
    id: 6,
    title: "Preventive Maintenance",
    path: "preventive-maintenance",
    icon: GrVmMaintenance,
  },
  {
    id: 7,
    title: "Repair Report",
    path: "repair-report",
    icon: TbReportSearch,
  },
  {
    id: 8,
    title: "Maintenance Report",
    path: "maintenance-report",
    icon: TbReport,
  },
  { id: 9, title: "Account", path: "account", icon: MdOutlineAccountCircle },
  { id: 10, title: "Logout", path: "logout", icon: MdLogout },
];

export const techniciannavigationLinks = [
  { id: 1, title: "Home", path: "", icon: FaHome },
  { id: 2, title: "Work Order", path: "work-order", icon: GrVmMaintenance },
  {
    id: 3,
    title: "Maintenance Schedule",
    path: "maintenance-schedule",
    icon: TbReport,
  },
  { id: 4, title: "Account", path: "account", icon: MdOutlineAccountCircle },
  { id: 5, title: "Logout", path: "logout", icon: MdLogout },
];

export const adminnavigationLinks = [
  { id: 1, title: "Home", path: "", icon: FaHome },
  { id: 2, title: "Academies", path: "academies", icon: BsHouseCheck },
  { id: 3, title: "Users", path: "users", icon: HiUsers },
  { id: 4, title: "Assets", path: "assets", icon: PiTreasureChestFill },
  {
    id: 5,
    title: "Asset Approval",
    path: "approval",
    icon: HiOutlineClipboardDocumentCheck,
  },
  {
    id: 6,
    title: "Repair and Maintenance",
    path: "repair-maintenance",
    icon: GiAutoRepair,
  },
  {
    id: 7,
    title: "Preventive Maintenance",
    path: "preventive-maintenance",
    icon: GrVmMaintenance,
  },
  {
    id: 8,
    title: "Repair Report",
    path: "repair-report",
    icon: TbReportSearch,
  },
  {
    id: 9,
    title: "Maintenance Report",
    path: "maintenance-report",
    icon: TbReport,
  },
  { id: 10, title: "Account", path: "account", icon: MdOutlineAccountCircle },
  { id: 11, title: "Logout", path: "logout", icon: MdLogout },
];

export const sadminnavigationLinks = [
  { id: 1, title: "Home", path: "", icon: FaHome },
  { id: 2, title: "Academies", path: "academies", icon: BsHouseCheck },
  { id: 3, title: "Users", path: "users", icon: HiUsers },
  { id: 4, title: "Assets", path: "assets", icon: PiTreasureChestFill },
  {
    id: 5,
    title: "Repair and Maintenance",
    path: "repair-maintenance",
    icon: GiAutoRepair,
  },
  {
    id: 6,
    title: "Preventive Maintenance",
    path: "preventive-maintenance",
    icon: GrVmMaintenance,
  },
  {
    id: 7,
    title: "Repair Report",
    path: "repair-report",
    icon: TbReportSearch,
  },
  {
    id: 8,
    title: "Maintenance Report",
    path: "maintenance-report",
    icon: TbReport,
  },
  { id: 9, title: "Account", path: "account", icon: MdOutlineAccountCircle },
  { id: 10, title: "Logout", path: "logout", icon: MdLogout },
];

export const supervisornavigationLinks = [
  { id: 1, title: "Home", path: "", icon: FaHome },
  { id: 2, title: "Work Order", path: "work-order", icon: GrVmMaintenance },
  {
    id: 3,
    title: "Repair Report",
    path: "repair-report",
    icon: TbReportSearch,
  },
  {
    id: 4,
    title: "Maintenance Report",
    path: "maintenance-report",
    icon: TbReport,
  },
  { id: 5, title: "Account", path: "account", icon: MdOutlineAccountCircle },
  { id: 6, title: "Logout", path: "logout", icon: MdLogout },
];
