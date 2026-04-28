import Drivers from "@/views/staff/DriverView.vue"


export default [

    {
        path: "/drivers",
        name: "drivers",
        component: Drivers,
        meta: {
            requiresAuth: true,
            title: "Drivers",
            breadCrumb: [                
                {
                    text: "Drivers", to: { name: "drivers" },
                    active: true,
                },
            ],
        },
    }
]