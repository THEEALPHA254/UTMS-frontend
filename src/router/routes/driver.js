import Drivers from "@/views/staff/DriverView.vue"
import DriverDetail from "@/views/staff/DriverDetailView.vue"

export default [
    {
        path: "/drivers",
        name: "drivers",
        component: Drivers,
        meta: {
            requiresAuth: true,
            title: "Drivers",
            breadCrumb: [
                { text: "Drivers", to: { name: "drivers" }, active: true },
            ],
        },
    },
    {
        path: "/drivers/:id",
        name: "driver-detail",
        component: DriverDetail,
        meta: {
            requiresAuth: true,
            title: "Driver Detail",
            breadCrumb: [
                { text: "Drivers", to: { name: "drivers" } },
                { text: "Detail", active: true },
            ],
        },
    },
]