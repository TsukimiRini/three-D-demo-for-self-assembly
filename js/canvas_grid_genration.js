// var img = new Image();
// img.src = 'star_pentagon.png';
// img.onload = function () {
//     generateGrid(this, 16, 16);
// };
function getIdx(x, y, width) {
    let rIdx = x * width * 4 + y * 4;
    return [rIdx, rIdx + 1, rIdx + 2, rIdx + 3];
}

function generateGrid(img, grid_width, grid_height) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    let margin_y = Math.floor(grid_height / 5);
    let margin_x = Math.floor(grid_width / 5);
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    let d = ctx.getImageData(0,0,canvas.width,canvas.height);
    console.log(d.data);

    let scale_canvas = scale({ width: grid_width - margin_x * 2, height: grid_height - margin_y * 2 }, img);
    let scale_ctx = scale_canvas.getContext('2d');

    var imageData = scale_ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    console.log(data);
    let grid = [];
    let agent_num = 0;
    for (let i = 0; i < grid_height; i++) {
        let line = [];
        for (let j = 0; j < grid_width; j++)
            line.push(0);
        grid.push(line);
    }
    for (let i = 0; i < canvas.height; i++) {
        for (let j = 0; j < canvas.width; j++) {
            let [rIdx, gIdx, bIdx, aIdx] = getIdx(i, j, canvas.width);
            let a = data[aIdx], r = data[rIdx], g = data[gIdx], b = data[bIdx];
            if (a !== 0 && (r <= 220 || g <= 220 || b <= 220)) {
                grid[i + margin_y][j + margin_x] = 1;
                agent_num++;
            }
        }
    }
    return { agent_num, grid };
}

export { generateGrid };