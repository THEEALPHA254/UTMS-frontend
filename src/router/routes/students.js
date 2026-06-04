import Students from "@/views/students/StudentListView.vue"
import StudentDetail from "@/views/students/StudentDetailView.vue"

export default [
    {
        path: "/students",
        name: "students",
        component: Students,
        meta: {
            requiresAuth: true,
            title: "Students",
            breadCrumb: [
                { text: "Students", to: { name: "students" }, active: true },
            ],
        },
    },
    {
        path: "/students/:id",
        name: "student-detail",
        component: StudentDetail,
        meta: {
            requiresAuth: true,
            title: "Student Detail",
            breadCrumb: [
                { text: "Students", to: { name: "students" } },
                { text: "Detail", active: true },
            ],
        },
    },
]