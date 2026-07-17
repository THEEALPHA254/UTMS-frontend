import Staff from "@/views/staff/StaffView.vue"


export default [

    {
        path: "/staff",
        name: "staff",
        component: Staff,
        meta: {
            requiresAuth: true,
            title: "Staff",
            breadCrumb: [                
                {
                    text: "Staff", to: { name: "staff" },
                    active: true,
                },
            ],
        },
    }
]