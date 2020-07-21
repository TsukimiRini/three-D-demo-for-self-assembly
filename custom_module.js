"use strict"

let close_btn = document.getElementsByClassName("popupCloseButton")[0];
let custom_pad = document.getElementsByClassName("custom_bg")[0];

function init_custom_pad() {
    close_btn.onclick = function () {
        custom_pad.style.display = 'none';
    }
}

function popup_custom_pad() {
    custom_pad.style.display = 'block';
}

export { init_custom_pad, popup_custom_pad };