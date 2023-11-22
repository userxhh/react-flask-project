export default class HttpUtil {
    static get(url, headers) {
        return new Promise((resolve, reject) => {
            fetch(url, {
                method: 'GET',
                headers: {
                    ...headers,  // 允许用户传入额外的请求头
                    'Accept': 'application/json',
                    // 其他默认请求头...
                },
            })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error(response.status + " : " + response.statusText);
                    }
                })
                .then(result => resolve(result))
                .catch(error => {
                    reject(error);
                });
        });
    }

    static post(url, data, headers = {}) {
        return new Promise((resolve, reject) => {
            fetch(url, {
                method: 'POST',
                headers: {
                    ...headers,  // 允许用户传入额外的请求头
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    // 其他默认请求头...
                },
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then(result => resolve(result))
                .catch(error => {
                    reject(error);
                });
        });
    }
}
