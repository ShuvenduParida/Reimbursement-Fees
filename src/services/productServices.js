import { setuserpin, getCompany, forgetPin, profileDtlURL,getProcessListUrl , getDocumentTypeListUrl, getProcessActivityListUrl, getActivityDocumentListUrl, processActivityDocument } from "../services/ConstantServies";
import { authAxios, authAxiosFilePost, authAxiosget, authAxiosPatch, authAxiosPost, authAxiosPut } from "./HttpMethod";



// Document Management APIs

export function getProcessList(data = {}) {
  return authAxios(getProcessListUrl, data);
}

export function getDocumentTypeList(data = {}) {
  return authAxios(getDocumentTypeListUrl, data);
}

export function getActivityDocumentList(data = {}) {
  return authAxios(getActivityDocumentListUrl, data);
}

export function addActivityDocument(data = {}) {
  return authAxiosPost(processActivityDocument, data);
}

export function updateActivityDocument(data = {}) {
    return authAxiosPost(processActivityDocument, data);
}
export function getProcessActivityList(data) {
  return authAxios(getProcessActivityListUrl, data);
} 

export function getCompanyName(isFms) {
  let data = {
    'mobile_app_type': isFms ? 'FMS_E' : 'HRM_E',
  };
  return authAxiosget(getCompany, data)
}

export function forgetUserPinView(data, dbName) {
  return authAxiosPost(`${forgetPin + dbName}/`, data);
}
export function getCustomerDetailList(customerId) {
  let data = {}
  if (customerId) {
    data['customer_id'] = customerId;
  }
  return authAxios(getCustomerDetailListURL, data);
}

export function getCustomerListView(params) {
  return authAxios(getCustomerListURL, params)
}

export async function setuserpinview(o_pin, n_pin) {
  try {
    const customerId = localStorage.getItem("empId");
    let data = {
      u_id: customerId,
      o_pin: o_pin,
      n_pin: n_pin,
      user_type: "EMP",
    };

    const response = await authAxiosPost(setuserpin, data);
    if (response.status === 200) {
      // console.log("Pin updated successfully")
    }
    return response;
  } catch (error) {
    return error;
  }
}

export function getemployeeList() {
  return authAxios(profileDtlURL)
}


