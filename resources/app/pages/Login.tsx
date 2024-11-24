import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface RequestData {
    email: string,
    password: string
}

const defaultValues: RequestData = {
    email: '',
    password: ''
}

export default function Login() {
    const [request, setRequest] = useState<RequestData>(defaultValues)
    const navigate = useNavigate()

    function handleSubmit(event?: React.FormEvent<HTMLFormElement>) {
        event?.preventDefault()
        axios
            .post('/api/v1/login', request)
            .then((response) => {
                toast.success(response.data.message)
                navigate(0)
            })
            .catch((error) => {
                if (error.status === 422) {
                    const errorData = error.response.data.errors
                    Object.keys(errorData).forEach((field) => {
                        toast.error(errorData[field][0])
                    })
                } else if (error.status === 401) {
                    toast.error(error.response.data.message)
                } else {
                    toast.error(error.response.data.message)
                }
            })
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target
        setRequest({
            ...request,
            [name]: value
        })
    }

    return (
        <div className="flex flex-col gap-8 justify-center items-center h-screen">
            <div className="text-3xl font-bold">LOGIN <span className="text-white bg-gray-800 p-2">APLIKASI DASS</span></div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 w-96">
                <label className="text-lg font-semibold">Email:</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    className="bg-gray-100 p-2 rounded-md"
                    value={request.email}
                    onChange={handleChange}
                />
                <label className="text-lg font-semibold">Password:</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    className="bg-gray-100 p-2 rounded-md"
                    value={request.password}
                    onChange={handleChange}
                />
                <button type="submit" className="bg-blue-900 text-xl p-2 mt-16 rounded-md text-white">Login</button>
            </form>
        </div>
    )
}
