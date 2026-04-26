import ReportsView from "@/views/reports/ReportsView.vue"


export default [


    // ReportsView 
    {
        path: "/reports",
        name: "reports",
        component: ReportsView,
        meta: {
            requiresAuth: true,
            title: "ReportsView",
            breadCrumb: [                
                {
                    text: "ReportsView", to: { name: "reports" },
                    active: true,
                },
            ],
        },
    }
]