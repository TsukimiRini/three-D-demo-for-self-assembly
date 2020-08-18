"use strict"

import { generateGrid, showImage } from "../js/canvas_grid_genration.js"

let close_btn_custom_shape = document.getElementById("custom_shape_close");
let custom_pad = document.getElementById("custom_shape_popup");
let size_ipt = document.getElementById("custom_grid_size");
let width = 16, height = 16;
let gap = 0.3;
let first_time = true;
let shape_data = [];
let new_shape_data = [];
let agent_num = 0;

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
        let file = this.files[0];
        if (!file) {
            this.files = this.oldFile;
            file = this.files[0];
            return;
        }
        else if (file.type !== "image/png") {
            alert("Please select a .png file!");
            this.files = this.oldFile;
            file = this.files[0];
            return;
        }
        if (file.name.length == 0) {
            document.getElementById("file_name").textContent = "image to be uploaded...";
            return;
        }
        document.getElementById("file_name").textContent = file.name;
        // let reader = new FileReader();
        // reader.readAsDataURL(file);
        // reader.onload = function (e) {
        //     let image = new Image();
        //     image.src = e.target.result;
        //     console.log(image.src)
        //     image.onload = function () {
        //         showImage(image, 200, 200);
        //     }
        }
        this.oldFile = this.files;
    })

    let shape_selector = document.getElementById("shape_selector");
    // 用户更改grid的规模时改变形状选择中生成的图示。
    size_ipt.onchange = function () {
        if (this.value === this.oldVal) {
            return;
        }
        // 删除所有之前生成的正方形元素
        while (shape_selector.hasChildNodes()) {
            shape_selector.removeChild(shape_selector.firstChild);
        }
        new_shape_data.length = 0;
        agent_num = 0;

        // 计算生成正方形的边长。
        let total_wid = document.getElementsByClassName("custom_row")[0].offsetWidth;
        width = height = parseInt(size_ipt.value);
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
                square.id = i * width + j;
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
        if (e.target.className == "square_notClicked") {
            e.target.className = "square_Clicked";
            new_shape_data[parseInt(e.target.id)] = 1;
            agent_num++;
        } else if (e.target.className == "square_Clicked") {
            e.target.className = "square_notClicked";
            new_shape_data[parseInt(e.target.id)] = 0;
            agent_num--;
        }
    })

    // 自定义形状按钮逻辑
    // document.getElementById("apply").onclick = function () {
    //     shape_data = new_shape_data;
    //     console.log(shape_data);
    //     hide_custom_shape_popup();
    // }
    document.getElementById("reset").onclick = function () {
        size_ipt.oldVal = undefined;
        size_ipt.onchange();
    }
    document.getElementById("cancel").onclick = function () {
        hide_custom_shape_popup();
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
        size_ipt.onchange();
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

// 上传图片按钮逻辑
// document.getElementById("img_apply").addEventListener("click", function () {
//     let file_uploader = document.getElementById("file_uploader");
//     let file = file_uploader.files[0];
//     let reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = function (e) {
//         let url = e.target.result;
//         let image = new Image();
//         image.src = url;
//         let grid;
//         image.onload = function () {
//             grid=generateGrid(image, 16, 16);
//         };
//         new_shape_data
//     }
//     hide_image_upload_popup();
// });

export { init_custom_pad, popup_custom_pad, show_image_upload_popup, hide_custom_shape_popup, hide_image_upload_popup, new_shape_data, width, height, agent_num };