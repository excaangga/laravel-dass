import Table from "@/components/Table"
import { ChevronLeftIcon } from "@heroicons/react/24/outline"
import axios from "axios"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import ScoringDASS21 from "./ScoringDASS21"
import ScoringDASS42 from "./ScoringDASS42"

interface ResponseData {
    teamMember: string,
    dass21CreatedAt: string,
    dass42CreatedAt: string,
    userHasScoredDass21: boolean,
    userHasScoredDass42: boolean,
    memberExistsWithNoDass21Score: boolean,
    memberExistsWithNoDass42Score: boolean
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
    const [isScoring, setIsScoring] = useState<'dass21' | 'dass42' | null>(null)

    const headers = [
        'Nama Psikolog',
        'Tanggal Scoring DASS21',
        'Tanggal Scoring DASS42'
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

    function handlePublish(event?: React.FormEvent<HTMLFormElement>) {
        event?.preventDefault()
        axios
            .post('/api/v1/scoring/publish', { questionTeamId })
            .then((response) => {
                toast.success(response.data.message)
                fetch(currentPage)
                onBack()
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

    useEffect(() => {
        fetch(currentPage)
    }, [currentPage])

    function handlePageChange(newPage: number) {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage)
        }
    }
    
    const mappedResponse = response.map((item) => ({
        teamMember: item.teamMember,
        dass21CreatedAt: item.dass21CreatedAt,
        dass42CreatedAt: item.dass42CreatedAt,
    }))

    return (
        <div className="h-full">
            {!loading ? (
                <>
                    {isScoring === 'dass21' ? (
                        <ScoringDASS21 
                            questionTeamId={questionTeamId} 
                            questionTeamName={questionTeamName}
                            onBack={() => {
                                setIsScoring(null)
                                fetch(currentPage)
                            }} 
                        />
                    ) : isScoring === 'dass42' ? (
                        <ScoringDASS42 
                            questionTeamId={questionTeamId} 
                            questionTeamName={questionTeamName}
                            onBack={() => {
                                setIsScoring(null)
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
                                    {(response.length > 0 && !response[0].userHasScoredDass21) && (
                                        <>
                                            <button className="underline" onClick={() => setIsScoring('dass21')}>
                                                Tambah Scoring DASS21
                                            </button>
                                            <span>|</span>
                                        </>                                    
                                    )}
                                    {(response.length > 0 && !response[0].userHasScoredDass42) && (
                                        <>
                                            <button className="underline" onClick={() => setIsScoring('dass42')}>
                                                Tambah Scoring DASS42
                                            </button>
                                            <span>|</span>
                                        </>                                    
                                    )}
                                    { isPublished !== true && (
                                        <button 
                                            className={`
                                                underline 
                                                ${(response.find((item) => item.memberExistsWithNoDass21Score === false || response.find((item) => item.memberExistsWithNoDass42Score === false ))) ? 'cursor-not-allowed' : ''}
                                            `} 
                                            onClick={() => handlePublish()}
                                        >
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
