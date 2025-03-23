import { Navigate, Outlet } from "react-router-dom";
import PropTypes from "prop-types";

const ProtectedRoute = ({ isAllowed, redirectPath = "/login" }) => {
  return isAllowed ? <Outlet /> : <Navigate to={redirectPath} replace />;
};

ProtectedRoute.propTypes = {
  isAllowed: PropTypes.bool.isRequired,
  redirectPath: PropTypes.string,
};

export default ProtectedRoute;
