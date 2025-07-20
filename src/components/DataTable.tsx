import React from "react";

export interface DataTableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  error?: string;
  emptyText?: string;
  actions?: (row: T) => React.ReactNode;
  rowKey: (row: T) => React.Key;
}

function DataTable<T>({
  columns,
  data,
  loading,
  error,
  emptyText = "Sin datos para mostrar",
  actions,
  rowKey,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700">
            {columns.map((col) => (
              <th key={String(col.key)} className={"px-6 py-4 capitalize font-semibold text-gray-900 dark:text-white text-base " + (col.className || "")}>{col.label}</th>
            ))}
            {actions && <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white text-base">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-8 text-lg">Cargando...</td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center text-red-500 py-8 text-lg">{error}</td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-8 text-lg">{emptyText}</td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={rowKey(row)} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                {columns.map((col) => (
                  <td key={String(col.key)} className={"px-6 py-4 text-base break-all " + (col.className || "")}>{col.render ? col.render(row) : String(row[col.key as keyof T] ?? "-")}</td>
                ))}
                {actions && <td className="px-6 py-4 text-center">{actions(row)}</td>}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
