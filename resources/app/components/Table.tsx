export default function Table({ headers, data }: { headers: string[], data: any[] | null }) {
    return (
        <table className="w-full border-separate">
            <thead className="bg-gray-200">
                <tr>
                    {headers.map((header, index) => (
                        <th key={index}>{header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {(data && data.length > 0) ? (
                  data.map((row: Object, index: number) => (
                    <tr key={index}>
                      {Object.values(row).map((cell, cellIndex) => (
                        <td className="text-center" key={cellIndex}>{cell}</td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={headers.length}>Data tidak tersedia.</td>
                  </tr>
                )}
              </tbody>
        </table>
    )
}
