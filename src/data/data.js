import { FaHome} from "react-icons/fa";
import { HiUsers } from "react-icons/hi";
import { PiTreasureChestFill } from "react-icons/pi";
import { TbCategoryPlus } from "react-icons/tb";
import { GiAutoRepair} from "react-icons/gi";
import { GrVmMaintenance } from "react-icons/gr";
import { TbReportSearch,TbReport } from "react-icons/tb";


export const managernavigationLinks = [
    { id: 1, title: 'Home', path:"/", icon: FaHome },
    { id: 2, title: 'Users', path: "/MUsers", icon: HiUsers },
    { id: 3, title: 'Assets', path:"/Massets", icon: PiTreasureChestFill },
    { id: 4, title: 'Asset Category', path:"/Mcategory", icon: TbCategoryPlus },
    { id: 5, title: 'Repair and Maintenance', path:"/MRepairMaintenance", icon: GiAutoRepair  },
    { id: 6, title: 'Preventive Maintenance', path:"/MPMaintenance", icon: GrVmMaintenance },
    { id: 7, title: 'Repair Report', path:"/MRepairReport", icon: TbReportSearch  },
    { id: 8, title: 'Maintenance Report',path:"/MMaintenanceReport", icon: TbReport }
];

// Export the other data objects
export const budget = [
    // your budget data here
];

export const transactions = [
    // your transactions data here
];

export const reportData = [
    // your report data here
];

export const subscriptions = [
    // your subscriptions data here
];

export const savings = [
    // your savings data here
];