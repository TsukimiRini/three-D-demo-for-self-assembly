"use strict"

let close_btn = document.getElementsByClassName("popupCloseButton")[0];
let custom_pad = document.getElementsByClassName("custom_bg")[0];
let width_ipt = document.getElementById("width");
let height_ipt = document.getElementById("height");
let width = 30, height = 30;
let gap = 0.3;
let first_time = true;
let shape_data = [];
let new_shape_data = [];

function init_custom_pad() {
    close_btn.onclick = function () {
        custom_pad.style.display = 'none';
    }

    let shape_selector = document.getElementById("shape_selector");
    // 用户更改grid的规模时改变形状选择中生成的图示。
    width_ipt.onchange = height_ipt.onchange = function () {
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

    // 按钮逻辑
    document.getElementById("apply").onclick = function () {
        shape_data = new_shape_data;
        console.log(shape_data);
        hide_popup();
    }
    document.getElementById("reset").onclick = function () {
        width_ipt.onchange();
    }
    document.getElementById("cancel").onclick = function () {
        hide_popup();
    }
}

function show_popup() {
    custom_pad.style.display = 'block';
}

function hide_popup() {
    custom_pad.style.display = 'none';
}

function popup_custom_pad() {
    show_popup();
    if (first_time) {
        console.log("sdasd")
        width_ipt.onchange();
        first_time = false;
    }
}

export { init_custom_pad, popup_custom_pad };