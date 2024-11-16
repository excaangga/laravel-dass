import axios from 'axios';
import { Navigate } from 'react-router-dom';

async function withAuth<P extends {}>(
    WrappedComponent: React.ComponentType<P>, 
    allowedRoles: string[]
) {
  const response = await axios.get('/api/v1/show')
  const userRole = response.data.data.userSlug

  return (props: P) => {
    if (!userRole || (!allowedRoles.includes(userRole) && userRole === 'guest')) {
      return <Navigate to="/login" replace />
    } else if (!userRole || (!allowedRoles.includes(userRole) && userRole !== 'guest')) {
      return <Navigate to="/" replace />
    }

    return <WrappedComponent {...props} />
  }
}

export default withAuth
