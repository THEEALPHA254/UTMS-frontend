// const authRoutes = [
//   {
//     path: '/login',
//     name: 'login',
//     component: () => import('@/views/auth/LoginView.vue'),
//     meta: {
//       redirectIfAuthenticated: true,
//       title: 'Login',
//     },
//   },
// ]

// export default authRoutes


import Login from "@/views/auth/LoginView.vue";


export default [
  {
    path: "/login",
    name: "login",
    component: Login,
    meta: {
      redirectIfAuthenticated: true,
      title: "Login",
    },
  },
 
];

