"use client"

import ListPage from '../../shared/ListPage'

export default function PurchaseRequestsListPage() {
  return (
    <ListPage
      title="Purchase Requests"
      apiPath="/api/purchase-requests"
      createPath="/Thailand/Admin-Login/documents/purchase-requests/create"
      columns={[
        { key: 'prNo', label: 'PR No.' },
        { key: 'prDate', label: 'Date' },
        { key: 'requester_name', label: 'Requester' },
        { key: 'department', label: 'Department' },
        { key: 'required_date', label: 'Required Date' },
        { key: 'status', label: 'Status' }
      ]}
    />
  )
}
