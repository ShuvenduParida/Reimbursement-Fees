const localhost = "https://www.atomwalk.com"
const newlocalhost = "https://crm.atomwalk.com"
const apiURL = "/api";
const db_name = localStorage.getItem("dbName");
export const endpoint = `${localhost}${apiURL}`;
export const hrendpoint = `${newlocalhost}/api`;
export const newhrendpoint = `${newlocalhost}/hr_api`;

export const userSignUpURL = `${endpoint}/customer_sign_up/${db_name}/`;
export const userLoginURL = `${endpoint}/customer_login/${db_name}/`;
export const loginURL = `${localhost}/rest-auth/login/`;

export const resetPasswordURL = `${endpoint}/reset_password/${db_name}/`;
export const resetPasswordConfirmURL = `${endpoint}/reset_password_confirm/`;
export const changePasswordURL = `${endpoint}/change_password/`;
export const getCustomerListURL = `${hrendpoint}/customer_list/${db_name}/`;
export const getCustomerDetailListURL = `${endpoint}/customer_detail_list/${db_name}/`;

export const profileInfoURL = `${endpoint}/profile_info/${db_name}/`;
export const profileDtlURL = `${newhrendpoint}/get_employee_list/${db_name}/`;
export const companyInfoURL = `${hrendpoint}/company_info/${db_name}/`;

export const setuserpin = `${endpoint}/set_user_pin/${db_name}/`;
export const getCompany = `${endpoint}/get_applicable_site/`;
export const forgetPin = `${newhrendpoint}/emp_forget_pin/`;
export const customerslogin = `${hrendpoint}/customer_user_login/`;


export const getProcessActivityListUrl = `${hrendpoint}/get_process_activity_list/${db_name}/`;


export const getProcessListUrl = `${hrendpoint}/get_process_list/${db_name}/`;
export const getDocumentTypeListUrl = `${hrendpoint}/get_document_type_list/${db_name}/`;
export const getActivityDocumentListUrl = `${hrendpoint}/get_activity_document_list/${db_name}/`;

export const processActivityDocument = `${hrendpoint}/process_activity_document/${db_name}/`;