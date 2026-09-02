import { BrowserRouter as Router,Routes, Route, Navigate, Outlet} from "react-router-dom";
import { GlobalStyles } from "./styles/GlobalStyles";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { ThemeProvider } from "./context/ThemeContext";

// Auth & Protected Routes
import { AuthProvider } from "./context/AuthContext";



// Public Pages

import UserLogin from "./pages/UserLogin";
import NotFound from "./pages/NotFound";
import DocumentManagement from "./pages/DocumentManagement/DocumentManagement";
import EmailTemplate from "./pages/EmailTemplate/EmailTemplate";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  return (
      <AuthProvider>
        <ThemeProvider>
            <Router basename="/docket">
              <Routes>
                {/* Login Route */}
                <Route path="/" element={<Navigate to="/user/login" replace />} />
                
                 <Route path="/user/login" element={<UserLogin />} />
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
                  
                  
                  <Route path="/document-management/*" element={<DocumentManagement />} />
                  <Route path="email-template/:activityId/*" element={<EmailTemplate />} />
                </Route>
                

                {/* Catch All */}
                {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
            <ToastContainer position="top-right" autoClose={3000} />
        </ThemeProvider>
      </AuthProvider>
  );

}

export default App;
