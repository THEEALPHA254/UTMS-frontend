import Payment from "@/views/payments/PaymentsView.vue"


export default [


    // payment 
    {
        path: "/payment",
        name: "payment",
        component: Payment,
        meta: {
            requiresAuth: true,
            title: "Payment",
            breadCrumb: [                
                {
                    text: "Payment", to: { name: "payment" },
                    active: true,
                },
            ],
        },
    }
]