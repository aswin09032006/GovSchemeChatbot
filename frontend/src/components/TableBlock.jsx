import React from 'react';

export default function TableBlock({ data }) {
  if (!data || !data.headers || !data.rows) return null;

  return (
    <div className="w-full overflow-x-auto mt-2 mb-4 border border-gray-200 dark:border-gray-800 rounded-xl">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800/50 dark:text-gray-300">
          <tr>
            {data.headers.map((header, idx) => (
              <th key={idx} scope="col" className="px-6 py-3 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, rIdx) => (
            <tr key={rIdx} className="bg-white dark:bg-[#0a0a0f] border-b border-gray-200 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-6 py-4">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
