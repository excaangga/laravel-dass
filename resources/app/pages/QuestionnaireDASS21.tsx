import axios from "axios"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

interface ResponseForm {
    questions: {
        id: number,
        questionContent: string
    }[],
}

interface RequestForm {
    [questionId: number]: number
}

const defaultValues: ResponseForm = {
    questions: [],
}

const dummyData = {
    data1: {
        id: '1',
        name: 'Pak Bendu Si Psikolog cs.',
        methodType: 'OWA'
    },
    data2: {
        id: '2',
        name: 'Pak Bendu Si Psikolog cs.',
        methodType: 'IOWA'
    }
}

export default function QuestionnaireDASS21() {
    const [response, setResponse] = useState<ResponseForm>(defaultValues)
    const [selectedTeam, setSelectedTeam] = useState('')
    const [scores, setScores] = useState<RequestForm>({})

    useEffect(() => {
        axios
            .post('/api/v1/questionnaire', { questionType: 'DASS21' })
            .then((response) => {
                const questions = response.data.data.map((item: { id: number, question: string }) => ({
                    id: item.id,
                    questionContent: item.question
                })) 
                setResponse({ questions })
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
    }, [])

    function handleScoreChange(questionId: number, score: number) {
        setScores((prevScores) => ({
            ...prevScores,
            [questionId]: score
        }))
    }

    function handleTeamChange(event: React.ChangeEvent<HTMLSelectElement>) {
        setSelectedTeam(event.target.value)
      }

    return (
        <div className="px-8">
            {selectedTeam !== '' ? ( // Render content only if a team is selected
                <>
                    <div className="w-full mb-16 mt-6 flex justify-between">
                        <div className="text-xl">Kuisioner DASS 21</div>
                        <div className="text-xl">
                            {selectedTeam 
                                ? `${dummyData[selectedTeam].name} - ${dummyData[selectedTeam].methodType}`
                                : ''}
                        </div>

                    </div>
                    <div className="mb-16 text-lg flex flex-col gap-2">
                        <span>Petunjuk: </span>
                        <span>1. Isilah berdasarkan kondisi aktual Anda terkini </span>
                        <span>2. Tes ini tidak bertujuan untuk menggantikan peran profesional psikolog saat konsultasi </span>
                    </div>
                    {response.questions.map((question) => (
                        <div className="bg-gray-800 text-white mb-4 p-5 flex flex-col gap-2">
                            <div>{`${question.id}. ${question.questionContent}`}</div>
                            <select
                                className="bg-gray-700 p-2 rounded-md"
                                value={scores[question.id] ?? ''}
                                onChange={(e) => handleScoreChange(question.id, parseInt(e.target.value))}
                            >
                                <option value="" disabled>Pilih Skor</option>
                                <option value={0}>Tidak Terjadi</option>
                                <option value={1}>Jarang Terjadi</option>
                                <option value={2}>Kadang Terjadi</option>
                                <option value={3}>Sering Terjadi</option>
                            </select>
                        </div>
                    ))}
                    <div className="flex justify-center items-center">
                        <button
                            type='button'
                            className='bg-blue-900 text-xl py-4 px-16 my-8 rounded-md text-white'
                        >
                            Submit
                        </button>
                    </div>
                </>
            ) : (
                <div className="h-full mt-40 flex flex-col justify-center items-center gap-8">
                    <label className="text-4xl font-bold">Pilih Analisis dari Tim...</label>
                    <select value={selectedTeam} onChange={handleTeamChange} className="border border-gray-800 text-2xl rounded-xl">
                        <option value={''}>Pilih Tim</option>
                        {Object.keys(dummyData).map((key) => (
                            <option key={key} value={key as keyof typeof dummyData}>
                                {`${dummyData[key].name} - ${dummyData[key].methodType}`}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    )
}
