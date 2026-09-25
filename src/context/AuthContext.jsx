import { createContext, useState, useEffect, useContext } from "react"
import { publicAxiosRequest } from "../services/HttpMethod"
import { customerslogin, loginURL } from "../services/ConstantServies"
import { getCompanyInfo, getEmployeeInfo } from "../services/authServices"
// import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { getCustomerDetailList } from "../services/productServices"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState([])
  const [companyInfo, setCompanyInfo] = useState([])
  const [error, setError] = useState("")
  const iscoustomerLogin = localStorage.getItem("customerUser") ? true : false
  const usertoake = localStorage.getItem("userToken")
  const [taskResponse, setTaskResponse] = useState([]);
  // const navigate = useNavigate()
  useEffect(() => {
    const fetchProfile = async () => {
      // try {
      //   const res = await getEmployeeInfo();
      //   setProfile(res?.data[0]);

      // } catch (error) {
      //   console.error('Failed to fetch profile:', error);
      // }
      try {
        const res = await getCompanyInfo();
        setCompanyInfo(res?.data);
      }
      catch (error) {
        console.log('Failed to fetch company info:', error);
      }
    };
    const fetchcustomerProfile = async () => {
      const custId = localStorage.getItem("custId");
      try {
        const res = await getCustomerDetailList(custId);
        setProfile(res?.data[0]);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };
    if (iscoustomerLogin) {
      fetchcustomerProfile();
    }
    else {
      if (usertoake) {
        fetchProfile();
      }

    }

    // Check if user is logged in from localStorage
    const user = localStorage.getItem("seaUser_E") || localStorage.getItem("customerUser") || localStorage.getItem("seaUser");
    if (user) {
      setCurrentUser(JSON.parse(user))
    }
    setLoading(false)
  }, [])

  const SeaFoodLogin = async (userData) => {
     try {
      const payload = {
        username: userData.username,
        password: userData.password
      }
      const response = await publicAxiosRequest.post(loginURL, payload);
  
  
      if (response.status === 200) {
        setError("");
        const { key } = response.data;
        // Store token and emp_id in AsyncStorage
        localStorage.setItem('userToken', key);
        localStorage.setItem("seaUser", JSON.stringify(payload));
        const db_name = payload.username.split("@")
        localStorage.setItem("dbName", db_name[1]);
        setCurrentUser(userData);
        toast.success("Login successful!");
        window.location.href = "/Reimbursement/reimbursement-fees";
        return true;
      }
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
    }

  }


  const logout = () => {
    if (iscoustomerLogin) {
      localStorage.removeItem("customerToken")
      localStorage.removeItem("custId")
      localStorage.removeItem("customerUser")
      toast.success("Logout successful!");
      window.location.href = "/customer/login.html";
    }
    if(localStorage.getItem("seaUser")){
      window.location.href = "/Reimbursement/login";
    }
    if(localStorage.getItem("seaUser_E")){
      window.location.href = "/docket/emp/login";
    }
    localStorage.removeItem("seaUser")
    localStorage.removeItem("seaUser_E")
    localStorage.removeItem("dbName")
    localStorage.removeItem("userToken")
    localStorage.removeItem("empId")
    localStorage.removeItem("empNoId")
    setCurrentUser(null)
  }
  const customerlogin = async (userData) => {
    try {
      const payload = {
        mobile_number: userData.mobile,
        pin: userData.password,
      }

      const response = await publicAxiosRequest.post(customerslogin + `${userData.company}/`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.status === 200) {
        const { token, customer_id } = response.data;
        localStorage.setItem('customerToken', token);
        localStorage.setItem('custId', String(customer_id));
        localStorage.setItem('customerUser', JSON.stringify(userData));
        toast.success("Login successful!");
        window.location.href = "/invoices";
      }
    }
    catch (error) {
      console.log("Login error:", error.response.data.error);
      toast.error(error.response.data.error);
    }
  }

  const value = {
    currentUser,
    logout,
    loading,
    profile,
    companyInfo,
    error,
    customerlogin,
    iscoustomerLogin,
    taskResponse,
    setTaskResponse,
    SeaFoodLogin,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

