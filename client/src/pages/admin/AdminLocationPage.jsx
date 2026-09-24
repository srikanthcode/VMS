import DashboardLayout from '../../components/DashboardLayout'
import LocationTracker from './LocationTracker'

const AdminLocationPage = () => {
  return (
    <DashboardLayout role="admin">
      <div className="p-0">
        <LocationTracker
          title="Live Location Tracker"
          subtitle="Real-time Google Maps tracking for customers, mechanics & admins"
        />
      </div>
    </DashboardLayout>
  )
}

export default AdminLocationPage
