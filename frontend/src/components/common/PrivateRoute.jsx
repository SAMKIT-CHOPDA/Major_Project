// // import React from "react";
// // import { Navigate } from "react-router-dom";
// // import { useAuth } from "../../context/AuthContext";

// // /* ---------------------------------- */
// // /* USER PROTECTED ROUTE               */
// // /* Redirect to /login if not logged in */
// // /* ---------------------------------- */
// // export const PrivateRoute = ({ children }) => {
// //   const { user, loading } = useAuth();

// //   if (loading) return <div className="page-loader"><div className="spinner" /></div>;

// //   if (!user) return <Navigate to="/login" replace />;

// //   return children;
// // };

// // /* ---------------------------------- */
// // /* GUEST ROUTE (customers)            */
// // /* Logged-in customers can't visit    */
// // /* /login or /register                */
// // /* ---------------------------------- */
// // export const GuestRoute = ({ children }) => {
// //   const { user, loading } = useAuth();

// //   if (loading) return <div className="page-loader"><div className="spinner" /></div>;

// //   // If user is logged in (any role), redirect away from login/register
// //   if (user) return <Navigate to="/" replace />;

// //   return children;
// // };

// // /* ---------------------------------- */
// // /* ADMIN GUEST ROUTE                  */
// // /* Logged-in admin can't visit        */
// // /* /admin/login                       */
// // /* ---------------------------------- */
// // export const AdminGuestRoute = ({ children }) => {
// //   const { loading } = useAuth();

// //   if (loading) return <div className="page-loader"><div className="spinner" /></div>;

// //   const token = localStorage.getItem("token");
// //   const stored = localStorage.getItem("user");

// //   if (token && stored) {
// //     try {
// //       const user = JSON.parse(stored);
// //       if (user.role === "ADMIN") {
// //         return <Navigate to="/admin" replace />;
// //       }
// //     } catch {
// //       // malformed storage — let them through
// //     }
// //   }

// //   return children;
// // };

// // /* ---------------------------------- */
// // /* ADMIN PROTECTED ROUTE              */
// // /* ---------------------------------- */
// // export const AdminRoute = ({ children }) => {
// //   const { loading } = useAuth();

// //   if (loading) return <div className="page-loader"><div className="spinner" /></div>;

// //   const token = localStorage.getItem("token");
// //   const stored = localStorage.getItem("user");

// //   if (!token || !stored) return <Navigate to="/admin/login" replace />;

// //   try {
// //     const user = JSON.parse(stored);
// //     if (user.role !== "ADMIN") return <Navigate to="/" replace />;
// //     return children;
// //   } catch {
// //     localStorage.removeItem("token");
// //     localStorage.removeItem("user");
// //     return <Navigate to="/admin/login" replace />;
// //   }
// // };

// // export default PrivateRoute;

// import React from "react";
// import { Navigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";

// /* ---------------------------------- */
// /* USER PROTECTED ROUTE               */
// /* Redirect to /login if not logged in */
// /* ---------------------------------- */
// export const PrivateRoute = ({ children }) => {
//   const { user, loading } = useAuth();

//   if (loading) return <div className="page-loader"><div className="spinner" /></div>;

//   if (!user) return <Navigate to="/login" replace />;

//   return children;
// };

// /* ---------------------------------- */
// /* GUEST ROUTE (customers)            */
// /* Logged-in customers can't visit    */
// /* /login or /register                */
// /* ---------------------------------- */
// export const GuestRoute = ({ children }) => {
//   const { user, loading } = useAuth();

//   if (loading) return <div className="page-loader"><div className="spinner" /></div>;

//   // If user is logged in (any role), redirect away from login/register
//   if (user) return <Navigate to="/" replace />;

//   return children;
// };

// /* ---------------------------------- */
// /* ADMIN GUEST ROUTE                  */
// /* Logged-in admin can't visit        */
// /* /admin/login                       */
// /* ---------------------------------- */
// export const AdminGuestRoute = ({ children }) => {
//   const { loading } = useAuth();

//   if (loading) return <div className="page-loader"><div className="spinner" /></div>;

//   const token = localStorage.getItem("token");
//   const stored = localStorage.getItem("user");

//   if (token && stored) {
//     try {
//       const user = JSON.parse(stored);
//       if (user.role === "ADMIN") {
//         return <Navigate to="/admin" replace />;
//       }
//     } catch {
//       // malformed storage — let them through
//     }
//   }

//   return children;
// };

// /* ---------------------------------- */
// /* ADMIN REDIRECT                     */
// /* If admin visits any customer page  */
// /* (e.g. "/" via back button),        */
// /* bounce them to /admin              */
// /* ---------------------------------- */
// export const AdminRedirect = ({ children }) => {
//   const { loading } = useAuth();

//   if (loading) return <div className="page-loader"><div className="spinner" /></div>;

//   const token = localStorage.getItem("token");
//   const stored = localStorage.getItem("user");

//   if (token && stored) {
//     try {
//       const user = JSON.parse(stored);
//       if (user.role === "ADMIN") {
//         return <Navigate to="/admin" replace />;
//       }
//     } catch {
//       // malformed — let through
//     }
//   }

//   return children;
// };

// /* ---------------------------------- */
// /* ADMIN PROTECTED ROUTE              */
// /* ---------------------------------- */
// export const AdminRoute = ({ children }) => {
//   const { loading } = useAuth();

//   if (loading) return <div className="page-loader"><div className="spinner" /></div>;

//   const token = localStorage.getItem("token");
//   const stored = localStorage.getItem("user");

//   if (!token || !stored) return <Navigate to="/admin/login" replace />;

//   try {
//     const user = JSON.parse(stored);
//     if (user.role !== "ADMIN") return <Navigate to="/" replace />;
//     return children;
//   } catch {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     return <Navigate to="/admin/login" replace />;
//   }
// };

// export default PrivateRoute;

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/* ─────────────────────────────────────────────────────────────
   HELPER — read role directly from localStorage.
───────────────────────────────────────────────────────────── */
const getStoredRole = () => {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored).role : null;
  } catch {
    return null;
  }
};

const isStoredAdmin = () => getStoredRole() === "ADMIN";
const hasToken      = () => !!localStorage.getItem("token");

/* ─────────────────────────────────────────────────────────────
   PRIVATE ROUTE
   Logged-out → /login
   Admin landing on customer page → /admin
───────────────────────────────────────────────────────────── */
export const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "ADMIN") return <Navigate to="/admin" replace />;

  return children;
};

/* ─────────────────────────────────────────────────────────────
   GUEST ROUTE  (wraps /login and /register)
   Logged-in customer → /
   Logged-in admin    → /admin
───────────────────────────────────────────────────────────── */
export const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  if (user) {
    return <Navigate to={user.role === "ADMIN" ? "/admin" : "/"} replace />;
  }

  return children;
};

/* ─────────────────────────────────────────────────────────────
   ADMIN GUEST ROUTE  (wraps /admin/login)
   Logged-in admin → /admin  (back button won't work)
───────────────────────────────────────────────────────────── */
export const AdminGuestRoute = ({ children }) => {
  const { loading } = useAuth();

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  if (hasToken() && isStoredAdmin()) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

/* ─────────────────────────────────────────────────────────────
   ADMIN REDIRECT  (wraps public pages like /)
   Admin landing here via Back → /admin
───────────────────────────────────────────────────────────── */
export const AdminRedirect = ({ children }) => {
  const { loading } = useAuth();

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  if (hasToken() && isStoredAdmin()) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

/* ─────────────────────────────────────────────────────────────
   ADMIN ROUTE  (wraps all /admin/* pages)
   No token / not admin → /admin/login
───────────────────────────────────────────────────────────── */
export const AdminRoute = ({ children }) => {
  const { loading } = useAuth();

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  if (!hasToken()) return <Navigate to="/admin/login" replace />;

  const role = getStoredRole();

  if (!role) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/admin/login" replace />;
  }

  if (role !== "ADMIN") return <Navigate to="/" replace />;

  return children;
};

export default PrivateRoute;