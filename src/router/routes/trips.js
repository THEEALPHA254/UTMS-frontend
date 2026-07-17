import Bookings from "@/views/trip-management/BookingView.vue"
import Buses from "@/views/trip-management/BusesView.vue"
import Routes from "@/views/trip-management/RoutesView.vue"
import Schedules from "@/views/trip-management/SchedulesView.vue"
import Trips from "@/views/trip-management/TripsView.vue"


export default [


    {
        path: "/buses",
        name: "buses",
        component: Buses,
        meta: {
            requiresAuth: true,
            title: "Buses",
            breadCrumb: [
                {
                    text: "Buses", to: { name: "buses" },
                    active: true,
                },
            ],
        },
    },

    {
        path: "/bookings",
        name: "bookings",
        component: Bookings,
        meta: {
            requiresAuth: true,
            title: "Bookings",
            breadCrumb: [                
                {
                    text: "Bookings", to: { name: "bookings" },
                    active: true,
                },
            ],
        },
    },

    {
        path: "/routes",
        name: "routes",
        component: Routes,
        meta: {
            requiresAuth: true,
            title: "Routes",
            breadCrumb: [                
                {
                    text: "Routes", to: { name: "routes" },
                    active: true,
                },
            ],
        },
    },

    {
        path: "/trips",
        name: "trips",
        component: Trips,
        meta: {
            requiresAuth: true,
            title: "Trips",
            breadCrumb: [
                {
                    text: "Trips", to: { name: "trips" },
                    active: true,
                },
            ],
        },
    },

    {
        path: "/schedules",
        name: "schedules",
        component: Schedules,
        meta: {
            requiresAuth: true,
            title: "Schedules",
            breadCrumb: [
                {
                    text: "Schedules", to: { name: "schedules" },
                    active: true,
                },
            ],
        },
    },

]