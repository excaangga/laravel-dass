import { useState, useEffect, useRef } from "react"

export default function Table({
    headers,
    data,
    actions,
}: {
    headers: string[]
    data: any[] | null
    actions?: { label: string; action: (row: any) => void }[]
}) {
    const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null)
    const dropdownRefs = useRef(new Map<number, HTMLDivElement>())

    const toggleDropdown = (rowIndex: number) => {
        setOpenDropdownIndex((prevIndex) => (prevIndex === rowIndex ? null : rowIndex))
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                openDropdownIndex !== null &&
                dropdownRefs.current.get(openDropdownIndex) &&
                !dropdownRefs.current.get(openDropdownIndex)?.contains(event.target as Node)
            ) {
                setOpenDropdownIndex(null)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [openDropdownIndex])

    return (
        <table className="w-full border-separate overflow-auto">
            <thead className="bg-gray-200">
                <tr>
                    {headers.map((header, index) => (
                        <th key={index}>{header}</th>
                    ))}
                    {actions && <th key="action">Aksi</th>}
                </tr>
            </thead>
            <tbody>
                {data && data.length > 0 ? (
                    data.map((row: Object, index: number) => {
                        const filteredRow = Object.entries(row).filter(([key]) => key !== "id")

                        return (
                            <tr key={index}>
                                {filteredRow.map(([, cell], cellIndex) => (
                                    <td className="text-center" key={cellIndex}>
                                        {cell}
                                    </td>
                                ))}
                                {actions && (
                                    <td key="action" className="text-center">
                                        <div
                                            className="relative inline-block text-left"
                                            ref={(el) => {
                                                if (el) dropdownRefs.current.set(index, el)
                                            }}
                                        >
                                            <button
                                                type="button"
                                                className="text-center"
                                                onClick={() => toggleDropdown(index)}
                                            >
                                                <span>...</span>
                                            </button>
                                            {openDropdownIndex === index && (
                                                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                                    <div className="py-1">
                                                        {actions.map((action, actionIndex) => (
                                                            <a
                                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                                                key={actionIndex}
                                                                onClick={() => action.action(row)}
                                                            >
                                                                {action.label}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        )
                    })
                ) : (
                    <tr>
                        <td colSpan={headers.length + (actions ? 1 : 0)} className="text-center">
                            Data tidak tersedia.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    )
}
