"use strict"
let first_time_r = true;
let first_time_b = true;
let r_lf = [];
let b_lf = [];
let hm_r = document.getElementById("heatmap_r");
let hm_b = document.getElementById("heatmap_b");

function clear_ALF() {
    r_lf.length = 0;
    b_lf.length = 0;
    first_time_b = true;
    first_time_r = true;
}

// 传入grid数据和单步的pose数据。step标识当前步数。
function calculate_lf(grid, pose, step, a_num) {
    let grid_w = grid[0].length, grid_h = grid.length;

    if (r_lf.length > step && b_lf.length > step) {
        let res_r = r_lf[step], res_b = b_lf[step];
        return { res_r, res_b };
    } else if (r_lf.length > step || b_lf.length > step) {
        throw ("can't reach here");
    }
    let o_t = [], u_t = [];// 每个元素都是一个长度为2的数组，指代一个位置(x,y)/(w,h),坐标系以左上为0点，正方向分别为右和下
    let agent_map = [];
    for (let i = 0; i < grid_h; i++) {
        let line = new Array(grid_w);
        for (let j = 0; j < grid_w; j++)
            line[j] = 0;
        agent_map.push(line);
    }

    // o_t
    for (let i = 0; i < a_num; i++) {
        let x = pose[2 * i], y = pose[2 * i + 1];
        if (parseInt(grid[grid_h - y - 1][x]) !== 1) { // 在shape之外
            o_t.push([parseInt(x), grid_h - y - 1]);
        }
        agent_map[grid_h - y - 1][x] = 1;
    }

    // u_t
    for (let i = 0; i < grid_h; i++) {
        for (let j = 0; j < grid_w; j++) {
            if (grid[i][j] == 1 && agent_map[i][j] != 1) { // 没被占据且在shape内
                u_t.push([j, i]);
            }
        }
    }

    let step_r = [], step_b = [];
    for (let j = 0; j < grid_w; j++) {
        let arr_r = [], arr_b = [];
        for (let i = grid_h - 1; i >= 0; i--) {
            let this_point = [i, j];
            // 计算红色光场
            let red_l = 0;
            for (let point of o_t) {
                red_l += f_two_points(point, this_point);
            }
            arr_r.push(red_l.toFixed(1));
            // 计算蓝色光场
            let blue_l = 0;
            for (let point of u_t) {
                blue_l += f_two_points(point, this_point);
            }
            arr_b.push(blue_l.toFixed(1));
        }
        step_r.push(arr_r);
        step_b.push(arr_b);
    }
    r_lf.push(step_r);
    b_lf.push(step_b);

    let res_r = r_lf[step], res_b = b_lf[step];
    return { res_r, res_b };
}

function f_two_points(p1, p2) {
    let val = 1 + Math.max(Math.abs(p1[0] - p2[0]), Math.abs(p1[1] - p2[1]));
    let res = 1 / val;
    return res;
}

// 取数组中最大值
function largestOfFour(arr) {
    var newArray = arr.join(",").split(",");
    return Math.max.apply({}, newArray);
}
export { calculate_lf, clear_ALF };