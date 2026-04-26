import Bookings from "@/views/trip-management/BookingView.vue"
import Routes from "@/views/trip-management/RoutesView.vue"
import Trips from "@/views/trip-management/TripsView.vue"


export default [


    // Trip View 
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

]