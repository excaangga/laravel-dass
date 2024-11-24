import Table from "@/components/Table"
import { ChevronLeftIcon } from "@heroicons/react/24/outline"
import axios from "axios"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import ScoringDASS21 from "./ScoringDASS21"

interface ResponseData {
    createdAt: string,
    teamMember: string,
    hasSubmittedScoring: boolean,
    userHasScored: boolean
}

const defaultValues: ResponseData[] = []

interface ScoringsProps {
    questionTeamId: string, 
    questionTeamName: string,
    isPublished: boolean,
    onBack: () => void
}

export default function Scorings({ questionTeamId, questionTeamName, isPublished, onBack }: ScoringsProps) {
    const [response, setResponse] = useState<ResponseData[]>(defaultValues)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [totalPages, setTotalPages] = useState<number>(1)
    const [loading, setLoading] = useState<boolean>(false)
    const [isScoring, setIsScoring] = useState<boolean>(false)

    const headers = [
        'Tanggal Scoring',
        'Nama Psikolog',
        'Status'
    ]

    function fetch(page: number) {
        setLoading(true)
        axios
            .post('/api/v1/scoring', { page, questionTeamId: parseInt(questionTeamId) })
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
        createdAt: item.createdAt,
        teamMember: item.teamMember,
        hasSubmittedScoring: item.hasSubmittedScoring ? 'Selesai Scoring' : 'Belum Scoring'
    }))

    return (
        <div className="h-full">
            {!loading ? (
                <>
                    {isScoring ? (
                        <ScoringDASS21 
                            questionTeamId={questionTeamId} 
                            questionTeamName={questionTeamName}
                            onBack={() => {
                                setIsScoring(false)
                                fetch(currentPage)
                            }} 
                        />
                    ) : (
                        <div className="w-full my-6 flex flex-col gap-4">
                            <div className="flex justify-between">
                                <div className="font-semibold text-xl flex items-center gap-4">
                                    <ChevronLeftIcon className="h-6 w-6 cursor-pointer" onClick={onBack} />
                                    <span>{questionTeamName}</span>
                                </div>
                                <div className="font-medium text-lg flex gap-4">
                                    {(response.length > 0 && !response[0].userHasScored) && (
                                        <>
                                            <button className="underline" onClick={() => setIsScoring(true)}>
                                                Tambah Scoring Anda
                                            </button>
                                            <span>|</span>
                                        </>                                    
                                    )}
                                    { isPublished !== true && (
                                        <button className={`underline ${response.find((item) => item.hasSubmittedScoring === false) ? 'cursor-not-allowed' : ''}`} onClick={() => {}}>
                                            Publikasi
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div>
                                <Table headers={headers} data={mappedResponse} />
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
