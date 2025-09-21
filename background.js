// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "FETCH_PROXY") {
    // 代理请求以绕过CORS限制
    fetch(request.url, request.options)
      .then(response => {
        // 将响应转换为文本
        return response.text().then(text => ({
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: text
        }));
      })
      .then(result => {
        sendResponse({ success: true, data: result });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });

    // 保持消息通道开放
    return true;
  }
});