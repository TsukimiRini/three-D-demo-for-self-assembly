"use strict"

let cursor = {
    clientX: 0,
    clientY: 0,
}

function Heatmap(config) {
    this.setConfig(config);
}

Heatmap.prototype = {
    init: function () {
        this.canvasCoord = document.createElement('canvas');
        this.canvasCoord.width = this.width;
        this.canvasCoord.height = this.height;
        this.el.append(this.canvasCoord);
        this.ctxCoord = this.canvasCoord.getContext('2d');
        this.canvasCoord.style.position = "absolute";
        this.canvasCoord.style.setProperty('z-index', 0);


        this.canvasData = document.createElement('canvas');
        this.canvasData.width = this.width;
        this.canvasData.height = this.height;
        this.el.append(this.canvasData);
        this.ctxData = this.canvasData.getContext('2d');
        this.canvasData.style.position = "absolute";
        this.canvasData.style.setProperty('z-index', 1);
        this.drawCoord();
    },
    setConfig: function (config) {
        this.width = config.width;
        this.height = config.height;
        this.gridW = config.gridW;
        this.gridH = config.gridH;
        this.el = config.el;
        this.title = config.title;
        this.colorS = config.colorS;
        this.colorE = config.colorE;
        this.minVal = config.minVal;
        this.maxVal = config.maxVal;
        this.tooltip = config.tooltip;
        this.mapData = null;
        this.margin = 30;
        this.innerWidth = this.width - this.margin - 15;
        this.innerHeight = this.height - this.margin - 30;
        this.startPoint = {
            x: this.margin,
            y: this.height - this.margin - 15,
        }

        this.el.style.width = this.width + 'px';
        this.el.style.height = this.height + 'px';
    },
    drawCoord: function () {
        this.gapW = Math.floor(this.gridW / 20);
        if (this.gapW <= 0) this.gapW = 1;
        this.gapH = Math.floor(this.gridH / 20);
        if (this.gapH <= 0) this.gapH = 1;

        this.ctxCoord.font = "11px serif"

        // x y轴
        this.ctxCoord.clearRect(0, 0, this.width, this.height);
        this.ctxCoord.beginPath();
        this.ctxCoord.moveTo(this.startPoint.x, this.startPoint.y);
        this.ctxCoord.lineTo(this.startPoint.x, this.startPoint.y - this.innerHeight);
        this.ctxCoord.moveTo(this.startPoint.x, this.startPoint.y);
        this.ctxCoord.lineTo(this.startPoint.x + this.innerWidth, this.startPoint.y);
        this.ctxCoord.stroke();

        // 标尺
        this.xCnt = Math.floor(this.gridW / this.gapW), this.yCnt = Math.floor(this.gridH / this.gapH);
        this.disX = this.innerWidth / this.xCnt, this.disY = this.innerHeight / this.yCnt;
        this.unitX = this.disX / this.gapW, this.unitY = this.disY / this.gapH;
        this.ctxCoord.beginPath();
        this.ctxCoord.strokeStyle = "#999";
        for (let i = 0; i < this.xCnt; i++) {
            let curX = this.startPoint.x + this.disX * i;
            this.ctxCoord.moveTo(curX, this.startPoint.y);
            this.ctxCoord.lineTo(curX, this.startPoint.y + 5);
            this.ctxCoord.moveTo(curX, this.startPoint.y + 20);
            this.ctxCoord.textAlign = "center";
            this.ctxCoord.fillText(this.gapW * i, curX, this.startPoint.y + 15);
        }
        for (let i = 0; i < this.yCnt; i++) {
            let curY = this.startPoint.y - this.disY * i;
            this.ctxCoord.moveTo(this.startPoint.x, curY);
            this.ctxCoord.lineTo(this.startPoint.x - 5, curY);
            this.ctxCoord.moveTo(this.startPoint.x - 20, curY);
            this.ctxCoord.textAlign = "center";
            this.ctxCoord.fillText(this.gapH * i, this.startPoint.x - 15, curY);
        }
        this.ctxCoord.stroke();

        // title
        this.ctxCoord.beginPath();
        this.ctxCoord.font = "20px Arial";
        this.ctxCoord.fillText(this.title, this.width / 2 - this.margin / 2, this.height - 10);
        this.ctxCoord.stroke();

        // refresh
        this.initData = false;
    },
    updateData: function (data) {
        this.canvasData.onmousemove = (e) => {
            tooltipCheck(e, this, data);
        };
        this.ctxData.clearRect(0, 0, this.width, this.height);

        let tmp_w = data[0].length, tmp_h = data.length;
        if(tmp_w != this.gridW || tmp_h != this.gridH){
            this.gridW = tmp_w;
            this.gridH = tmp_h;
            this.innerWidth = this.width - this.margin - 15;
            this.innerHeight = this.height - this.margin - 30;
            this.drawCoord();
        }
        let maxVal = 0;
        for (let i = 0; i < this.gridH; i++)
            for (let j = 0; j < this.gridW; j++) {
                maxVal = Math.max(maxVal, data[i][j]);
            }
        this.maxVal = maxVal;
        for (let i = 0; i < this.gridH; i++) {
            for (let j = 0; j < this.gridW; j++) {
                if (this.minVal == this.maxVal) {
                    this.ctxData.fillStyle = this.colorS;
                } else {
                    this.ctxData.fillStyle = gradientColor(this.colorS, this.colorE, data[i][j] / this.maxVal);
                }

                this.ctxData.fillRect(this.startPoint.x + (this.gridW - j) * this.disX / this.gapW,
                    this.startPoint.y - (this.gridH - i) * this.disY / this.gapH, this.disX / this.gapW, this.disY / this.gapH);
            }
        }
        const mousemoveEvent = new MouseEvent('mousemove', {
            clientX: cursor.clientX,
            clientY: cursor.clientY,
        });
        this.canvasData.dispatchEvent(mousemoveEvent);
    }
}

// convert #hex notation to rgb array
function parseColor(hexStr) {
    return hexStr.length === 4 ? hexStr.substr(1).split('').map(function (s) {
        return 0x11 * parseInt(s, 16);
    }) : [hexStr.substr(1, 2), hexStr.substr(3, 2), hexStr.substr(5, 2)].map(function (s) {
        return parseInt(s, 16);
    })
};

// zero-pad 1 digit to 2
function pad(s) {
    return (s.length === 1) ? '0' + s : s;
};

function gradientColor(start, end, per, gamma) {
    var j, ms, me,
        so = [];
    gamma = gamma || 1;
    var normalize = function (channel) {
        return Math.pow(channel / 255, gamma);
    };
    start = parseColor(start).map(normalize);
    end = parseColor(end).map(normalize);
    ms = per;
    me = 1 - ms;
    for (j = 0; j < 3; j++) {
        so[j] = pad(Math.round(Math.pow(start[j] * me + end[j] * ms, 1 / gamma) * 255).toString(16));
    }
    return '#' + so.join('');
};

function tooltipCheck(e, heatmap, data) {
    var cRect = heatmap.canvasData.getBoundingClientRect();
    var canvasX = Math.round(e.clientX - cRect.left);
    var canvasY = Math.round(e.clientY - cRect.top);
    cursor.clientX = e.clientX, cursor.clientY = e.clientY;
    if (canvasX >= heatmap.startPoint.x && canvasX < heatmap.startPoint.x + heatmap.xCnt * heatmap.disX &&
        canvasY <= heatmap.startPoint.y && canvasY > heatmap.startPoint.y - heatmap.yCnt * heatmap.disY) {
        let x = Math.floor((canvasX - heatmap.startPoint.x) / heatmap.unitX),
            y = Math.floor((heatmap.startPoint.y - canvasY) / heatmap.unitY);
        heatmap.tooltip.style.top = (e.clientY - 40) + 'px';
        heatmap.tooltip.style.left = (e.clientX - 30) + 'px';
        heatmap.tooltip.innerHTML = 'X: ' + x + ', Y: ' + y + ', Z: ' + data[x][y];
        heatmap.tooltip.style.visibility = 'visible';
    } else {
        heatmap.tooltip.style.visibility = 'hidden';
    }
}

export {
    Heatmap
};