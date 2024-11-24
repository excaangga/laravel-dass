import Scorings from "@/components/Scorings"
import Table from "@/components/Table"
import axios from "axios"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

interface ResponseData {
    id: string,
    questionTeam: string,
    code: string,
    teamMembers: string,
    isPublished: boolean,
    createdAt: string,
}

const defaultValues: ResponseData[] = []

export default function Teams() {
    const [response, setResponse] = useState<ResponseData[]>(defaultValues)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [totalPages, setTotalPages] = useState<number>(1)
    const [loading, setLoading] = useState<boolean>(false)
    const [selectedTeam, setSelectedTeam] = useState<ResponseData | null>(null)
    const navigate = useNavigate()

    const headers = [
        'Tanggal Dibuat',
        'Nama Tim',
        'Kode Tim',
        'Anggota Tim',
        'Status'
    ]
    const actions = [
        { 
            label: 'Detail', 
            action: (row: ResponseData) => {
                return setSelectedTeam(row)
            } 
        }
    ]

    function fetch(page: number) {
        setLoading(true)
        axios
            .post('/api/v1/teams', { page })
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

    function handlePageChange(newPage: number) {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage)
        }
    }
    
    const mappedResponse = response.map((item) => ({
        ...item,
        isPublished: item.isPublished ? 'Dipublikasi' : 'Belum dipublikasi'
    }))

    function resetSelectedTeam() {
        setSelectedTeam(null)
    }

    return (
        <div className="h-full px-8">
            {!loading ? (
                <>
                    {selectedTeam ? (
                        <Scorings 
                            questionTeamId={selectedTeam.id} 
                            questionTeamName={selectedTeam.questionTeam} 
                            isPublished={selectedTeam.isPublished}
                            onBack={resetSelectedTeam} 
                        />                        
                    ) : (
                        <div className="w-full my-6 flex flex-col gap-4">
                            <div className="flex justify-between">
                                <div className="font-semibold text-xl">
                                    Data Tim
                                </div>
                                <div className="font-medium text-lg flex gap-4">
                                    <button className="underline" onClick={() => navigate('/teams/create')}>
                                        Buat Tim Baru
                                    </button>
                                    <span>|</span>
                                    <button className="underline" onClick={() => navigate('/teams/join')}>
                                        Bergabung
                                    </button>
                                </div>
                            </div>
                            <div>
                                <Table headers={headers} data={mappedResponse} actions={actions} />
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
                    )}
                </>
            ) : (
                <div>Loading...</div>
            )}
        </div>
    )
}
