import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

interface ResponseData {
    userName: string,
    userSlug: string
}

const defaultValues: ResponseData = {
    userName: '',
    userSlug: ''
}

export default function Home() {
    const [response, setResponse] = useState<ResponseData>(defaultValues)
    const navigate = useNavigate()

    function handleCheckInfo() {
        axios
            .get('/api/v1/show')
            .then((response) => {
                setResponse({
                    userName: response.data.data.userName,
                    userSlug: response.data.data.userSlug
                })
            })
            .catch((error) => {
                if (error.status === 500) {
                    const errorData = error.response.data.errors
                    Object.keys(errorData).forEach((field) => {
                        toast.error(errorData[field][0])
                    })
                } else if (error.status === 401) {
                    toast.error(error.response.data.message)
                }
            })
    }

    useEffect(() => {
        handleCheckInfo()
    }, [])

    return (
        <div className="h-full mt-[10%] flex flex-col justify-center items-center gap-8">
            {response.userSlug === 'cli' && 
                <>
                    <div className="text-4xl font-bold">Halo <span className="underline">{response.userName}</span></div>
                    <div className="text-2xl font-semibold max-w-[50%] text-center">Untuk mengukur kondisi emosional Anda berdasarkan data dari para ahli psikolog, silakan lakukan...</div>
                    <div className="flex gap-16">
                        <button
                            type="button"
                            className="mt-8 bg-blue-900 text-xl p-4 mt-16 rounded-md text-white"
                            onClick={() => navigate('/questionnaire/dass21')}
                        >
                            Uji Pengukuran DASS-21
                        </button>
                        <button
                            type="button"
                            className="mt-8 bg-blue-900 text-xl p-4 mt-16 rounded-md text-white"
                            onClick={() => navigate('/questionnaire/dass42')}
                        >
                            Uji Pengukuran DASS-42
                        </button>
                    </div>
                </>
            }
            {response.userSlug === 'psy' && 
                <>
                    <div className="text-4xl font-bold">Halo <span className="underline">{response.userName}</span></div>
                    <div className="text-2xl font-semibold max-w-[50%] text-center">Untuk mulai melakukan  pendataan pengujian DASS, silakan lakukan...</div>
                    <button
                        type="button"
                        className="mt-8 bg-blue-900 text-xl p-4 mt-16 rounded-md text-white"
                        onClick={() => navigate('/teams')}
                    >
                        Submit Data DASS
                    </button>
                </>
            }
        </div>
    )
}
