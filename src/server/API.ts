import { DEVURL } from "@/constants";
import axios, { AxiosError, AxiosHeaders } from "axios";
import { useNavigate } from "react-router-dom";

axios.defaults.baseURL = DEVURL;

type Method = "POST" | "PUT" | "GET" | "DELETE" | "PATCH";

async function MethodHandler(
  method: Method,
  url: string,
  headers: any = {},
  data: any = {}
) {
  const reqHeaders = {
    headers: {
      ...headers,
    },
  };
  switch (method) {
    case "GET":
      return await axios.get(url, reqHeaders);
    case "POST":
      return await axios.post(url, data, reqHeaders);
    case "PUT":
      return await axios.put(url, data, reqHeaders);
    case "DELETE":
      return await axios.delete(url, reqHeaders);
    case "PATCH":
      return await axios.patch(url, data, reqHeaders);
    default:
      return null;
  }
}

export default async function APIHandler(
  method: Method,
  url: string,
  headers?: any,
  data?: any
) {
  console.log(method + " :: " + " URL :: " + url);
  try {
    const response = await MethodHandler(method, url, headers, data);
    if (response === null) {
      return {
        error: true,
        message: "Invalid Method fired",
      };
    }

    if (response?.status >= 200 && response?.status <= 299) {
      return {
        error: false,
        message: response?.data?.message,
        data: response?.data?.data,
      };
    }
    console.log(response);
    if (response.status === 401) {
      console.log("Unauthorized");
    }
    return {
      error: true,
      message: response?.data?.message,
      data: response?.data?.data,
    };
  } catch (e) {
    const err = e as AxiosError;
    const errData = err?.response?.data as { message: string; error: string };

    if (err.response?.status === 401) window.location.href = "/auth/login";

    return {
      error: true,
      message: errData?.error?.toLocaleUpperCase(),
      data: {},
    };
  }
}
