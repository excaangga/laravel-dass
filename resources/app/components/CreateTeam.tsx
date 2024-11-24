import { Option } from "@/types/global";
import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Select, { SingleValue } from "react-select";

interface RequestData {
    teamName: string,
    teamCode: string,
    methodType: string
}

const defaultValues: RequestData = {
    teamName: '',
    teamCode: '',
    methodType: 'OWA'
}

const methodTypeOptions: Option[] = [
    { value: 'OWA', label: 'OWA' },
    { value: 'IOWA', label: 'IOWA' }
] 

export default function CreateTeam() {
    const [request, setRequest] = useState<RequestData>(defaultValues)
    const navigate = useNavigate()

    function handleSubmit(event?: React.FormEvent<HTMLFormElement>) {
        event?.preventDefault()
        axios
            .post('/api/v1/teams/store', request)
            .then((response) => {
                toast.success(response.data.message)
                navigate('/teams')
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

    function handleMethodTypeChange(option: SingleValue<Option>) {
        if (option) {
            setRequest({
                ...request,
                methodType: option.value,
            })
        }
    }

    return (
        <div className="flex flex-col gap-8 justify-center items-center h-screen">
            <div className="text-3xl font-bold">Buat Tim Psikolog</div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 w-96">
                <label className="text-xl font-bold">Nama Tim:</label>
                <input
                    type="text"
                    id="teamName"
                    name="teamName"
                    className="bg-gray-100 p-2 rounded-md"
                    value={request.teamName}
                    onChange={handleChange}
                />
                <label className="text-xl font-bold">Kode Tim:</label>
                <input
                    type="text"
                    id="teamCode"
                    name="teamCode"
                    className="bg-gray-100 p-2 rounded-md"
                    value={request.teamCode}
                    onChange={handleChange}
                />
                <label className="text-xl font-bold">Metode:</label>
                <Select
                    placeholder="Pilih Metode Kalkulasi"
                    options={methodTypeOptions}
                    value={methodTypeOptions.find((option) => option.value === request.methodType)}
                    onChange={handleMethodTypeChange}
                    className="text-gray-700"
                />
                <button type="submit" className="bg-blue-900 text-xl p-2 mt-20 rounded-md text-white">Submit</button>
            </form>
        </div>
    )
}
