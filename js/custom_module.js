"use strict"

let close_btn_custom_shape = document.getElementById("custom_shape_close");
let custom_pad = document.getElementById("custom_shape_popup");
let width_ipt = document.getElementById("width");
let height_ipt = document.getElementById("height");
let width = 30, height = 30;
let gap = 0.3;
let first_time = true;
let shape_data = [];
let new_shape_data = [];

function init_custom_pad() {
    // 设置右上角叉叉关闭窗口功能
    close_btn_custom_shape.onclick = function () {
        hide_custom_shape_popup();
    }
    close_image_btn.onclick = function () {
        hide_image_upload_popup();
    }

    // 文件上传美化
    document.getElementById("file_wrapper").onclick = function () {
        document.getElementById("file_uploader").click();
    }
    document.getElementById("file_uploader").addEventListener("change", function () {
        if (this.value.length == 0) {
            document.getElementById("file_name").textContent = "image to be uploaded...";
            return;
        }
        document.getElementById("file_name").textContent = this.value;
    })

    let shape_selector = document.getElementById("shape_selector");
    // 用户更改grid的规模时改变形状选择中生成的图示。
    width_ipt.onchange = height_ipt.onchange = function () {
        if (width_ipt.value >= 40) {
            width_ipt.value = 40;
        }
        if (height_ipt.value >= 40) {
            height_ipt.value = 40;
        }
        if (this.value === this.oldVal) {
            return;
        }
        // 删除所有之前生成的正方形元素
        while (shape_selector.hasChildNodes()) {
            shape_selector.removeChild(shape_selector.firstChild);
        }
        new_shape_data.length = 0;

        // 计算生成正方形的边长。
        let total_wid = document.getElementsByClassName("custom_row")[0].offsetWidth;
        width = parseInt(width_ipt.value), height = parseInt(height_ipt.value);
        let per_w = Math.min((total_wid - width * gap * 2 + gap * 2) / width, 15);
        let total_h = per_w * height + gap * height * 2 - gap * 2 + 30;
        shape_selector.style.height = `${total_h}px`;

        // 加入正方形
        for (let i = 0; i < height; i++) {
            let tr = document.createElement("tr");
            tr.style.padding = `${gap}px ${gap}px ${gap}px ${gap}px`;
            for (let j = 0; j < width; j++) {
                new_shape_data.push(0);
                let td = document.createElement("td");
                let square = document.createElement("div");
                square.className = "square_notClicked";
                square.setAttribute("style", `width:${per_w}px;height:${per_w}px;position:"absolute";margin:${gap}px ${gap}px ${gap}px ${gap}px;cursor:pointer;border-radius: 6px;`);
                square.id = i * height + j;
                td.appendChild(square);
                tr.appendChild(td);
            }
            shape_selector.appendChild(tr);
        }

        // 存储旧值
        this.oldVal = this.value;
    }

    // 实现形状选择界面
    shape_selector.addEventListener("click", function (e) {
        console.log("clicked");
        console.log(e.target.className);
        if (e.target.className == "square_notClicked") {
            e.target.className = "square_Clicked";
            new_shape_data[parseInt(e.target.id)] = 1;
        } else if (e.target.className == "square_Clicked") {
            e.target.className = "square_notClicked";
            new_shape_data[parseInt(e.target.id)] = 0;
        }
    })

    // 自定义形状按钮逻辑
    document.getElementById("apply").onclick = function () {
        shape_data = new_shape_data;
        console.log(shape_data);
        hide_custom_shape_popup();
    }
    document.getElementById("reset").onclick = function () {
        width_ipt.oldVal = undefined;
        width_ipt.onchange();
    }
    document.getElementById("cancel").onclick = function () {
        hide_custom_shape_popup();
    }
    // 上传图片按钮逻辑
    document.getElementById("img_apply").onclick = function () {
        hide_image_upload_popup();
    }
    document.getElementById("img_cancel").onclick = function () {
        hide_image_upload_popup();
    }
}

function show_custom_shape_popup() {
    custom_pad.style.display = 'block';
}

function hide_custom_shape_popup() {
    custom_pad.style.display = 'none';
}

function popup_custom_pad() {
    show_custom_shape_popup();
    if (first_time) {
        width_ipt.onchange();
        first_time = false;
    }
}

// 图片上传弹窗
let image_upload_pad = document.getElementById("image_shape_popup");
let close_image_btn = document.getElementById("image_shape_close");

function show_image_upload_popup() {
    image_upload_pad.style.display = 'block';
}

function hide_image_upload_popup() {
    image_upload_pad.style.display = 'none';
}

export { init_custom_pad, popup_custom_pad, show_image_upload_popup };