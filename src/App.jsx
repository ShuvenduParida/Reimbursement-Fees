import { BrowserRouter as Router,Routes, Route, Navigate, Outlet} from "react-router-dom";
import { GlobalStyles } from "./styles/GlobalStyles";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { ThemeProvider } from "./context/ThemeContext";

// Auth & Protected Routes
import { AuthProvider } from "./context/AuthContext";

import UserLogin from "./pages/UserLogin";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/ProtectedRoute";

// Sales module
import ReimbursementFees from "./pages/ReimbursementFees";
import AddReimbursement from "./pages/AddReimbursement";


function App() {
  return (
      <AuthProvider>
        <ThemeProvider>
            <Router basename="/Reimbursement">
              <Routes>
                {/* Login Route */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                
                 <Route path="/login" element={<UserLogin />} />
                <Route
                  element={
                    <ProtectedRoute>
                      <>
                        <GlobalStyles />
                        <Outlet />
                      </>
                    </ProtectedRoute>
                  }
                >
                  
                  <Route path="/reimbursement-fees" element={<ReimbursementFees />} />
                  <Route path="/reimbursement-fees/add" element={<AddReimbursement />} />
                  
                </Route>
                

                {/* Catch All */}
                {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
            <ToastContainer position="top-right" autoClose={2000} />
        </ThemeProvider>
      </AuthProvider>
  );

}

export default App;
