"use strict"
let first_time_r = true;
let first_time_b = true;
let r_lf = [];
let b_lf = [];
let hm_r = document.getElementById("heatmap_r");
let hm_b = document.getElementById("heatmap_b");

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
        if (grid[x][y] != 1) { // 在shape之外
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

function drawHeatMap(id, heat_data, grid_w, grid_h) {
    // var colorscaleValue;
    // if (id === "heatmap_r") {
    //     colorscaleValue = [
    //         [0, '#000000'],
    //         [1, '#f00']
    //     ];
    // } else if (id === "heatmap_b") {
    //     colorscaleValue = [
    //         [0, '#000000'],
    //         [1, '#0000ff']
    //     ];
    // } else {
    //     throw ("invalid id");
    // }

    // let xValues = [];
    // let yValues = [];
    // for (let i = grid_w - 1; i >= 0; i--) {
    //     xValues.push(i);
    // }
    // for (let i = grid_h - 1; i >= 0; i--) {
    //     yValues.push(i);
    // }

    // var data = [{
    //     x: xValues,
    //     y: yValues,
    //     z: heat_data,
    //     type: 'heatmap',
    //     colorscale: colorscaleValue,
    //     showscale: true,
    //     // zmax: 1,
    //     // zmin: 0
    // }];

    // var layout = {
    //     // annotations: [],
    //     width: 400,
    //     height: 300,
    //     margin: {
    //         l: 25,
    //         r: 20,
    //         t: 20,
    //         b: 20
    //     }
    // };

    // for (var i = 0; i < xValues.length; i++) {
    //     for (var j = 0; j < yValues.length; j++) {
    //         var textColor = 'white';
    //         var result = {
    //             xref: 'x1',
    //             yref: 'y1',
    //             x: xValues[j],
    //             y: yValues[i],
    //             text: heat_data[i][j],
    //             showarrow: false,
    //             font: {
    //                 color: textColor,
    //                 size: 5,
    //             }
    //         };
    //         layout.annotations.push(result);
    //     }
    // }
    if (first_time_r || first_time_b) {
        var colorscaleValue;
        if (id === "heatmap_r") {
            colorscaleValue = [
                [0, '#000000'],
                [1, '#f00']
            ];
        } else if (id === "heatmap_b") {
            colorscaleValue = [
                [0, '#000000'],
                [1, '#0000ff']
            ];
        } else {
            throw ("invalid id");
        }

        let xValues = [];
        let yValues = [];
        for (let i = grid_w - 1; i >= 0; i--) {
            xValues.push(i);
        }
        for (let i = grid_h - 1; i >= 0; i--) {
            yValues.push(i);
        }

        var data = [{
            x: xValues,
            y: yValues,
            z: heat_data,
            type: 'heatmap',
            colorscale: colorscaleValue,
            showscale: true,
            // zmax: 1,
            // zmin: 0
        }];

        var layout = {
            // annotations: [],
            width: 400,
            height: 300,
            margin: {
                l: 25,
                r: 20,
                t: 20,
                b: 20
            }
        };
        if (first_time_r && id === "heatmap_r") {
            Plotly.newPlot(id, data, layout, { displayModeBar: false });
            first_time_r = false;
        } else if (first_time_b && id === "heatmap_b") {
            Plotly.newPlot(id, data, layout, { displayModeBar: false });
            first_time_b = false;
        }
    }
    else {
        let max = largestOfFour(heat_data);
        let update;
        if (max < Number.EPSILON) {
            update = {
                z: [heat_data],
                zmax: 0.1,
                zmin: 0
            }
        } else {
            update = {
                z: [heat_data],
                zauto: true
            }
        }
        if (id === "heatmap_r") {
            hm_r.data.z = heat_data;
            Plotly.restyle(hm_r, update);
        }
        else if (id === "heatmap_b") {
            hm_b.data.z = heat_data;
            Plotly.restyle(hm_b, update);
        }
    }
}

// 取数组中最大值
function largestOfFour(arr) {
    var newArray = arr.join(",").split(",");
    return Math.max.apply({}, newArray);
}
export { calculate_lf, drawHeatMap };