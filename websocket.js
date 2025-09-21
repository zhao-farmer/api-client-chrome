// websocket.js
document.addEventListener("DOMContentLoaded", function () {
    let ws = null;

    const connectBtn = document.getElementById("connect-btn");
    const disconnectBtn = document.getElementById("disconnect-btn");
    const sendBtn = document.getElementById("send-btn");
    const clearBtn = document.getElementById("clear-btn");
    const wsUrl = document.getElementById("ws-url");
    const messageInput = document.getElementById("message");
    const messagesDiv = document.getElementById("messages");
    const connectionStatus = document.getElementById("connection-status");

    // 连接按钮事件处理
    connectBtn.addEventListener("click", connect);

    // 断开连接按钮事件处理
    disconnectBtn.addEventListener("click", disconnect);

    // 发送按钮事件处理
    sendBtn.addEventListener("click", sendMessage);

    // 清空消息按钮事件处理
    clearBtn.addEventListener("click", clearMessages);

    function connect() {
        const url = wsUrl.value;
        if (!url) {
            alert("请输入WebSocket URL");
            return;
        }

        try {
            ws = new WebSocket(url);

            ws.onopen = function (event) {
                updateConnectionStatus("已连接", true);
                addMessage("连接已建立", "received");
            };

            ws.onmessage = function (event) {
                addMessage("接收: " + event.data, "received");
            };

            ws.onclose = function (event) {
                updateConnectionStatus("未连接", false);
                addMessage("连接已关闭", "received");
            };

            ws.onerror = function (error) {
                addMessage("错误: " + error.message, "received");
            };
        } catch (error) {
            alert("连接失败: " + error.message);
        }
    }

    function disconnect() {
        if (ws) {
            ws.close();
        }
    }

    function sendMessage() {
        if (ws && ws.readyState === WebSocket.OPEN) {
            const message = messageInput.value;
            if (message) {
                ws.send(message);
                addMessage("发送: " + message, "sent");
                messageInput.value = "";
            }
        }
    }

    function addMessage(text, type) {
        const messageDiv = document.createElement("div");
        messageDiv.className = "message " + type;
        messageDiv.textContent = text;
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function clearMessages() {
        messagesDiv.innerHTML = "";
    }

    function updateConnectionStatus(text, connected) {
        connectionStatus.textContent = text;
        connectionStatus.className = "connection-status " + (connected ? "connected" : "disconnected");

        connectBtn.disabled = connected;
        disconnectBtn.disabled = !connected;
        sendBtn.disabled = !connected;
    }
});
