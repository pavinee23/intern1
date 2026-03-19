"use client"

import ListPage from '../../shared/ListPage'

export default function ProductionOrdersListPage() {
  return (
    <ListPage
      title="Production Orders"
      apiPath="/api/production-orders"
      createPath="/Thailand/Admin-Login/documents/production-orders/create"
      columns={[
        { key: 'poNo', label: 'PO No.' },
        { key: 'poDate', label: 'Date' },
        { key: 'product_name', label: 'Product' },
        { key: 'quantity_ordered', label: 'Quantity' },
        { key: 'due_date', label: 'Due Date' },
        { key: 'priority', label: 'Priority' },
        { key: 'status', label: 'Status' }
      ]}
    />
  )
}
