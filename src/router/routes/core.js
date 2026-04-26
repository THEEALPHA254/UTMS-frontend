const coreRoutes = [
  {
    path: '/',
    component: () => import('@/layouts/default/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/HomeView.vue'),
        meta: {
          requiresAuth: true,
          title: 'Home',
        },
      },
    ],
  },
]

export default coreRoutes
