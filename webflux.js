// webflux.js
document.addEventListener("DOMContentLoaded", function () {
    // 方法按钮事件处理
    const methodButtons = document.querySelectorAll(".method-btn");
    const bodySection = document.getElementById("body-section");
    const cancelBtn = document.getElementById("cancel-btn");
    const streamDataDiv = document.getElementById("stream-data");
    const streamContent = document.getElementById("stream-content");
    let currentMethod = "GET";
    let abortController = null;

    methodButtons.forEach(button => {
        button.addEventListener("click", function () {
            // 移除所有按钮的active类
            methodButtons.forEach(btn => btn.classList.remove("active"));

            // 为当前按钮添加active类
            this.classList.add("active");

            // 更新当前方法
            currentMethod = this.getAttribute("data-method");

            // 根据方法类型显示/隐藏请求体
            if (currentMethod === "GET" || currentMethod === "DELETE") {
                bodySection.style.display = "none";
            } else {
                bodySection.style.display = "block";
            }
        });
    });

    // 发送请求按钮事件处理
    document.getElementById("send-btn").addEventListener("click", sendRequest);

    // 流式请求按钮事件处理
    document.getElementById("stream-btn").addEventListener("click", streamRequest);

    // 取消按钮事件处理
    cancelBtn.addEventListener("click", cancelRequest);

    async function sendRequest() {
        const url = document.getElementById("url").value;
        const headersText = document.getElementById("headers").value;
        const bodyText = document.getElementById("body").value;

        if (!url) {
            alert("请输入URL");
            return;
        }

        try {
            // 解析headers
            let headers = {};
            if (headersText) {
                headers = JSON.parse(headersText);
            }

            // 构建请求选项
            const options = {
                method: currentMethod,
                headers: headers,
            };

            // 如果不是GET或DELETE请求，添加请求体
            if (currentMethod !== "GET" && currentMethod !== "DELETE" && bodyText) {
                options.body = bodyText;
            }

            // 使用后台脚本代理请求以绕过CORS限制
            chrome.runtime.sendMessage(
                {
                    type: "FETCH_PROXY",
                    url: url,
                    options: options,
                },
                response => {
                    if (response.success) {
                        const data = response.data;
                        // 显示响应
                        document.getElementById("response-body").textContent = `Status: ${data.status} ${data.statusText}\n\n${data.body}`;
                        document.getElementById("response").style.display = "block";
                    } else {
                        document.getElementById("response-body").textContent = `错误: ${response.error}`;
                        document.getElementById("response").style.display = "block";
                    }
                }
            );
        } catch (error) {
            document.getElementById("response-body").textContent = `错误: ${error.message}`;
            document.getElementById("response").style.display = "block";
        }
    }

    async function streamRequest() {
        const url = document.getElementById("url").value;
        const headersText = document.getElementById("headers").value;
        const bodyText = document.getElementById("body").value;

        if (!url) {
            alert("请输入URL");
            return;
        }

        // 显示流式数据区域
        streamDataDiv.style.display = "block";
        streamContent.textContent = "连接中...\n";

        try {
            // 创建AbortController用于取消请求
            abortController = new AbortController();

            // 显示取消按钮
            cancelBtn.style.display = "inline-block";

            // 解析headers
            let headers = {};
            if (headersText) {
                headers = JSON.parse(headersText);
            }

            // 构建请求选项
            const options = {
                method: currentMethod,
                headers: headers,
                signal: abortController.signal,
            };

            // 如果不是GET或DELETE请求，添加请求体
            if (currentMethod !== "GET" && currentMethod !== "DELETE" && bodyText) {
                options.body = bodyText;
            }

            // 使用后台脚本代理请求以绕过CORS限制
            chrome.runtime.sendMessage(
                {
                    type: "FETCH_PROXY",
                    url: url,
                    options: options,
                },
                response => {
                    if (response.success) {
                        const data = response.data;
                        // 显示响应
                        streamContent.textContent = data.body;
                        streamContent.scrollTop = streamContent.scrollHeight;
                    } else {
                        streamContent.textContent = `错误: ${response.error}`;
                    }

                    // 隐藏取消按钮
                    cancelBtn.style.display = "none";
                    abortController = null;
                }
            );
        } catch (error) {
            streamContent.textContent = `错误: ${error.message}`;

            // 隐藏取消按钮
            cancelBtn.style.display = "none";
            abortController = null;
        }
    }

    function cancelRequest() {
        if (abortController) {
            abortController.abort();
        }
    }
});
