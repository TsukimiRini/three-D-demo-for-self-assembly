"use strict"

let slider = document.getElementById("predefined_shape_selector");
let first = true
let splider_obj = null;

function init_stored_shape() {
    // 右上角关闭
    document.getElementById("stored_shape_close").onclick = function () {
        hide_stored_shape();
    }

    // 按钮逻辑
    document.getElementById("stored_shape_apply").onclick = function () {
        let radios = document.getElementsByName("grid_size");
        let has_checked = false;
        for (let i = 0; i < radios.length; i++) {
            if (radios[i].checked) {
                console.log(radios[i].id);
                has_checked = true;
            }
        }
        // 检查是否选中一种grid规模
        if (!has_checked) {
            alert("Please set the grid size!");
        } else {
            hide_stored_shape();
        }
    }
    document.getElementById("stored_shape_cancel").onclick = function () {
        hide_stored_shape();
    }
}

function load_on_first_time() {
    // 初始化slider
    splider_obj = new Splide("#shape-slider", {
        type: 'loop',
        padding: {
            right: '5rem',
            left: '5rem',
        },
        focus: 'center',
        autoWidth: true,
    }).mount();

    // 切换选择的图片时
    splider_obj.on("move", function (new_idx, old_idx, dest_idx) {
        console.log(new_idx, old_idx, dest_idx);
    })
}

function popup_stored_shape() {
    show_stored_shape();
    if (first) {
        load_on_first_time();
        first = false;
    }
}

function show_stored_shape() {
    slider.style.display = "block";
}

function hide_stored_shape() {
    slider.style.display = "none";
}

export { init_stored_shape, popup_stored_shape };