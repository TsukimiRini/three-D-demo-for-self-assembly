"use strict"

import { stored_para } from "../js/shape_para.js";

let slider = document.getElementById("predefined_shape_selector");
let images_show = document.getElementById("images_show");
let size_tags = document.getElementById("size_tags");
let first = true
let splider_obj = null;
let selected_shape = -1;

function init_stored_shape() {
    // 右上角关闭
    document.getElementById("stored_shape_close").onclick = function () {
        hide_stored_shape();
    }

    // cancel按钮逻辑
    document.getElementById("stored_shape_cancel").onclick = function () {
        hide_stored_shape();
    }
}

function create_size_tag(width, height) {
    let pair_radio = document.createElement("div");
    pair_radio.className = "pair_radio";
    let input = document.createElement("input");
    input.className = "stored_shape_size_radio";
    input.type = "radio";
    input.name = "grid_size";
    input.id = width.toString() + "," + height.toString();
    let label = document.createElement("label");
    label.className = "radio_lbl";
    label.setAttribute("for", input.id);
    label.innerHTML = width.toString() + "&times;" + height.toString();

    pair_radio.appendChild(input);
    pair_radio.appendChild(label);
    size_tags.appendChild(pair_radio);
}

function load_on_first_time() {
    // 加入图片
    for (let shape of stored_para) {
        let image_slide = document.createElement("li");
        image_slide.className = "splide__slide";
        image_slide.id = shape.shape_name;

        let image = document.createElement("img");
        image.src = "../img/" + shape.shape_name + ".png";

        image_slide.appendChild(image);
        images_show.appendChild(image_slide);
    }
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
        while (size_tags.hasChildNodes()) {
            size_tags.removeChild(size_tags.firstChild);
        }
        let shape_obj = stored_para[new_idx];
        for (let size of shape_obj.sizes) {
            create_size_tag(size.width, size.height);
        }
        selected_shape = new_idx;
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

export { init_stored_shape, popup_stored_shape, hide_stored_shape, selected_shape };