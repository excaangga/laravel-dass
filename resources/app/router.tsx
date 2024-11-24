import React from 'react'
import { Route, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import RootLayout from "@/layouts/RootLayout"
import RouteLoading from "@/components/RouteLoading"
import Error404 from "@/components/404"
import withAuth from './components/WithAuth'

const Home = React.lazy(() => import('@/pages/Home'))
const Login = React.lazy(() => import('@/pages/Login'))
const Register = React.lazy(() => import('@/pages/Register'))
const QuestionnaireDASS21 = React.lazy(() => import('@/pages/QuestionnaireDASS21'))
const QuestionnaireDASS42 = React.lazy(() => import('@/pages/QuestionnaireDASS42'))
const Reporting = React.lazy(() => import('@/pages/Reporting'))
const Teams = React.lazy(() => import('@/pages/Teams'))
const CreateTeam = React.lazy(() => import('@/components/CreateTeam'))
const JoinTeam = React.lazy(() => import('@/components/JoinTeam'))

async function suspenseWrapper(Component: React.ComponentType, allowedRoles: string[]) {
    const WrappedComponent = await withAuth(Component, allowedRoles)
    return (
        <React.Suspense fallback={<RouteLoading />}>
            <WrappedComponent />
        </React.Suspense>
    )
}

const routes = [
    { path: '/', element: <RootLayout />, children: [
        { index: true, element: await suspenseWrapper(Home, ['cli', 'psy']) },
        { path: 'login', element: await suspenseWrapper(Login, ['guest']) },
        { path: 'register', element: await suspenseWrapper(Register, ['guest']) },
        { path: 'questionnaire/dass21', element: await suspenseWrapper(QuestionnaireDASS21, ['cli']) },
        { path: 'questionnaire/dass42', element: await suspenseWrapper(QuestionnaireDASS42, ['cli']) },
        { path: 'reporting', element: await suspenseWrapper(Reporting, ['cli']) },
        { path: 'teams', element: await suspenseWrapper(Teams, ['psy']) },
        { path: 'teams/create', element: await suspenseWrapper(CreateTeam, ['psy']) },
        { path: 'teams/join', element: await suspenseWrapper(JoinTeam, ['psy']) },
        { path: '*', element: <Error404 /> },
    ]},
]

const router = createBrowserRouter(
    createRoutesFromElements(
        routes.map(({ path, element, children }) => (
            <Route key={path} path={path} element={element}>
                { children && children.map(({ path, element, index }) => (
                    <Route key={path || 'index'} path={path} index={index} element={element} />
                ))}
            </Route>
        ))
    )
)

export default router
