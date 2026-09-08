import { Link } from 'react-router-dom'

const EmptyState = ({ 
  icon = 'bi-inbox', 
  title = 'No Data Found', 
  message = 'There are no items to display.',
  actionText,
  actionLink 
}) => {
  return (
    <div className="empty-state">
      <i className={`bi ${icon}`}></i>
      <h5>{title}</h5>
      <p className="text-muted mb-3">{message}</p>
      {actionText && actionLink && (
        <Link to={actionLink} className="btn btn-accent">
          {actionText}
        </Link>
      )}
    </div>
  )
}

export default EmptyState
