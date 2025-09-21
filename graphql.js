// graphql.js
document.addEventListener("DOMContentLoaded", function () {
    // 发送查询按钮事件处理
    document.getElementById("send-btn").addEventListener("click", sendQuery);

    // 清空按钮事件处理
    document.getElementById("clear-btn").addEventListener("click", clearAll);

    // 示例查询按钮事件处理
    const exampleButtons = document.querySelectorAll(".example-btn");
    exampleButtons.forEach(button => {
        button.addEventListener("click", function () {
            const query = this.getAttribute("data-query");
            document.getElementById("query").value = query;
        });
    });

    async function sendQuery() {
        const endpoint = document.getElementById("endpoint").value;
        const query = document.getElementById("query").value;
        const variablesText = document.getElementById("variables").value;
        const headersText = document.getElementById("headers").value;

        if (!endpoint) {
            alert("请输入GraphQL端点");
            return;
        }

        if (!query) {
            alert("请输入GraphQL查询");
            return;
        }

        try {
            // 解析变量
            let variables = {};
            if (variablesText) {
                variables = JSON.parse(variablesText);
            }

            // 解析headers
            let headers = {
                "Content-Type": "application/json",
            };
            if (headersText) {
                headers = { ...headers, ...JSON.parse(headersText) };
            }

            // 构建请求体
            const requestBody = {
                query: query,
                variables: variables,
            };

            // 构建请求选项
            const options = {
                method: "POST",
                headers: headers,
                body: JSON.stringify(requestBody),
            };

            // 使用后台脚本代理请求以绕过CORS限制
            chrome.runtime.sendMessage(
                {
                    type: "FETCH_PROXY",
                    url: endpoint,
                    options: options,
                },
                response => {
                    if (response.success) {
                        const data = response.data;
                        // 尝试解析JSON响应
                        try {
                            const jsonData = JSON.parse(data.body);
                            document.getElementById("response-body").textContent = JSON.stringify(jsonData, null, 2);
                        } catch (e) {
                            // 如果不是JSON格式，直接显示文本
                            document.getElementById("response-body").textContent = data.body;
                        }
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

    function clearAll() {
        document.getElementById("query").value = "";
        document.getElementById("variables").value = "";
        document.getElementById("response").style.display = "none";
    }
});
