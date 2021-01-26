"use strict"

import {
    stored_para
} from "../js/shape_para.js";

let slider = document.getElementById("predefined_shape_selector");
let images_show = document.getElementById("images_show");
let size_tags = document.getElementById("size_tags");
let splider_obj = null;
let selected_shape = -1;
let first = true;

let refreshShapeEvt = document.createEvent("HTMLEvents");
refreshShapeEvt.initEvent("click", false, false);

function init_stored_shape() {
    // // 右上角关闭
    // document.getElementById("stored_shape_close").onclick = function () {
    //     hide_stored_shape();
    // }

    // // cancel按钮逻辑
    // document.getElementById("stored_shape_cancel").onclick = function () {
    //     hide_stored_shape();
    // }

    load_on_first_time();
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

    // size按钮的点击事件：切换shape
    input.addEventListener('click', () => {
        document.getElementById("stored_shape_apply").dispatchEvent(refreshShapeEvt);
    });
}

function load_on_first_time() {
    // 加入图片
    let i = 0;
    for (let shape of stored_para) {
        let image_slide = document.createElement("li");
        // if (i === 0)
        //     image_slide.className = "splide__slide.is-active";
        // else
        image_slide.className = "splide__slide";
        image_slide.id = shape.shape_name;

        let image = document.createElement("img");
        image.src = "../img/" + shape.shape_name + ".png";

        image_slide.appendChild(image);
        images_show.appendChild(image_slide);

        i++;
    }
    // 初始化slider
    splider_obj = new Splide("#shape-slider", {
        type: 'loop',
        padding: {
            right: '5rem',
            left: '5rem',
        },
        focus: 'center',
        autoHeight: true,
        lazyLoad: 'nearby',
        updateOnMove: true,
        direction: 'ttb',
        height: '600px',
    });
    splider_obj.on("mounted", function () {
        splider_obj.go('+1');
    })
    splider_obj.mount();


    // 切换选择的图片时
    splider_obj.on("move", function (new_idx, old_idx, dest_idx) {
        getSizeTags(new_idx);
        document.getElementById("stored_shape_apply").dispatchEvent(refreshShapeEvt);
    })
}

// 选中某个形状并生成size tag
function getSizeTags(idx) {
    while (size_tags.hasChildNodes()) {
        size_tags.removeChild(size_tags.firstChild);
    }
    let shape_obj = stored_para[idx];
    for (let size of shape_obj.sizes) {
        create_size_tag(size.width, size.height);
    }
    // 选中最后一个size
    let radios = document.getElementsByName("grid_size");
    radios[0].checked = true;
    selected_shape = idx;
}

function popup_stored_shape() {
    show_stored_shape();
    splider_obj.refresh();
    getSizeTags(splider_obj.index);
}

function show_stored_shape() {
    slider.style.display = "block";
}

function hide_stored_shape() {
    slider.style.display = "none";
}

// splider选中下一个shape
function select_next_shape(){
    splider_obj.go('+');
}

// splider聚焦在第一个图
function focusOnFirst(){
    splider_obj.go(0);
}

export {
    init_stored_shape,
    popup_stored_shape,
    hide_stored_shape,
    selected_shape,
    select_next_shape,
    focusOnFirst,
};