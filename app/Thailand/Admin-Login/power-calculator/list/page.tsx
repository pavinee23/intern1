"use client"
import ListPage from "../../shared/ListPage"

export default function Page() {
  return (
    <ListPage
      title="Power Calculator — List"
      apiPath="/api/power-calculations"
      createPath="/Thailand/Admin-Login/power-calculator"
      columns={[
        { key: 'rowNumber', label: 'ลำดับ' },
        { key: 'calcID', label: 'เลขที่รายการ' },
        { key: 'created_at', label: 'วันที่' },
        { key: 'customerName', label: 'ชื่อลูกค้า' }
      ]}
      link={{ columnKey: 'calcID', path: '/Thailand/Admin-Login/power-calculator', paramName: 'calcID' }}
    />
  )
}

