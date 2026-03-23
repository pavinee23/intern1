"use client"
import ListPage from "../../shared/ListPage"

export default function Page() {
  return (
    <ListPage
      title="Korea HQ Tracking — List"
      apiPath="/api/korea-order-tracking"
      createPath="/Thailand/Admin-Login/korea-order-tracking"
      columns={[
        { key: 'trackNo', label: 'Track No' },
        { key: 'orderDescription', label: 'Description' },
        { key: 'shippingMethod', label: 'Shipping' },
        { key: 'status', label: 'Status' },
        { key: 'estimatedArrival', label: 'ETA Thailand' },
        { key: 'created_at', label: 'Created' }
      ]}
      link={{ columnKey: 'trackNo', path: '/Thailand/Admin-Login/korea-order-tracking', paramName: 'trackNo' }}
      print={{ path: '/Thailand/Admin-Login/korea-order-tracking/print', paramName: 'trackID', idKey: 'trackID', newTab: true }}
    />
  )
}
