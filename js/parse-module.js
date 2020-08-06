function parse_grid(file_path) {
    let xhr = new XMLHttpRequest(),
        okStatus = document.location.protocol === "file:" ? 0 : 200;
    xhr.open('GET', file_path, false);
    xhr.overrideMimeType("text/html;charset=utf-8");//默认为utf-8
    xhr.send(null);
    if (xhr.status !== okStatus) {
        return null;
    }
    let content = xhr.responseText.replace(/(\n[\s\t]*\r*\n)/g, '\n').replace(/^[\n\r\n\t]*|[\n\r\n\t]*$/g, '');
    content = content.split(/\n/);
    let i = 0;
    for (let v of content) {
        content[i] = v.split(' ');
        i++;
    }
    let { shape_num, a_num } = parse_file_name(file_path);
    let grid_w = content[0].length, grid_h = content.length;
    return { grid_w, grid_h, content, shape_num, a_num };
}

function parse_file_name(file_name) {
    let name = file_name.split(".");
    let para_name = name[name.length - 2].split("_");
    let shape_num = parseInt(para_name[para_name.length - 2]);
    let a_num = parseInt(para_name[para_name.length - 1]);
    return {
        shape_num, a_num
    };
}

function parse_poses(file_path) {
    console.log(file_path);
    let xhr = new XMLHttpRequest(),
        okStatus = document.location.protocol === "file:" ? 0 : 200;
    xhr.open('GET', file_path, false);
    xhr.overrideMimeType("text/html;charset=utf-8");//默认为utf-8
    xhr.send(null);
    if (xhr.status !== okStatus) {
        return null;
    }
    let content = xhr.responseText.replace(/(\n[\s\t]*\r*\n)/g, '\n').replace(/^[\n\r\n\t]*|[\n\r\n\t]*$/g, '');
    content = content.split(/\n/);

    let res = []
    for (let i = 2; i < content.length; i += 2) {
        content[i] = content[i].split(' ');
        res.push([])
        for (let j in content[i]) {
            let t = content[i][j];
            let xy = t.split(',');
            res[i / 2 - 1].push(xy[0]);
            res[i / 2 - 1].push(xy[1]);
        }
    }
    let len = res.length;
    console.log(res);
    return { len, res };
}

export { parse_grid, parse_poses, parse_file_name };