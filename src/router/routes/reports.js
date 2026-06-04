import ReportsView from "@/views/reports/ReportsView.vue"
import MonthlyTripsReport from "@/views/reports/MonthlyTripsReport.vue"
import BookingReport from "@/views/reports/BookingReport.vue"
import VehicleOccupancyReport from "@/views/reports/VehicleOccupancyReport.vue"
import DriverPerformanceReport from "@/views/reports/DriverPerformanceReport.vue"

export default [
    {
        path: "/reports",
        name: "reports",
        redirect: { name: "reports-custom" },
    },
    {
        path: "/reports/custom",
        name: "reports-custom",
        component: ReportsView,
        meta: { requiresAuth: true, title: "Custom Reports" },
    },
    {
        path: "/reports/monthly-trips",
        name: "reports-monthly-trips",
        component: MonthlyTripsReport,
        meta: { requiresAuth: true, title: "Monthly Trips Report" },
    },
    {
        path: "/reports/bookings",
        name: "reports-bookings",
        component: BookingReport,
        meta: { requiresAuth: true, title: "Booking Reports" },
    },
    {
        path: "/reports/vehicle-occupancy",
        name: "reports-vehicle-occupancy",
        component: VehicleOccupancyReport,
        meta: { requiresAuth: true, title: "Vehicle Occupancy" },
    },
    {
        path: "/reports/driver-performance",
        name: "reports-driver-performance",
        component: DriverPerformanceReport,
        meta: { requiresAuth: true, title: "Driver Performance" },
    },
]