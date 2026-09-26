import type { ReactNode } from 'react'

import { useTranslation } from 'react-i18next'

interface AdminTableProps {
  /** Column header keys under `admin.table`; an actions column is appended. */
  columns: string[]
  children: ReactNode
}

/** Content table used by the admin list pages. */
export const AdminTable = ({ columns, children }: AdminTableProps) => {
  const { t } = useTranslation()

  return (
    <table className="mt-6 w-full text-left text-sm">
      <thead className="border-b border-edge text-muted">
        <tr>
          {columns.map((column) => (
            <th key={column} className="py-2 pr-4">
              {t(`admin.table.${column}`)}
            </th>
          ))}
          <th className="py-2">{t('admin.table.actions')}</th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  )
}
