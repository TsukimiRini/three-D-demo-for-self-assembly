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
    return { i, content };
}

function parse_poses(file_path) {
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
        if (i >= 2) {
            for (let j in content[i]) {
                let t = content[i][j];
                content[i][j] = t.split(',');
            }
        }
        i++;
    }
    return { i, content };
}

export { parse_grid, parse_poses };