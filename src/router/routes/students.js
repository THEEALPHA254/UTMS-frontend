import Students from "@/views/students/StudentListView.vue"


export default [


    // ReportsView 
    {
        path: "/students",
        name: "students",
        component: Students,
        meta: {
            requiresAuth: true,
            title: "Students",
            breadCrumb: [                
                {
                    text: "Students", to: { name: "students" },
                    active: true,
                },
            ],
        },
    }
]