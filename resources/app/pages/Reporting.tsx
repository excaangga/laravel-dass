import Table from "@/components/Table"
import axios from "axios"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ResponseData {
    id: number,
    questionTeam: string,
    questionType: string,
    depressionScore: string,
    anxietyScore: string,
    stressScore: string,
    createdAt: string
}

const defaultValues: ResponseData[] = []

export default function Questionnaire() {
    const [response, setResponse] = useState<ResponseData[]>(defaultValues)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [totalPages, setTotalPages] = useState<number>(1)
    const [loading, setLoading] = useState<boolean>(false)
    const headers = [
        'Waktu Uji',
        'Tim Peneliti',
        'Jenis Kuisioner',
        'Skor Depresi',
        'Skor Kecemasan',
        'Skor Stress',
    ]

    function fetch(page: number) {
        setLoading(true)
        axios
            .post('/api/v1/reporting', { page })
            .then((response) => {
                setResponse(response.data.data)
                setTotalPages(response.data.pagination.lastPage)
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
            .finally(() => setLoading(false))

    }

    useEffect(() => {
        fetch(currentPage)
    }, [currentPage])

    const mappedData = response.map((data) => ({
        ...data,
        depressionScore: parseFloat(data.depressionScore),
        anxietyScore: parseFloat(data.anxietyScore),
        stressScore: parseFloat(data.stressScore)
    }))

    function handlePageChange(newPage: number) {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage)
        }
    }

    const reversedData = [...mappedData].reverse()

    return (
        <div className="h-full px-8 flex flex-col justify-between">
            {!loading ? (
                <>
                    <div className="w-full my-6 flex flex-col gap-4">
                        <div className="font-semibold text-xl">
                            Data Pengujian
                        </div>
                        <div>
                            <Table headers={headers} data={mappedData} />
                            <div className="flex justify-between items-center mt-4 text-sm font-semibold">
                                <span className="font-light">
                                    Halaman {currentPage} dari {totalPages}
                                </span>
                                <div className="flex gap-4">
                                    <button
                                        className={`px-4 py-2 border border-gray-300 rounded ${currentPage === 1 ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                        disabled={currentPage === 1}
                                        onClick={() => handlePageChange(currentPage - 1)}
                                    >
                                        Sebelumnya
                                    </button>
                                    <button
                                        className={`px-4 py-2 border border-gray-300 rounded ${currentPage === totalPages ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                        disabled={currentPage === totalPages}
                                        onClick={() => handlePageChange(currentPage + 1)}
                                    >
                                        Selanjutnya
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full my-6 flex flex-col gap-4">
                        <div className="font-semibold text-xl">
                            Visualisasi
                        </div>
                        <div style={{ width: "100%", height: "400px" }}>
                            <ResponsiveContainer>
                                <LineChart
                                    data={reversedData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="createdAt" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="depressionScore"
                                        stroke="#8884d8"
                                        activeDot={{ r: 8 }}
                                        name="Skor Depresi"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="anxietyScore"
                                        stroke="#82ca9d"
                                        name="Skor Kecemasan"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="stressScore"
                                        stroke="#ff7300"
                                        name="Skor Stress"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            ) : (
                <div>Loading...</div>
            )}
        </div>
    )
}
