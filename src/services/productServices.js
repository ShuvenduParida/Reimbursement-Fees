import { setuserpin, getCompany, forgetPin, profileDtlURL,getCustomerListURL,getReimbursementOrderListURL,getProductListURL,ProcessReimbursementOrder } from "../services/ConstantServies";
import { authAxios, authAxiosFilePost, authAxiosget, authAxiosPatch, authAxiosPost, authAxiosPut } from "./HttpMethod";




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

// R. Fees

export function getCustomerListView(params) {
  return authAxios(getCustomerListURL, params)
}

export function getReimbursementOrderList(data = {}) {
  return authAxios(getReimbursementOrderListURL, data);
}

export function getProductList(data = {}) {
  return authAxios(getProductListURL, data);
}

export function createReimbursementOrder(data = {}) {
  return authAxiosPost(ProcessReimbursementOrder, data);
}