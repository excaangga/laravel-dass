import axios from "axios"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { ChevronLeftIcon } from "@heroicons/react/24/outline"

interface ResponseData {
    data: {
        id: number
        question: string
    }[]
}

interface RequestData {
    questionType: "DASS21" | "DASS42"
    questionTeamId: number
}

interface Score {
    depressionScore: number
    anxietyScore: number
    stressScore: number
}

type Scores = Record<number, Score>

const defaultResponseValues: ResponseData = {
    data: [],
}

export default function ScoringDASS42({
    questionTeamId,
    questionTeamName,
    onBack,
}: {
    questionTeamId: string
    questionTeamName: string
    onBack: () => void
}) {
    const [response, setResponse] = useState<ResponseData>(defaultResponseValues)
    const [scores, setScores] = useState<Scores>({})
    const [processing, setProcessing] = useState<boolean>(true)

    const request: RequestData = {
        questionType: "DASS42",
        questionTeamId: parseInt(questionTeamId),
    }

    useEffect(() => {
        axios
            .post("/api/v1/questionnaire", request)
            .then((response) => {
                setResponse(response.data)
                initializeScores(response.data.data)
            })
            .catch((error) => {
                const message =
                    error.response?.data?.message || "Failed to fetch questionnaire"
                toast.error(message)
            })
    }, [])

    function initializeScores(questions: { id: number }[]) {
        const initialScores: Scores = {}
        questions.forEach((q) => {
            initialScores[q.id] = {
                depressionScore: 1,
                anxietyScore: 2,
                stressScore: 3,
            }
        })
        setScores(initialScores)
    }

    function handleDragEnd(result: any, questionId: number) {
        if (!result.destination || result.source.index === result.destination.index) {
            return
        }

        // Get the current scores for the question and sort by values
        const currentScores = Object.entries(scores[questionId])
            .sort(([, a], [, b]) => a - b)
            .map(([key]) => key)

        // Adjust the order based on drag-and-drop result
        const [moved] = currentScores.splice(result.source.index, 1)
        currentScores.splice(result.destination.index, 0, moved)

        // Update scores directly using their new order
        const updatedScores = currentScores.reduce((acc, key, index) => {
            acc[key as keyof Score] = index + 1
            return acc
        }, {} as Score)

        setScores((prev) => ({
            ...prev,
            [questionId]: updatedScores,
        }))
    }

    function handleSubmitScore() {
        const data = {
            questions: scores,
            questionTeamId: request.questionTeamId,
        }

        axios
            .post("/api/v1/scoring/store", data)
            .then((response) => {
                toast.success(response.data.message)
                onBack()
            })
            .catch((error) => {
                const message =
                    error.response?.data?.message || "Failed to submit scores"
                toast.error(message)
            })
    }

    useEffect(() => {
        const requiredCount = request.questionType === "DASS42" ? 42 : 21
        setProcessing(Object.keys(scores).length !== requiredCount)
    }, [scores])

    return (
        <div>
            <div className="w-full mb-16 mt-6 flex justify-between font-semibold">
                <div className="flex items-center gap-4">
                    <ChevronLeftIcon className="h-6 w-6 cursor-pointer" onClick={onBack} />
                    <div className="text-xl">Scoring DASS 42</div>
                </div>
                <div className="text-xl">{questionTeamName}</div>
            </div>
            <div className="mb-16 text-lg flex flex-col gap-2">
                <span>Petunjuk: </span>
                <span>1. Urutkan opsi berdasarkan relevansi (paling atas, paling penting) </span>
                <span>2. Tes ini tidak bertujuan untuk menggantikan peran profesional psikolog saat konsultasi </span>
            </div>
            {response.data.map((question, index) => (
                <div key={index} className="bg-gray-800 text-white mb-4 px-8 py-12">
                    <div className="mb-4">
                        <strong>{`${index + 1}.`}</strong> {question.question}
                    </div>
                    <DragDropContext
                        onDragEnd={(result) => handleDragEnd(result, question.id)}
                    >
                        <Droppable droppableId={`question-${question.id}`}>
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="flex flex-col gap-2"
                                >
                                    {Object.entries(scores[question.id] || {})
                                        .sort(([, a], [, b]) => a - b)
                                        .map(([key], i) => (
                                            <Draggable
                                                key={key}
                                                draggableId={key}
                                                index={i}
                                            >
                                                {(provided) => (
                                                    <div
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        ref={provided.innerRef}
                                                        className="p-4 bg-gray-700 rounded text-center"
                                                    >
                                                        {key.replace("Score", "")}
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
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
        </div>
    )
}
