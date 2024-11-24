import { NumberOption, Option } from "@/types/global"
import axios from "axios"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import Select, { SingleValue } from "react-select"

interface ResponseData {
    data: {
        id: number,
        question: string
    }[],
    teamOptions: Option[],
    finalScore?: {
        depressionScore: number,
        anxietyScore: number,
        stressScore: number
    }
}

interface RequestData {
    questionType: 'DASS21' | 'DASS42',
    questionTeamId?: string
}

interface Score {
    [questionId: number]: number
}

const defaultResponseValues: ResponseData = {
    data: [],
    teamOptions: [],
}

const defaultRequestValues: RequestData = {
    questionType: 'DASS42',
}

const scoreOptions: NumberOption[] = [
    { label: "Tidak Terjadi", value: 0 },
    { label: "Jarang Terjadi", value: 1 },
    { label: "Kadang Terjadi", value: 2 },
    { label: "Sering Terjadi", value: 3 }
]

export default function QuestionnaireDASS42() {
    const [response, setResponse] = useState<ResponseData>(defaultResponseValues)
    const [request, setRequest] = useState<RequestData>(defaultRequestValues)
    const [scores, setScores] = useState<Score>({})
    const [processing, setProcessing] =useState<boolean>(true)

    function handleScoreChange(questionId: number, newValue: SingleValue<NumberOption>) {
        if (newValue) {
            setScores((prevScores) => ({
                ...prevScores,
                [questionId]: newValue.value,
            }))
        }
    }

    function handleTeamChange(newValue: SingleValue<Option>) {
        setRequest((prevRequest) => ({
            ...prevRequest,
            questionTeamId: newValue?.value,
        }))
    }

    // initial fetching to get the teamOptions
    useEffect(() => {
        axios
            .post('/api/v1/questionnaire', request)
            .then((response) => {
                const questions = response.data               
                setResponse(questions)
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

    // fetch the data if theres any change in the request
    useEffect(() => {
        axios
            .post('/api/v1/questionnaire', request)
            .then((response) => {
                const questions = response.data               
                setResponse(questions)
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
    }, [request])

    function handleSubmitScore() {
        const data = {
            questions: scores,
            questionTeamId: request.questionTeamId
        }

        axios   
            .post('/api/v1/questionnaire/score', data)
            .then((response) => {
                const result = response.data.data        
                setResponse((prev) => ({
                    ...prev,
                    finalScore: result
                }))
                toast.success(response.data.message)
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

    // assign true to processing if the object count is not 21 or 42
    useEffect(() => {
        setProcessing(Object.keys(scores).length !== (request.questionType === 'DASS21' ? 21 : 42))
    }, [scores])

    return (
        <div className="px-8">
            {(response.finalScore) ? ( // Show the result after the user has submitted the form
                <div className="flex flex-col justify-center mt-40 gap-16">
                    <div className="text-xl text-center font-semibold">
                        Skor yang Anda peroleh:
                    </div>
                    <div className="flex flex-col gap-8">
                        <div className="flex gap-8 justify-center text-white">
                            <div className="flex flex-col gap-2 bg-gray-800 p-2 w-32 text-center rounded-md">
                                <span>Depresi</span>
                                <span>{response.finalScore.depressionScore}</span>
                            </div>
                            <div className="flex flex-col gap-2 bg-gray-800 p-2 w-32 text-center rounded-md">
                                <span>Kecemasan</span>
                                <span>{response.finalScore.anxietyScore}</span>
                            </div>
                            <div className="flex flex-col gap-2 bg-gray-800 p-2 w-32 text-center rounded-md">
                                <span>Stress</span>
                                <span>{response.finalScore.stressScore}</span>
                            </div>
                        </div>
                        <div className="text-center text-sm">
                            {response.teamOptions.find((option) => option.value === request.questionTeamId) 
                                ? `(Perhitungan menggunakan bobot dari ${response.teamOptions.find((option) => option.value === request.questionTeamId)?.label})`
                                : ''}
                        </div>
                    </div>
                </div>
            ) : (
                (response.data && response.data.length !== 0) ? ( // Render content only if a team is selected
                    <>
                        <div className="w-full mb-16 mt-6 flex justify-between font-semibold">
                            <div className="text-xl">Kuisioner DASS 42</div>
                            <div className="text-xl">
                                {response.teamOptions.find((option) => option.value === request.questionTeamId) 
                                    ? `${response.teamOptions.find((option) => option.value === request.questionTeamId)?.label}`
                                    : ''}
                            </div>

                        </div>
                        <div className="mb-16 text-lg flex flex-col gap-2">
                            <span>Petunjuk: </span>
                            <span>1. Isilah berdasarkan kondisi aktual Anda terkini </span>
                            <span>2. Tes ini tidak bertujuan untuk menggantikan peran profesional psikolog saat konsultasi </span>
                        </div>
                        {response.data.map((question, index) => (
                            <div key={index} className="bg-gray-800 text-white mb-4 px-8 py-12 flex flex-col gap-2">
                                <div className="flex gap-2">
                                    <div>{`${index + 1}.`}</div>
                                    <div>{question.question}</div>
                                </div>
                                <Select
                                    placeholder="Pilih Skor"
                                    options={scoreOptions}
                                    value={scoreOptions.find((option) => option.value === scores[question.id]) || null}
                                    onChange={(newValue) => handleScoreChange(question.id, newValue)}
                                    className="text-gray-700 font-medium"
                                />
                            </div>
                        ))}
                        <div className="flex justify-center items-center">
                            <button
                                type='button'
                                className={`bg-blue-900 text-xl py-4 px-16 my-8 rounded-md text-white ${ processing ? 'cursor-not-allowed bg-gray-500' : '' }`}
                                onClick={handleSubmitScore}
                                disabled={processing}
                            >
                                Submit
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="h-full mt-40 flex flex-col justify-center items-center gap-8">
                        <label className="text-4xl font-bold">Pilih Analisis DASS42 dari Tim...</label>
                        <Select 
                            placeholder="Pilih Tim..." 
                            value={response.teamOptions.find((option) => option.value === request.questionTeamId)} 
                            options={response.teamOptions}
                            onChange={handleTeamChange} 
                            className="text-2xl w-1/2 p-2"
                        />
                    </div>
                )
            )}
        </div>
    )
}
