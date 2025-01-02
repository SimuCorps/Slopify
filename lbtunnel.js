const tunnel = (() => {
  let baseUrl = "";

  /**
   * Sets the base URL for the tunnel.
   * @param {string} url - The base URL for the tunnel.
   */
  const setBaseUrl = (url) => {
    baseUrl = url.endsWith("/") ? url.slice(0, -1) : url;
  };

  /**
   * Sends a GET request to the specified endpoint.
   * @param {string} endpoint - The endpoint to send the GET request to.
   * @param {Object} params - The query parameters to include in the request.
   * @returns {Promise<any>} - A promise that resolves with the response data.
   */
  const get = async (endpoint, params = {}) => {
    const url = new URL(`${baseUrl}${endpoint}`);
    Object.keys(params).forEach((key) =>
      url.searchParams.append(key, params[key]),
    );

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "any-value",
      },
    });

    if (!response.ok) {
      throw new Error(`GET request failed: ${response.statusText}`);
    }

    return response.json();
  };

  /**
   * Sends a POST request to the specified endpoint.
   * @param {string} endpoint - The endpoint to send the POST request to.
   * @param {Object} body - The body data to include in the request.
   * @returns {Promise<any>} - A promise that resolves with the response data.
   */
  const post = async (endpoint, body = {}) => {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "any-value",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`POST request failed: ${response.statusText}`);
    }

    return response.json();
  };

  return {
    setBaseUrl,
    get,
    post,
  };
})();
