import DashboardLayout from '../../components/DashboardLayout'
import LocationTracker from '../admin/LocationTracker'

const MechanicLocationPage = () => {
  return (
    <DashboardLayout role="mechanic">
      <div className="p-0">
        <LocationTracker
          title="Customer Location Tracker"
          subtitle="Real-time Google Maps location of customers for pickup & drop"
          roleFilter="CUSTOMER"
        />
      </div>
    </DashboardLayout>
  )
}

export default MechanicLocationPage
