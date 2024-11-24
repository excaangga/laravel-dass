import { Option } from "@/types/global";
import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Select, { SingleValue } from "react-select";

interface RequestData {
    email: string,
    password: string,
    name: string,
    userType: string
}

const defaultValues: RequestData = {
    email: '',
    password: '',
    name: '',
    userType: 'cli'
}

const userTypeOptions: Option[] = [
    { value: 'cli', label: 'Client' },
    { value: 'psy', label: 'Psychologist' }
] 

export default function Register() {
    const [request, setRequest] = useState<RequestData>(defaultValues)
    const navigate = useNavigate()

    function handleSubmit(event?: React.FormEvent<HTMLFormElement>) {
        event?.preventDefault()
        axios
            .post('/api/v1/register', request)
            .then((response) => {
                toast.success(response.data.message)
                navigate('/login')
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

    function handleUserTypeChange(option: SingleValue<Option>) {
        if (option) {
            setRequest({
                ...request,
                userType: option.value,
            })
        }
    }

    return (
        <div className="flex flex-col gap-8 justify-center items-center h-screen">
            <div className="text-3xl font-bold">REGISTER <span className="text-white bg-gray-800 p-2">AKUN</span></div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 w-96">
                <label className="text-xl font-bold">Name:</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    className="bg-gray-100 p-2 rounded-md"
                    value={request.name}
                    onChange={handleChange}
                />
                <label className="text-xl font-bold">Email:</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    className="bg-gray-100 p-2 rounded-md"
                    value={request.email}
                    onChange={handleChange}
                />
                <label className="text-xl font-bold">Password:</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    className="bg-gray-100 p-2 rounded-md"
                    value={request.password}
                    onChange={handleChange}
                />
                <label className="text-xl font-bold">User Type:</label>
                <Select
                    placeholder="Select User Type"
                    options={userTypeOptions}
                    value={userTypeOptions.find((option) => option.value === request.userType)}
                    onChange={handleUserTypeChange}
                    className="text-gray-700"
                />
                <button type="submit" className="bg-blue-900 text-xl p-2 mt-20 rounded-md text-white">Register</button>
            </form>
        </div>
    )
}
