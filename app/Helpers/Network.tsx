import axios from "axios";
const network = class NETWORK {
  [x: string]: any;
  constructor(axios: { create: (arg0: { baseURL: string }) => any }) {
    this.network = axios.create({
      baseURL: "/api",
    });
    this.network.interceptors.request.use(
      async (config: { headers: { authorization: string } }) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.authorization = `Bearer ${token}`;
        }
        return config;
      }
    );

    this.network.interceptors.response.use(
      null,
      (error: { response: { status: number } }) => {
        if (error.response.status === 401) {
          localStorage.removeItem("token");
          location.href = "/auth";
        }
        return Promise.reject(error);
      }
    );
  }

  getData = async (path: string, body?: any) => {
    return await this.network.get(path, body).then((r: any) => r.data);
  };

  postData = async (path: string, body: any) => {
    return await this.network.post(path, body).then((r: any) => r.data);
  };

  putData = async (path: string, body: any) => {
    return await this.network.put(path, body).then((r: any) => r.data);
  };
  deleteData = async (path: string, body?: any) => {
    return await this.network({
      method: "DELETE",
      data: body,
      url: path,
    }).then((r: { data: any }) => r.data);
  };
};

export default new network(axios);
