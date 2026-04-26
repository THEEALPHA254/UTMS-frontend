import Dashboard from "@/views/dashboards/dashboard.vue"

export default [


    // dashboard 
    {
        path: "/dashboard",
        name: "dashboard",
        component: Dashboard,
        meta: {
            requiresAuth: true,
            title: "Dashboard",
            breadCrumb: [                
                {
                    text: "Dashboard", to: { name: "dashboard" },
                    active: true,
                },
            ],
        },
    }
]

