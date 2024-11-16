import { useLocation, useNavigate } from "react-router-dom"
import { 
    HomeIcon, 
    ArrowLeftStartOnRectangleIcon, 
    ArrowRightStartOnRectangleIcon,
    ArrowRightEndOnRectangleIcon,
    BeakerIcon,
    ChartBarIcon,
    ChevronUpIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline'
import axios from "axios"
import toast from "react-hot-toast"
import { useEffect, useState } from "react"

const routes = [
    { path: "/", label: "Dashboard", icon: HomeIcon, roles: ['cli', 'psy'] },
    { path: "/login", label: "Login", icon: ArrowRightStartOnRectangleIcon, roles: ['guest'] },
    { path: "/register", label: "Register", icon: ArrowRightEndOnRectangleIcon, roles: ['guest'] },
    { path: "/questionnaire", label: "Pengujian", icon: BeakerIcon, roles: ['cli'], children: [
        { path: "/questionnaire/dass21", label: "DASS-21", roles: ['cli'] },
        { path: "/questionnaire/dass42", label: "DASS-42", roles: ['cli'] },
    ] },
    { path: "/reporting", label: "Report", icon: ChartBarIcon, roles: ['cli'] },
]

interface ResponseForm {
    userName: string,
    userRole: string,
    userSlug: string
}

const defaultValues: ResponseForm = {
    userName: '',
    userRole: '',
    userSlug: ''
}

export default function Sidebar() {
    const [response, setResponse] = useState<ResponseForm>(defaultValues)
    const [openDropdown, setOpenDropdown] = useState<string | null>(null)
    const navigate = useNavigate()
    const location = useLocation()

    function handleCheckInfo() {
        axios
            .get('/api/v1/show')
            .then((response) => {
                setResponse({
                    userName: response.data.data.userName,
                    userRole: response.data.data.userRole,
                    userSlug: response.data.data.userSlug
                })
            })
            .catch((error) => {
                if (error.status === 500) {
                    const errorData = error.response.data.errors
                    Object.keys(errorData).forEach((field) => {
                        toast.error(errorData[field][0])
                    })
                } else if (error.status === 401) {
                    toast.error(error.response.data.message)
                }
            })
    }

    function handleLogout() {
        axios
            .get('/api/v1/logout')
            .then(() => {
                toast.success('Logout successful')
                setResponse(defaultValues)
                navigate(0)
            })
            .catch(() => {
                toast.error('Logout failed')
            })
    }

    useEffect(() => {
        handleCheckInfo()
    }, [])

    const filteredRoutes = routes.filter(route => 
        route.roles?.includes(response.userSlug)
    )

    // TODO: make the typing later, do not use 'any'
    const mostSimilarRoute = routes.reduce((prev, curr) => {
        function checkRoute (route: any, bestMatch: any) {
          if (location.pathname.startsWith(route.path) && route.path.length > bestMatch.path.length) {
            bestMatch = route
          }
          if (route.children) {
            route.children.forEach((child: any) => {
              bestMatch = checkRoute(child, bestMatch)
            })
          }
          return bestMatch
        }
        return checkRoute(curr, prev)
      }, { path: '' })

    function toggleDropdown(path: string) {
        setOpenDropdown(openDropdown === path ? null : path)
    }

    useEffect(() => {
      const isChildRoute = filteredRoutes.some((route) =>
        route.children?.some((child) => location.pathname === child.path)
      )

      if (isChildRoute) {
        const parentPath = filteredRoutes.find((route) =>
          route.children?.some((child) => location.pathname === child.path)
        )?.path

        if (parentPath) {
          setOpenDropdown(parentPath)
        }
      }
    }, [location, filteredRoutes])

    return (
        <aside className="w-64 h-full bg-gray-800 text-white fixed flex flex-col justify-between">
            <div>
                <div className="p-8">
                    <p className="text-2xl font-bold">APLIKASI DASS</p>
                    <p className="text-sm font-base">{`OWA & IOWA`}</p>
                </div>
                <nav className="px-8">
                <ul>
                  {filteredRoutes.map((route) => (
                    <li key={route.path} className="mb-4">
                      <div
                        className="flex items-center gap-4 cursor-pointer text-lg font-medium hover:text-gray-300"
                        onClick={() =>
                          route.children ? toggleDropdown(route.path) : navigate(route.path)
                        }
                      >
                        <route.icon className="h-6 w-6" />
                        <span className={(!route.children && mostSimilarRoute.path === route.path) ? "bg-white rounded-xl px-2 text-gray-800" : ""}>
                          {route.label}
                        </span>
                        {route.children ? (
                          openDropdown === route.path ? (
                            <ChevronUpIcon className="h-5 w-5 ml-auto" />
                          ) : (
                            <ChevronDownIcon className="h-5 w-5 ml-auto" />
                          )
                        ) : null}
                      </div>
                      {route.children && openDropdown === route.path && (
                        <ul className="mt-4">
                          {route.children.map((child) => (
                            <li key={child.path} className="mb-4">
                              <div
                                className="flex items-center gap-4 cursor-pointer text-lg font-medium hover:text-gray-300"
                                onClick={() => navigate(child.path)}
                              >
                                <div className="h-6 w-6 text-gray-800">-</div>
                                <span className={(mostSimilarRoute.path === child.path) ? "bg-white rounded-xl px-2 text-gray-800" : ""}>
                                  {child.label}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
                </nav>
                {response.userName && (
                    <div className="px-8 text-lg font-medium hover:text-gray-300 flex gap-4">
                        <ArrowLeftStartOnRectangleIcon className="h-6 w-6" />
                        <button type="button" onClick={handleLogout}>
                            Keluar
                        </button>
                    </div>
                )}
            </div>

            {response.userName && (
                <div className="flex flex-col p-8">
                    <div className="text-lg font-bold">{response.userName}</div>
                    <div className="text-sm font-medium">{response.userRole}</div>
                </div>
            )}
        </aside>
    )
}
