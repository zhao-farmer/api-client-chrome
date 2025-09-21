// popup.js
document.addEventListener("DOMContentLoaded", function () {
    // 为每个选项添加点击事件监听器
    const options = document.querySelectorAll(".option");

    options.forEach(option => {
        option.addEventListener("click", function (e) {
            e.preventDefault();
            const url = this.getAttribute("href");

            // 在新标签页中打开对应的页面
            chrome.tabs.create({ url: chrome.runtime.getURL(url) });

            // 关闭弹窗
            window.close();
        });
    });
});
