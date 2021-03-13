"use strict"

import { OrbitControls } from '../three.js-r120/examples/jsm/controls/OrbitControls.js';
import { GUI } from '../three.js-r120/examples/jsm/libs/dat.gui.module.js';
import { EffectComposer } from '../three.js-r120/examples/jsm/postprocessing/EffectComposer.js';
import { OutlinePass } from '../three.js-r120/examples/jsm/postprocessing/OutlinePass.js';
import { RenderPass } from '../three.js-r120/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from '../three.js-r120/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from '../three.js-r120/examples/jsm/shaders/FXAAShader.js';

import { parse_grid, parse_file_name, parse_poses } from '../js/parse-module.js';
import * as CUSTOM_PAD from '../js/custom_module.js';
import * as STORED_SHAPE_PAD from '../js/stored_shape_module.js';
import { stored_para } from "../js/shape_para.js";
import * as GLB_LOAD from "../js/import_glb_mods.js";
import { generateGrid, showImage } from "../js/canvas_grid_genration.js";
import { calculate_lf, clear_ALF } from "../js/ALF.js";
import { Heatmap } from "../js/heatmap.js"

// ======================parameter===============================
// color
let color_scheme = {
    agent_color: 0x7C3C3C,          // 小球颜色
    plane_color: 0xC0CDCF,          // 非目标区域颜色
    grid_color: 0xD5D5E0,           // 网格颜色
    target_shape_color: 0xEEE0CB,   // 目标区域颜色
    orbit_color: 0xbd1a52,          // 轨迹线颜色
    background_color: 0xe0e0e0,     // 背景颜色
    outline_wall_color: 0x669999,   // 目标区域形状轮廓颜色
}
// config
let agent_types = ["cube", "sphere", "slime", "man", "puppy"];
let agent_id = 1;
let fp_mov = 80;
let pause_frame = 60;
let per_mov = 1 / fp_mov;
let bounce_height = [];
let mov_para = {
    frame: 0,
    dirX: 0,
    dirY: 0,
    step: 0
};
let sphere_r = 0.45;
let ori_height = 0.5;
let outline_h = 1;

// 每个形状播放一遍后直接播放下一个
let goToNext = true;
// 从stored shape中选取形状
let chooseFromStored = true;

// 上一步/下一步按钮的粒度设置
const slipt_of_step = 5;

let mod_file = {
    "slime": "../glb/Slime.glb",
    "man": "../glb/Worker_Male.glb",
    "puppy": "../glb/Pug.glb",
}
let scale_config = {
    "slime": 0.3,
    "man": 0.5,
    "puppy": 0.27,
}
let init_rotation = {
    "slime": {
        x: Math.PI / 2,
        y: Math.PI * 3 / 2
    },
    "man": {
        x: Math.PI / 2,
        y: Math.PI * 2
    },
    "puppy": {
        x: Math.PI / 2,
        y: 2 * Math.PI
    },
}
let animation_idx = {
    "slime": 0,
    "man": 10,
    "puppy": 1,
}
function dirX2rotation(x, y) {
    if (x === 0 && y === 0) {
        throw ("the object shouldn't move");
    }
    let agent_name = agent_types[agent_id];
    if (x === 1 && y === 0) return init_rotation[agent_name].y - Math.PI * 3 / 2;
    if (x === 1 && y === 1) return Math.PI / 4 + init_rotation[agent_name].y - Math.PI * 3 / 2;
    if (x === 1 && y === -1) return 7 * Math.PI / 4 + init_rotation[agent_name].y - Math.PI * 3 / 2;
    if (x === 0 && y === 1) return Math.PI / 2 + init_rotation[agent_name].y - Math.PI * 3 / 2;
    if (x === 0 && y === -1) return 3 * Math.PI / 2 + init_rotation[agent_name].y - Math.PI * 3 / 2;
    if (x === -1 && y === 0) return Math.PI + init_rotation[agent_name].y - Math.PI * 3 / 2;
    if (x === -1 && y === 1) return 3 * Math.PI / 4 + init_rotation[agent_name].y - Math.PI * 3 / 2;
    if (x === -1 && y === -1) return 5 * Math.PI / 4 + init_rotation[agent_name].y - Math.PI * 3 / 2;
}

let custom_shape_id = 10;

// shape parameter
let shape_config = {
    grid_w: null,
    grid_h: null,
    shape_num: null,
    agent_num: null,
    file_path: '../data/80_80/grid_chinese_mu_80_1340.txt',
    pose_path: '../data/80_80/poses_0_6_80_80_chinese_mu_80_1340.txt'
}

let params = {
    speed: 13 - fp_mov / 10,
    agent_type: agent_types[agent_id],
    custom_pad: CUSTOM_PAD.popup_custom_pad,
    image_upload_pad: CUSTOM_PAD.show_image_upload_popup,
    // stored_shape_pad: STORED_SHAPE_PAD.popup_stored_shape,
    change_vp: change_viewpoint,
}

// global
let scene = new THREE.Scene();
let line_scene = new THREE.Scene();
let renderer = new THREE.WebGLRenderer();
renderer.autoClear = false;
let controls = null;
let grid = null;
let plane = null;
let camera = null;
let htmap_r = null, htmap_b = null;

let composer, outlinePass, outlinePass_models;
let raycaster = new THREE.Raycaster(); // 鼠标指针射线
let mouse = new THREE.Vector2(); // 鼠标坐标
let hover_obj = null; // 正被悬停的agent
let selected_obj = []; // 被右键的agent

// 预设视角定义
let viewpoint = [
    { phi: 1.57, theta: 0 },
    // { phi: 2.023, theta: 0.255 },
    // { phi: 2.765, theta: 0.3453 },
    // { phi: 2.883, theta: -0.067 },
    // { phi: 2.328, theta: -0.54 },
]
let vp_id = 0;

// gui element
let GUI_domElement = {
    speed: null,
    agent_type: null,
}
let GUI_functions = {
    draw_shape: null,
    upload_shape: null,
    // shape_selector: null,
}

let agents_num = 0;
let total_step = 0; // steps of iteration
let horizon_line = [], vertical_line = [];

let objects = [];
let shadows = [];
let groups = [];
let walls = [];
let orbits = [];
let meshline_orbits = [];
let geometry_orbits = [];

let poses_data = [];// poses_data[i][2*r]:x of agent r in i-th step

// 3d场景离页面边缘距离
let window_margin = 50;
let right_block = 400;
let left_block = 400;
let bottom_block = 0;

let done = false;
let paused = false;
let draw_heat_map_completed = true;
// ================================================================

// ========================main====================================
window.addEventListener("load", function () {
    CUSTOM_PAD.init_custom_pad();
});
// load shadow texture & create shadow geometry and material
const loader = new THREE.TextureLoader();
const shadowTexture = loader.load('./img/roundshadow.png'); // load the fake shadow texture
const planeSize = 1;
const shadowGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);

STORED_SHAPE_PAD.init_stored_shape();

// load data
let { grid_w, grid_h, content: grid_data, shape_num, a_num } = parse_grid(shape_config.file_path);
init_shape_data();
let { len, res } = parse_poses(shape_config.pose_path);
total_step = len;
poses_data = res;

let web_worker = create_web_worker();
// let timer_worker = create_timer_worker();
web_worker.postMessage({ MessagePurpose: "SetUp" });
init();
if(chooseFromStored){
    STORED_SHAPE_PAD.focusOnFirst();
    set_stored_shape();
}
reset_shape();
done = true;
create_GUI();
// adjust_icon_position();
// =================================================================
function init_shape_data() {
    shape_config.grid_w = grid_w, shape_config.grid_h = grid_h;
    shape_config.shape_num = shape_num;
    shape_config.agent_num = a_num;
}

// 创建web worker
function create_web_worker() {
    let web_worker = new Worker("../js/webWorker.js", { name: "mainWorker" });
    web_worker.onerror = function (evt) { console.log(`Error from Web Worker: ${evt.message}`); }
    web_worker.onmessage = web_worker_receive_msg;
    return web_worker;
}

// web worker消息处理
function web_worker_receive_msg(evt) {
    let obj = evt.data;
    if (obj.cmd === "ready") { // main logic
        console.log("ready!")
        // web_worker.postMessage({ MessagePurpose: "getAgentNum", width: grid_w, height: grid_h });
        // web_worker.postMessage({
        //     MessagePurpose: "getPoseData", width: shape_config.grid_w, height: shape_config.grid_h, shape_num: shape_config.shape_num,
        //     agent_num: shape_config.agent_num, grid_data: grid_data
        // });
    } else if (obj.cmd === "poseData") {
        poses_data.push(obj.data);
        total_step = poses_data.length;
        if (obj.step === 1) {
            reset_shape();
        }
    } else if (obj.cmd === "done") {
        done = true;
    }
}

// create config pad
function create_GUI() {
    // 速度控制条
    let speedRange = document.getElementById('speedRange'), speedVal = document.getElementById('speedVal');
    function speedChange(){
        speedVal.innerHTML = speedRange.value;
        params.speed = speedRange.value;
    }
    speedChange();
    speedRange.addEventListener('change', speedChange)

    // agent type切换
    let type_selector = document.getElementById('typeSelector');
    for (let type of agent_types){
        let ele = document.createElement('option');
        ele.value = type;
        ele.innerHTML = type;
        type_selector.appendChild(ele);
    }
    type_selector.value = agent_types[agent_id];
    function typeChange(){
        params.agent_type = type_selector.value;
    }
    type_selector.addEventListener('change', typeChange);

    // 隐藏grid
    let showGrid = document.getElementById('showGrid');
    showGrid.checked = grid.material.visible;
    showGrid.addEventListener('change', function(){
        grid.material.visible = showGrid.checked;
    })

    // 绘图转为shape
    let draw2Shape = document.getElementById('draw2Shape');
    draw2Shape.addEventListener('click', params.custom_pad);
    let pic2Shape = document.getElementById('pic2Shape');
    pic2Shape.addEventListener('click', params.image_upload_pad);
}

// compute the shape of pattern to draw the outline
function outline_grid() {
    // 清除旧数据，保证可复用性
    // for (let obj of horizon_line)
    //     scene.remove(obj);
    // for (let obj of vertical_line)
    //     scene.remove(obj);
    horizon_line.length = 0, vertical_line.length = 0;

    // 边界条件处理
    let s = -1, e = -1;
    if (grid_data[0][0] == 1) {
        s = 0;
    }
    for (let i = 1; i < shape_config.grid_w; i++) {
        if (grid_data[0][i - 1] == 1 && grid_data[0][i] == 0) {
            e = i;
            horizon_line.push([0, s, e]);
        }
        if (grid_data[0][i - 1] == 0 && grid_data[0][i] == 1) {
            s = i;
        }
        if (i === shape_config.grid_w - 1 && grid_data[0][i] == 1) {
            e = i + 1;
            horizon_line.push([0, s, e]);
        }
    }
    if (grid_data[shape_config.grid_h - 1][0] == 1) {
        s = 0;
    }
    for (let i = 1; i < shape_config.grid_w; i++) {
        if (grid_data[shape_config.grid_h - 1][i - 1] == 1 && grid_data[shape_config.grid_h - 1][i] == 0) {
            e = i;
            horizon_line.push([shape_config.grid_h, s, e]);
        }
        if (grid_data[shape_config.grid_h - 1][i - 1] == 0 && grid_data[shape_config.grid_h - 1][i] == 1) {
            s = i;
        }
        if (i === shape_config.grid_w - 1 && grid_data[shape_config.grid_h - 1][i] == 1) {
            e = i + 1;
            horizon_line.push([shape_config.grid_h, s, e]);
        }
    }
    console.log(horizon_line)

    let last_up = -1, last_down = -1, start_node = -1, cur_node = -1, cur_up = -1, cur_down = -1;
    for (let i = 1; i < shape_config.grid_h; i++) {
        for (let j = 0; j < shape_config.grid_w; j++) {
            cur_up = grid_data[i - 1][j], cur_down = grid_data[i][j];
            if (cur_up === last_up && cur_down === last_down) {
                cur_node = j + 1;
                if (j !== shape_config.grid_w - 1)
                    continue;
            }
            if (last_up !== last_down) {
                horizon_line.push([i, start_node, cur_node]);
                start_node = -1;
            }
            if (cur_up !== cur_down && !(cur_up === last_up && cur_down === last_down)) {
                if (j !== shape_config.grid_w - 1) {
                    start_node = j;
                    cur_node = j + 1;
                }
                else {
                    horizon_line.push([i, j, j + 1]);
                }
            }
            last_up = cur_up, last_down = cur_down;
        }
        last_up = -1, last_down = -1, start_node = -1, cur_node = -1;
    }

    // 边界条件处理
    s = -1, e = -1;
    if (grid_data[0][0] == 1) {
        s = 0;
    }
    for (let i = 1; i < shape_config.grid_h; i++) {
        if (grid_data[i - 1][0] == 1 && grid_data[i][0] == 0) {
            e = i;
            vertical_line.push([0, s, e]);
        }
        if (grid_data[i - 1][0] == 0 && grid_data[i][0] == 1) {
            s = i;
        }
        if (i === shape_config.grid_h - 1 && grid_data[i][0] == 1) {
            e = i + 1;
            vertical_line.push([0, s, e]);
        }
    }
    if (grid_data[0][shape_config.grid_w - 1] == 1) {
        s = 0;
    }
    for (let i = 1; i < shape_config.grid_h; i++) {
        if (grid_data[i - 1][shape_config.grid_w - 1] == 1 && grid_data[i][shape_config.grid_w - 1] == 0) {
            e = i;
            vertical_line.push([shape_config.grid_w, s, e]);
        }
        if (grid_data[i - 1][shape_config.grid_w - 1] == 0 && grid_data[i][shape_config.grid_w - 1] == 1) {
            s = i;
        }
        if (i === shape_config.grid_w - 1 && grid_data[i][shape_config.grid_w - 1] == 1) {
            e = i + 1;
            vertical_line.push([shape_config.grid_w, s, e]);
        }
    }

    console.log(vertical_line)

    for (let i = 1; i < shape_config.grid_w; i++) {
        for (let j = 0; j < shape_config.grid_h; j++) {
            cur_up = grid_data[j][i - 1], cur_down = grid_data[j][i];
            if (cur_up === last_up && cur_down === last_down) {
                cur_node = j + 1;
                if (j !== shape_config.grid_h - 1)
                    continue;
            }
            if (last_up !== last_down) {
                vertical_line.push([i, start_node, cur_node]);
                start_node = -1;
            }
            if (cur_up !== cur_down && !(cur_up === last_up && cur_down === last_down)) {
                if (j !== shape_config.grid_h - 1) {
                    start_node = j;
                    cur_node = j + 1;
                }
                else {
                    vertical_line.push([i, j, j + 1]);
                }
            }
            last_up = cur_up, last_down = cur_down;
        }
        last_up = -1, last_down = -1, start_node = -1, cur_node = -1;
    }
}

// add the outline to the scene
function build_outline_wall() {
    // 清除之前渲染的墙壁
    for (let obj of walls)
        scene.remove(obj);
    walls.length = 0;

    let vShader = `
        varying vec2 vUv;

        void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
    `;
    let fShaderY = `
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec2 vUv;
        void main() {
        gl_FragColor = vec4(color1,1.0-vUv.y);
        }
    `;
    let fShaderX = `
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec2 vUv;
        void main() {
        gl_FragColor = vec4(color1,vUv.x);
        }
    `;
    let materialY = new THREE.ShaderMaterial({
        uniforms: {
            color1: {
                value: new THREE.Color(0x2B2D42)
            },
            color2: {
                value: new THREE.Color("purple")
            }
        },
        vertexShader: vShader,
        fragmentShader: fShaderY,
        transparent: true,
        side: THREE.DoubleSide
    });
    for (let line of horizon_line) {
        let row = shape_config.grid_h / 2 - line[0], start_node = line[1] - shape_config.grid_w / 2, end_node = line[2] - shape_config.grid_w / 2;
        let geometry = new THREE.PlaneGeometry(end_node - start_node, outline_h);
        let mesh = new THREE.Mesh(geometry, materialY);
        mesh.position.x = (start_node + end_node) / 2;
        mesh.position.y = row;
        mesh.position.z = outline_h / 2;
        mesh.rotateX(Math.PI / 2);
        walls.push(mesh);
        scene.add(mesh);
    }
    let materialX = new THREE.ShaderMaterial({
        uniforms: {
            color1: {
                value: new THREE.Color(color_scheme.outline_wall_color)
            },
            color2: {
                value: new THREE.Color("purple")
            }
        },
        vertexShader: vShader,
        fragmentShader: fShaderX,
        transparent: true,
        side: THREE.DoubleSide
    });
    for (let line of vertical_line) {
        let col = line[0] - shape_config.grid_w / 2, end_node = shape_config.grid_h / 2 - line[1], start_node = shape_config.grid_h / 2 - line[2];
        let geometry = new THREE.PlaneGeometry(outline_h, end_node - start_node);
        let mesh = new THREE.Mesh(geometry, materialX);
        mesh.position.y = (start_node + end_node) / 2;
        mesh.position.x = col;
        mesh.position.z = outline_h / 2;
        mesh.rotateY(Math.PI / 2);
        walls.push(mesh);
        scene.add(mesh);
    }
}

// 创建有起始点坐标的mesh line
function create_mesh_line(material, x, y) {
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(x, y, 0.1));

    var line = new MeshLine();
    line.setGeometry(geometry);
    var mesh = new THREE.Mesh(line.geometry, material);
    mesh.visible = false;
    orbits.push(mesh);
    geometry_orbits.push(geometry);
    meshline_orbits.push(line);

    line_scene.add(mesh);
}

//==================agent generation=========================
function cube_generate() {
    // a cube
    let material = new THREE.MeshPhongMaterial({
        color: color_scheme.agent_color, polygonOffset: true,
        polygonOffsetFactor: 0.1,
        polygonOffsetUnits: 2,
        shininess: 5,
        specular: 0xdb504b
    });
    var line_material = new MeshLineMaterial({ color: new THREE.Color(color_scheme.orbit_color), sizeAttenuation: true, lineWidth: 0.1, opacity: 0.7, transparent: true });
    for (let i = 0; i < shape_config.agent_num; i++) {
        let geometry = new THREE.BoxGeometry(0.9, 0.9, 1);
        let cube = new THREE.Mesh(geometry, material);
        let x = poses_data[0][2 * i], y = poses_data[0][2 * i + 1];
        cube.position.y = y - shape_config.grid_h / 2 + 0.5;
        cube.position.x = x - shape_config.grid_w / 2 + 0.5;
        cube.position.z = 0.5;
        scene.add(cube);
        objects.push(cube);

        create_mesh_line(line_material, cube.position.x, cube.position.y);
    }

    // 参数重置
    mov_para.step = 0;
    mov_para.dirX = 0;
    mov_para.dirY = 0;
    mov_para.frame = 0;
}

function sphere_generate() {
    let material = new THREE.MeshPhongMaterial({
        color: color_scheme.agent_color, polygonOffset: true,
        polygonOffsetFactor: 0.1,
        polygonOffsetUnits: 2,
    });

    var line_material = new MeshLineMaterial({ color: new THREE.Color(color_scheme.orbit_color), sizeAttenuation: true, lineWidth: 0.1, opacity: 0.7, transparent: true });
    for (let i = 0; i < shape_config.agent_num; i++) {
        // create group for the integrity of sphere and shadow
        let base = new THREE.Object3D(); // sphere & shadow
        scene.add(base);

        // create shpere
        let geometry = new THREE.SphereBufferGeometry(sphere_r, 32, 32);
        let sphere = new THREE.Mesh(geometry, material);
        let x = poses_data[0][2 * i], y = poses_data[0][2 * i + 1];
        sphere.position.z = sphere_r;
        base.add(sphere);

        // material for shadow
        let shadowMat = new THREE.MeshBasicMaterial({
            map: shadowTexture,
            transparent: true,
            depthWrite: false,
        });

        // create shadow
        let shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
        shadowMesh.position.z = 0.001;  // so we're above the ground slightly
        const shadowSize = sphere_r * 4;
        shadowMesh.scale.set(shadowSize, shadowSize, shadowSize);
        base.add(shadowMesh);

        // set the location of the integrity
        base.position.y = y - shape_config.grid_h / 2 + 0.5;
        base.position.x = x - shape_config.grid_w / 2 + 0.5;

        // remember the integrity of sphere and shadow
        groups.push(base);
        shadows.push(shadowMesh);
        objects.push(sphere);

        create_mesh_line(line_material, base.position.x, base.position.y);
    }

    // console.log(geometry_orbits)

    // 参数重置
    mov_para.step = 0;
    mov_para.dirX = 0;
    mov_para.dirY = 0;
    mov_para.frame = 0;
}

function model_generate() {
    let mod_name = agent_types[agent_id];
    var material = new MeshLineMaterial({ color: new THREE.Color(color_scheme.orbit_color), sizeAttenuation: true, lineWidth: 0.1, opacity: 0.7, transparent: true });
    for (let i = 0; i < shape_config.agent_num; i++) {
        let position = {
            x: poses_data[0][2 * i] - shape_config.grid_w / 2 + 0.5,
            y: poses_data[0][2 * i + 1] - shape_config.grid_h / 2 + 0.5,
            z: 0.01
        }
        GLB_LOAD.load_glb(i, mod_file[mod_name], scene, position, scale_config[mod_name], init_rotation[mod_name], animation_idx[mod_name]);

        create_mesh_line(material, position.x, position.y);
    }

    // 参数重置
    mov_para.step = 0;
    mov_para.dirX = 0;
    mov_para.dirY = 0;
    mov_para.frame = 0;
}
//===============================================================
function init() {
    // load data
    // total_step = (pose_line - 1) / 2;
    // console.assert(typeof total_step === 'number' && total_step % 1 === 0);

    // highlight the outline
    outline_grid();
    build_outline_wall();

    scene.background = new THREE.Color(color_scheme.background_color);
    camera = new THREE.PerspectiveCamera(75, (window.innerWidth - 2 * window_margin - right_block - left_block) / (window.innerHeight - 2 * window_margin - bottom_block), 0.1, 1000);

    console.log(window.innerHeight - 2 * window_margin, window.innerWidth - 2 * window_margin);
    renderer.setSize(window.innerWidth - 2 * window_margin - right_block - left_block, window.innerHeight - 2 * window_margin);
    renderer.sortObjects = false;
    document.getElementById("threeJS").appendChild(renderer.domElement);

    // viewpoint controller
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.5, 0);
    controls.update();
    controls.enablePan = false;
    controls.enableDamping = true;

    // light
    {
        const skyColor = 0xB1E1FF;  // light blue
        const groundColor = 0xB97A20;  // brownish orange
        const intensity = 2;
        const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        scene.add(light);
    }

    {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(0, 0, 10);
        light.target.position.set(-3, 0, 0);
        scene.add(light);
        scene.add(light.target);
    }

    // grid
    create_grid();

    // create agents
    sphere_generate();

    // a plane to show the grid pattern
    create_plane();

    // axis
    // var axesHelper = new THREE.AxesHelper(shape_config.grid_w);
    // scene.add(axesHelper);

    camera.position.z = shape_config.grid_w/1.4;
    camera.position.y = 0.8

    scene.translateY(0.8)
    line_scene.translateY(0.8)

    // 绘制描边效果
    composer = new EffectComposer(renderer);

    var renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
    composer.addPass(outlinePass);
    outlinePass_models = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
    outlinePass_models.depthMaterial.skinning = true;
    outlinePass_models.prepareMaskMaterial.skinning = true;
    composer.addPass(outlinePass_models);

    let effectFXAA = new ShaderPass(FXAAShader);
    effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
    composer.addPass(effectFXAA);

    // 将描边加入鼠标移动事件
    window.addEventListener('mousemove', onMouseMove, false);

    // controls.enabled = false;
    // 鼠标右键点击事件
    document.addEventListener('mousedown', onMouseUp, false);
    window.addEventListener('click', onClick, false);

    // 热力图
    htmap_r = new Heatmap({
        width: 380,
        height: 395,
        gridW: 80,
        gridH: 80,
        el: document.getElementById('heatmap_r'),
        title: 'red light intensity(*1000)',
        colorS: '#000000',
        colorE: '#f00',
        minVal: 0,
        maxVal: 10,
        tooltip: document.getElementById('tooltip_r'),
    })
    htmap_b = new Heatmap({
        width: 380,
        height: 395,
        gridW: 80,
        gridH: 80,
        el: document.getElementById('heatmap_b'),
        title: 'blue light intensity(*1000)',
        colorS: '#000000',
        colorE: '#0000ff',
        minVal: 0,
        maxVal: 10,
        tooltip: document.getElementById('tooltip_b'),
    })
    htmap_r.init();
    htmap_b.init();

    // 浏览器resize事件
    window.onresize = resize_window;

    // 使流程控制栏折叠功能生效
    // collapse_icons_init();
}

// resize事件函数
function resize_window() {
    camera.aspect = (window.innerWidth - 2 * window_margin - right_block - left_block) / (window.innerHeight - 2 * window_margin - bottom_block);
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth - 2 * window_margin - right_block - left_block, window.innerHeight - 2 * window_margin - bottom_block);
    composer.setSize(window.innerWidth - 2 * window_margin - right_block - left_block, window.innerHeight - 2 * window_margin - bottom_block);

    // adjust_icon_position();
}

// 左键点击事件
function onClick() {
    if (!hover_obj) return;
    mouse.x = ((event.clientX - window_margin) / (window.innerWidth - 2 * window_margin - right_block - left_block)) * 2 - 1;
    mouse.y = - ((event.clientY - window_margin) / (window.innerHeight - 2 * window_margin - bottom_block)) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObject(scene, true);

    if (intersects.length > 0) {
        for (let i = 0; i < intersects.length; i++) {
            var selectedObject = intersects[i].object;
            let agent_type = agent_types[agent_id];
            if (["slime", "man", "puppy"].includes(agent_type)) {
                while (selectedObject.parent && selectedObject.name !== "Root Scene") {
                    selectedObject = selectedObject.parent;
                }
            }
            if (hover_obj === selectedObject) return;
        }
    }

    if (["cube", "sphere"].includes(agent_types[agent_id])) {
        let idx = objects.indexOf(hover_obj);
        orbits[idx].visible = false;
    } else {
        let idx = GLB_LOAD.models.indexOf(hover_obj);
        orbits[idx].visible = false;
    }
    hover_obj = null;
    outlinePass.selectedObjects = [];
    outlinePass_models.selectedObjects = [];
}

// 右键agent可以显示/隐藏轨迹
function onMouseUp(e) {
    if (e.button == 0) {
        if (hover_obj) {
            if (["cube", "sphere"].includes(agent_types[agent_id])) {
                let idx = objects.indexOf(hover_obj);
                orbits[idx].visible = false;
            } else {
                let idx = GLB_LOAD.models.indexOf(hover_obj);
                orbits[idx].visible = false;
            }
        }
        hover_obj = null;
        outlinePass.selectedObjects = [];
        outlinePass_models.selectedObjects = [];
    }
    if (e.button != 2) return; // 右键点击
    mouse.x = ((event.clientX - window_margin) / (window.innerWidth - 2 * window_margin - right_block - left_block)) * 2 - 1;
    mouse.y = - ((event.clientY - window_margin) / (window.innerHeight - 2 * window_margin - bottom_block)) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObject(scene, true);
    var idx = -1;

    if (intersects.length > 0) {
        let agent_type = agent_types[agent_id];
        if (agent_type === "cube" || agent_type === "sphere") {
            for (let i = 0; i < intersects.length; i++) {
                var selectedObject = intersects[i].object;
                idx = objects.indexOf(selectedObject);
                console.log(idx)
                if (idx >= 0) {
                    let selected_idx = selected_obj.indexOf(selectedObject);
                    console.log(selected_obj)
                    if (selected_idx >= 0) {
                        selected_obj.splice(selected_idx, 1);
                        orbits[idx].visible = false;
                        console.log("a")
                    } else {
                        selected_obj.push(selectedObject);
                        orbits[idx].visible = true;
                        console.log("b")
                    }
                    outlinePass.selectedObjects = selected_obj;
                    break;
                }
            }
        } else if (["slime", "man", "puppy"].includes(agent_type)) { // models
            for (let i = 0; i < intersects.length; i++) {
                var selectedObject = intersects[i].object;
                while (selectedObject.parent && selectedObject.name !== "Root Scene") {
                    selectedObject = selectedObject.parent;
                }
                idx = GLB_LOAD.models.indexOf(selectedObject);
                if (idx >= 0) {
                    let selected_idx = selected_obj.indexOf(selectedObject);
                    if (selected_idx >= 0) {
                        selected_obj.splice(selected_idx, 1);
                        orbits[idx].visible = false;
                    } else {
                        selected_obj.push(selectedObject);
                        orbits[idx].visible = true;
                    }
                    outlinePass_models.selectedObjects = selected_obj;
                    break;
                }
            }
        }
    }
}

// 鼠标移动事件执行函数：判断是否在agent上停留
function onMouseMove(evt) {
    mouse.x = ((event.clientX - window_margin - left_block) / (window.innerWidth - 2 * window_margin - right_block - left_block)) * 2 - 1;
    mouse.y = - ((event.clientY - window_margin) / (window.innerHeight - 2 * window_margin - bottom_block)) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObject(scene, true);
    var idx = -1;

    if (intersects.length > 0) {
        // console.log(selectedObject)
        let agent_type = agent_types[agent_id];
        if (agent_type === "cube" || agent_type === "sphere") {
            for (let i = 0; i < intersects.length; i++) {
                var selectedObject = intersects[i].object;
                idx = objects.indexOf(selectedObject);
                if (selectedObject === hover_obj) break;
                if (idx >= 0) {
                    if (hover_obj !== null && !selected_obj.includes(hover_obj)) {
                        let obj_idx = objects.indexOf(hover_obj);
                        orbits[obj_idx].visible = false;
                        let outline_idx = outlinePass.selectedObjects.indexOf(hover_obj);
                        outlinePass.selectedObjects.splice(outline_idx, 1);
                    }
                    hover_obj = selectedObject;
                    outlinePass.selectedObjects.push(hover_obj);
                    orbits[idx].visible = true;
                    break;
                }
            }
        } else if (["slime", "man", "puppy"].includes(agent_type)) { // models
            for (let i = 0; i < intersects.length; i++) {
                var selectedObject = intersects[i].object;
                while (selectedObject.parent && selectedObject.name !== "Root Scene") {
                    selectedObject = selectedObject.parent;
                }
                idx = GLB_LOAD.models.indexOf(selectedObject);
                if (selectedObject === hover_obj) break;
                if (idx >= 0) {
                    if (hover_obj !== null && !selected_obj.includes(hover_obj)) {
                        let obj_idx = GLB_LOAD.models.indexOf(hover_obj);
                        orbits[obj_idx].visible = false;
                        let outline_idx = outlinePass.selectedObjects.indexOf(hover_obj);
                        outlinePass_models.selectedObjects.splice(outline_idx, 1);
                    }
                    hover_obj = selectedObject;
                    outlinePass_models.selectedObjects.push(hover_obj);
                    orbits[idx].visible = true;
                    break;
                }
            }
        }
    }

    hide_tooltip();
    if (paused && idx >= 0) {
        show_tooltip(event.clientX, event.clientY, idx);
    }
}

// 改变视角
function change_viewpoint() {
    vp_id = (vp_id + 1) % viewpoint.length;
    let cur_vp = new THREE.Spherical();
    cur_vp.setFromVector3(camera.position);
    var new_vp = new THREE.Spherical(cur_vp.radius, viewpoint[vp_id].phi, viewpoint[vp_id].theta);
    var vec3 = new THREE.Vector3();
    vec3.setFromSpherical(new_vp);
    camera.position.set(vec3.x, vec3.y, vec3.z);
}

// 悬停在agent上出现气泡
function show_tooltip(x, y, id) {
    var tooltip = document.getElementById("tooltip");
    let pose_x = poses_data[mov_para.step][2 * id], pose_y = poses_data[mov_para.step][2 * id + 1];
    tooltip.innerHTML = "agent " + id.toString() + ": " + pose_x.toString() + "," + pose_y.toString();
    tooltip.style.top = (y - 50) + "px";
    tooltip.style.left = (x - 20) + "px";
    tooltip.style.visibility = "visible";
}
// 隐藏气泡
function hide_tooltip() {
    var tooltip = document.getElementById("tooltip");
    tooltip.style.visibility = "hidden";
}

// 创建grid
function create_grid(color = color_scheme.grid_color) {
    if (grid) {
        scene.remove(grid);
    }
    grid = new THREE.GridHelper(shape_config.grid_w, shape_config.grid_w, color, color);
    grid.material.opacity = 1;
    grid.material.transparent = true;
    grid.material.polygonOffset = true;
    grid.material.polygonOffsetFactor = -0.1;
    grid.material.polygonOffsetUnits = -2;
    grid.rotateX(Math.PI / 2);
    scene.add(grid);
}

// 创建plane
function create_plane() {
    if (plane) {
        scene.remove(plane);
    }
    let geometry = new THREE.PlaneGeometry(shape_config.grid_w, shape_config.grid_h, shape_config.grid_w, shape_config.grid_h);
    let mats = [];
    let material = new THREE.MeshBasicMaterial({
        color: color_scheme.plane_color, side: THREE.DoubleSide
    }); // plane material
    mats.push(material);
    material = new THREE.MeshBasicMaterial({
        color: color_scheme.target_shape_color, side: THREE.DoubleSide
    }); // target material
    mats.push(material);
    plane = new THREE.Mesh(geometry, mats);
    for (let i = 0; i < geometry.faces.length; i++) {
        let _i = Math.floor(i / 2);
        let row = Math.floor(_i / shape_config.grid_w), col = _i % shape_config.grid_w;
        if (grid_data[row][col] == 0)
            geometry.faces[i].materialIndex = 0;
        else {
            geometry.faces[i].materialIndex = 1;
        }
    }
    scene.add(plane);
    geometry = new THREE.PlaneBufferGeometry(shape_config.grid_w, shape_config.grid_h, shape_config.grid_w, shape_config.grid_h);
}

// 重置grid场景，重置shape
function reset_shape() {
    clear_ALF();
    create_grid();
    create_plane();
    outline_grid();
    build_outline_wall();
    repaint_agent();
    camera.position.z = shape_config.grid_w/1.4;
}

// 重置agent（cube）
function reset() {
    mov_para.step = 0;
    for (let i = 0; i < shape_config.agent_num; i++) {
        let x = poses_data[0][2 * i], y = poses_data[0][2 * i + 1];
        objects[i].position.y = y - shape_config.grid_h / 2 + 0.5;
        objects[i].position.x = x - shape_config.grid_w / 2 + 0.5;
        objects[i].position.z = ori_height;

        // 重置轨迹
        geometry_orbits[i].vertices.length = 0;
        meshline_orbits[i].setGeometry(geometry_orbits[i]);
    }
    mov_para.dirX = 0;
    mov_para.dirY = 0;
    mov_para.frame = 0;
}

// 重置agent位置（sphere）
function reset_group() {
    mov_para.step = 0;
    for (let i = 0; i < shape_config.agent_num; i++) {
        let x = poses_data[0][2 * i], y = poses_data[0][2 * i + 1];
        groups[i].position.y = y - shape_config.grid_h / 2 + 0.5;
        groups[i].position.x = x - shape_config.grid_w / 2 + 0.5;
        objects[i].position.z = ori_height;

        // 重置轨迹
        geometry_orbits[i].vertices.length = 0;
        meshline_orbits[i].setGeometry(geometry_orbits[i]);
    }
    mov_para.dirX = 0;
    mov_para.dirY = 0;
    mov_para.frame = 0;
}

function reset_model() {
    mov_para.step = 0;
    for (let i = 0; i < shape_config.agent_num; i++) {
        let position = {
            x: poses_data[0][2 * i] - shape_config.grid_w / 2 + 0.5,
            y: poses_data[0][2 * i + 1] - shape_config.grid_h / 2 + 0.5,
            z: 0.01
        }
        GLB_LOAD.set_position(i, position);
        // GLB_LOAD.set_rotation(i, init_rotation.y);

        // 重置轨迹
        geometry_orbits[i].vertices.length = 0;
        meshline_orbits[i].setGeometry(geometry_orbits[i]);
    }
    mov_para.dirX = 0;
    mov_para.dirY = 0;
    mov_para.frame = 0;
}

// 清除所有agent（切换agent模型使用）
function clear_agents() {
    // 清除高亮
    outlinePass.selectedObjects = [];   

    if (groups.length) {
        for (let group of groups)
            scene.remove(group);
        groups.length = 0;
        objects.length = 0;
        shadows.length = 0;
        return;
    }

    for (let obj of objects) {
        scene.remove(obj);
    }
    objects.length = 0;

    for (let obj of shadows) {
        scene.remove(obj);
    }
    shadows.length = 0;
}
function clear_agents_model() {
    // 清除高亮
    outlinePass_models.selectedObjects = [];

    for (let model of GLB_LOAD.models) {
        scene.remove(model);
    }
    GLB_LOAD.clear_storage();
}

function add_vertice_to_line(idx, x, y) {
    let geo = geometry_orbits[idx];
    let line = meshline_orbits[idx];
    geo.vertices.push(new THREE.Vector3(x, y, 0.1));
    line.setGeometry(geo);

    // 更新轨迹object的结点
    orbits[idx].geometry = line.geometry;
}

function remove_vertice_in_line(idx) {
    let geo = geometry_orbits[idx];
    let line = meshline_orbits[idx];
    geo.vertices.pop();
    line.setGeometry(geo);

    // 更新轨迹object的结点
    orbits[idx].geometry = line.geometry;
}

function agent_move_cube() {
    if (mov_para.step >= total_step - 1) {
        mov_para.frame++;
        if (mov_para.frame === pause_frame) {
            // 前进到下一个形状
            if(goToNext){
                STORED_SHAPE_PAD.select_next_shape();
                reset_shape();
            }
            else
                reset();
        }
        return;
    }

    for (let i = 0; i < shape_config.agent_num; i++) {
        mov_para.dirX = poses_data[mov_para.step + 1][2 * i] - poses_data[mov_para.step][2 * i];
        mov_para.dirY = poses_data[mov_para.step + 1][2 * i + 1] - poses_data[mov_para.step][2 * i + 1];
        objects[i].position.x += mov_para.dirX * per_mov;
        objects[i].position.y += mov_para.dirY * per_mov;

        // 更新轨迹
        if (mov_para.frame === 0) {
            add_vertice_to_line(i, poses_data[mov_para.step][2 * i] - shape_config.grid_w / 2 + 0.5, poses_data[mov_para.step][2 * i + 1] - shape_config.grid_h / 2 + 0.5);
        }
    }
    mov_para.frame = (mov_para.frame + 1) % fp_mov;
    if (mov_para.frame === 0) {
        mov_para.step++;
    }
}

function agent_move_sphere() {
    if (mov_para.step >= total_step - 1) {
        mov_para.frame++;
        if (mov_para.frame === pause_frame) {
            // 前进到下一个形状
            if(goToNext){
                STORED_SHAPE_PAD.select_next_shape();
                reset_shape();
            }
            else
                reset_group();
        }
        return;
    }

    for (let i = 0; i < shape_config.agent_num; i++) {
        mov_para.dirX = poses_data[mov_para.step + 1][2 * i] - poses_data[mov_para.step][2 * i];
        mov_para.dirY = poses_data[mov_para.step + 1][2 * i + 1] - poses_data[mov_para.step][2 * i + 1];
        groups[i].position.x += mov_para.dirX * per_mov;
        groups[i].position.y += mov_para.dirY * per_mov;

        // 更新轨迹
        if (mov_para.frame === 0) {
            add_vertice_to_line(i, poses_data[mov_para.step][2 * i] - shape_config.grid_w / 2 + 0.5, poses_data[mov_para.step][2 * i + 1] - shape_config.grid_h / 2 + 0.5);
        }

        if (mov_para.dirX || mov_para.dirY) {
            let offset = Math.sin(Math.PI / fp_mov * mov_para.frame);
            objects[i].position.z = 1.5 * offset + ori_height;
            shadows[i].material.opacity = THREE.MathUtils.lerp(0.8, .15, offset);
        } else if (Math.abs(objects[i].position.z - ori_height) > Number.EPSILON) {
            objects[i].position.z = ori_height;
            shadows[i].material.opacity = 0.8;
        }
    }
    mov_para.frame = (mov_para.frame + 1) % fp_mov;
    if (mov_para.frame === 0) {
        mov_para.step++;
    }
}

function agent_move_model() {
    if (mov_para.step >= total_step - 1) {
        if (mov_para.frame) {
            for (let i = 0; i < shape_config.agent_num; i++) {
                if (GLB_LOAD.walks[i].isRunning()) {
                    GLB_LOAD.walks[i].stop();
                    let rot = dirX2rotation(0, -1);
                    GLB_LOAD.set_rotation(i, rot);
                    GLB_LOAD.mixers[i].setTime = 0;
                }
            }
        }
        mov_para.frame++;
        if (mov_para.frame === pause_frame) {
            // 前进到下一个形状
            if(goToNext){
                STORED_SHAPE_PAD.select_next_shape();
                reset_shape();
            }
            else
                reset_model();
        }
        return;
    }

    for (let i = 0; i < shape_config.agent_num; i++) {
        {
            mov_para.dirX = poses_data[mov_para.step + 1][2 * i] - poses_data[mov_para.step][2 * i];
            mov_para.dirY = poses_data[mov_para.step + 1][2 * i + 1] - poses_data[mov_para.step][2 * i + 1];
            if (mov_para.dirX || mov_para.dirY) {
                let final_rotation = dirX2rotation(mov_para.dirX, mov_para.dirY);
                GLB_LOAD.set_rotation(i, final_rotation);
                GLB_LOAD.models[i].position.x += mov_para.dirX * per_mov;
                GLB_LOAD.models[i].position.y += mov_para.dirY * per_mov;
                if (!GLB_LOAD.walks[i].isRunning()) {
                    GLB_LOAD.walks[i].play();
                }
            }
            else if (GLB_LOAD.walks[i].isRunning()) {
                GLB_LOAD.walks[i].stop();
                let rot = dirX2rotation(0, -1);
                GLB_LOAD.set_rotation(i, rot);
                GLB_LOAD.mixers[i].setTime = 0;
            }

            // 更新轨迹
            if (mov_para.frame === 0) {
                add_vertice_to_line(i, poses_data[mov_para.step][2 * i] - shape_config.grid_w / 2 + 0.5, poses_data[mov_para.step][2 * i + 1] - shape_config.grid_h / 2 + 0.5);
            }
        }
    }

    mov_para.frame = (mov_para.frame + 1) % fp_mov;
    if (mov_para.frame === 0) {
        mov_para.step++;
    }
}

function repaint_agent() {
    console.log("repaint")
    clear_orbits();
    clear_agents();
    clear_agents_model();
    agent_id = agent_types.indexOf(params.agent_type);
    if (params.agent_type === 'cube') {
        cube_generate();
    } else if (params.agent_type === 'sphere') {
        sphere_generate();
    } else {
        model_generate();
    }
}

// 清空所有的轨迹数据
function clear_orbits() {
    for (let obj of orbits) {
        line_scene.remove(obj);
    }

    orbits.length = 0;
    geometry_orbits.length = 0;
    meshline_orbits.length = 0;
    hover_obj = null;
}

let animate = function () {
    requestAnimationFrame(animate);
    if (!done && poses_data.length < mov_para.step + 2) {
        return;
    }

    controls.update();
    composer.render();
    renderer.clearDepth();
    renderer.render(line_scene, camera);

    if (paused) {
        return;
    }

    if (agent_id >= 2 && !GLB_LOAD.all_ready(shape_config.agent_num)) {
        console.log(agent_types[agent_id])
        return;
    }

    // update the speed of agents
    if (mov_para.frame === 0) {
        fp_mov = (13 - params.speed) * 10;
        per_mov = 1 / fp_mov;

        // 渲染热力图
        draw_ALF();
    }
    if (params.agent_type !== agent_types[agent_id]) {
        repaint_agent();
        return;
    }
    if (agent_types[agent_id] === 'cube')
        agent_move_cube();
    else if (agent_types[agent_id] === 'sphere')
        agent_move_sphere();
    else {
        agent_move_model();
    }

    if (agent_id >= 2) {
        GLB_LOAD.update_all(1 / fp_mov);
    }

};

animate();

function arrTrans(num, arr) {
    let len = arr.length;
    const newArr = [];
    for (let i = 0; i < len; i += num) {
        newArr.push(arr.slice(i, i + num));
    }
    return newArr;
}

// 自定义面板按钮事件
document.getElementById("apply").addEventListener("click", function () {
    // 检查用户定义的形状是否合法
    let valid = false;
    for (let node of CUSTOM_PAD.new_shape_data) {
        if (node === 1) {
            valid = true;
        }
    }
    if (!valid) {
        alert("Please draw a shape!");
        return;
    }
    grid_data = arrTrans(CUSTOM_PAD.width, CUSTOM_PAD.new_shape_data);
    console.log(grid_data)
    shape_config.grid_w = CUSTOM_PAD.width, shape_config.grid_h = CUSTOM_PAD.height;
    shape_config.shape_num = custom_shape_id;
    shape_config.agent_num = CUSTOM_PAD.agent_num;
    poses_data.length = 0;
    done = false;
    web_worker.postMessage({
        MessagePurpose: "getPoseData", width: shape_config.grid_w, height: shape_config.grid_h, shape_num: shape_config.shape_num,
        agent_num: shape_config.agent_num, grid_data: grid_data
    });
    CUSTOM_PAD.hide_custom_shape_popup();
    goToNext = false;
})

// 上传图片面板apply按钮事件
document.getElementById("img_apply").addEventListener("click", function () {
    let size = document.getElementById("image_grid_size").value;
    size = parseInt(size);

    let file_uploader = document.getElementById("file_uploader");
    let file = file_uploader.files[0];
    if (!file) {
        alert("Please select a .png file!");
        return;
    }
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (e) {
        let url = e.target.result;
        let image = new Image();
        image.src = url;
        let grid;
        image.onload = function () {
            let obj = generateGrid(image, size, size);
            grid_data = obj.grid;
            shape_config.agent_num = obj.agent_num;
            shape_config.grid_w = size, shape_config.grid_h = size;
            shape_config.shape_num = custom_shape_id;
            poses_data.length = 0;
            done = false;
            web_worker.postMessage({
                MessagePurpose: "getPoseData", width: shape_config.grid_w, height: shape_config.grid_h, shape_num: shape_config.shape_num,
                agent_num: shape_config.agent_num, grid_data: grid_data
            });
            CUSTOM_PAD.hide_image_upload_popup();
            goToNext = false;
        };
    }
});

function set_stored_shape(){
    goToNext = true;

    let radios = document.getElementsByName("grid_size");
    let has_checked = null; // 选中的规模
    for (let i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            has_checked = radios[i].id;
        }
    }
    // 检查是否选中一种grid规模
    // if (!has_checked) {
    //     alert("Please set the grid size!");
    //     return;
    // } else {
    //     STORED_SHAPE_PAD.hide_stored_shape();
    // }


    let stored_shape_obj = stored_para[STORED_SHAPE_PAD.selected_shape];
    // 查找规模索引
    let idx = -1;
    let size_mat = has_checked.split(',');
    for (let size_obj of stored_shape_obj.sizes) {
        idx++;
        if (size_obj.width === parseInt(size_mat[0]) && size_obj.height === parseInt(size_mat[1]))
            break;
    }
    var parse_size = [parseInt(size_mat[0]), parseInt(size_mat[1])];
    shape_config.file_path = data_file_path_generate(stored_para[STORED_SHAPE_PAD.selected_shape].sizes[idx].grid_file, parse_size);
    let obj = parse_grid(shape_config.file_path);
    shape_config.grid_w = obj.grid_w, shape_config.grid_h = obj.grid_h;
    grid_data = obj.content;
    shape_config.shape_num = obj.shape_num;
    shape_config.agent_num = obj.a_num;

    poses_data.length = 0;
    done = false;
    let pose_file = data_file_path_generate(stored_para[STORED_SHAPE_PAD.selected_shape].sizes[idx].pose_file, parse_size)
    let { len, res } = parse_poses(pose_file);
    total_step = len;
    poses_data = res;
    reset_shape();
    done = true;
}

// 选择已有形状按钮事件
document.getElementById("stored_shape_apply").addEventListener("click", set_stored_shape);

function data_file_path_generate(file, size) {
    return "../data/" + size[0] + "_" + size[1] + "/" + file;
}

// 阻止用户在暂停时改变shape、动画参数等
function blockEvent(event) {
    event.stopPropagation();
}

// 按下暂停按钮
document.getElementById("pause").addEventListener("click", function () {
    if (paused === false) {
        // 显示热力图
        draw_ALF();
        right_block = 400;
        resize_window();
        document.getElementById("heatmap_r").style.display = "block";
        document.getElementById("heatmap_b").style.display = "block";

        this.src = "img/icon/start.png";
        paused = true;
        document.getElementById("last_step").className = "image_btn";
        document.getElementById("next_step").className = "image_btn";
        for (let ele in GUI_domElement) {
            let obj = GUI_domElement[ele];
            obj.domElement.style.pointerEvents = "none";
            obj.domElement.style.opacity = .5;
        }
        for (let ele in GUI_functions) {
            let obj = GUI_functions[ele];
            obj.domElement.addEventListener("click", blockEvent, true);
        }

        // 使grid清晰化
        create_grid(0xffffff);
    } else {
        // 隐藏热力图
        // document.getElementById("heatmap_r").style.display = "none";
        // document.getElementById("heatmap_b").style.display = "none";
        right_block = 400;
        resize_window();

        this.src = "img/icon/pause.png";
        paused = false;
        document.getElementById("last_step").className = "image_btn_inactive";
        document.getElementById("next_step").className = "image_btn_inactive";
        for (let ele in GUI_domElement) {
            let obj = GUI_domElement[ele];
            obj.domElement.style.pointerEvents = "auto";
            obj.domElement.style.opacity = 1;
        }
        for (let ele in GUI_functions) {
            let obj = GUI_functions[ele];
            obj.domElement.removeEventListener("click", blockEvent, true);
        }

        // 使grid淡化
        create_grid(0xD5D5E0);
    }

    // adjust_icon_position();

})

// 按下上一步按钮
document.getElementById("last_step").addEventListener("click", function () {
    if (paused === false) return;
    if (mov_para.step === 0 && mov_para.frame === 0) return;// 已经到第一帧，直接返回
    let slice = fp_mov / slipt_of_step;
    let slipt_step = Math.floor(mov_para.frame / slice);
    if (slipt_step * slice === mov_para.frame)
        slipt_step -= 1;
    let minus = mov_para.frame - slipt_step * slice;
    if (slipt_step < 0) {
        for (let i = 0; i < shape_config.agent_num; i++) {
            remove_vertice_in_line(i);
        }
        slipt_step += slipt_of_step;
        mov_para.step--;
    }
    mov_para.frame = slipt_step * slice;
    step_change_helper(slipt_step, minus);

    // 将mov_para设置为对应的正确值
    if (mov_para.step >= total_step - 1 || mov_para.step < 0) {
        if (mov_para.step < 0) {
            mov_para.step = 0;
            mov_para.frame = 0;
        } else {
            mov_para.step = total_step - 1;
            mov_para.frame = 0;
        }
    }
    draw_ALF();
})

// 按下下一步按钮
document.getElementById("next_step").addEventListener("click", function () {
    if (paused === false) return;
    if (mov_para.step >= total_step - 1 && mov_para.frame === 0) return;// 已经到最后一帧，直接返回
    let slice = fp_mov / slipt_of_step;
    let slipt_step = Math.ceil(mov_para.frame / slice);
    if (slipt_step * slice === mov_para.frame)
        slipt_step += 1;
    let minus = mov_para.frame - slipt_step * slice;
    if (slipt_step >= slipt_of_step) {
        slipt_step -= slipt_of_step;
        mov_para.step++;
        for (let i = 0; i < shape_config.agent_num; i++) {
            add_vertice_to_line(i, parseFloat(poses_data[mov_para.step][2 * i]) - shape_config.grid_w / 2 + 0.5, parseFloat(poses_data[mov_para.step][2 * i + 1]) - shape_config.grid_h / 2 + 0.5);
        }
    }
    mov_para.frame = slipt_step * slice;
    step_change_helper(slipt_step, minus);

    // 将mov_para设置为对应的正确值
    if (mov_para.step >= total_step - 1 || mov_para.step < 0) {
        if (mov_para.step < 0) {
            mov_para.step = 0;
            mov_para.frame = 0;
        } else {
            mov_para.step = total_step - 1;
            mov_para.frame = 0;
        }
    }

    draw_ALF();
})

function step_change_helper(slipt_step, minus) {
    let step;
    // 边界条件处理
    if (mov_para.step >= total_step - 1 || mov_para.step < 0) {
        if (mov_para.step < 0) step = 0;
        else step = mov_para.step;
    }
    for (let i = 0; i < shape_config.agent_num; i++) {
        if (mov_para.step >= total_step - 1 || mov_para.step < 0) { // 边界条件处理
            if (agent_types[agent_id] === "cube") {
                objects[i].position.x = parseFloat(poses_data[step][2 * i]) - shape_config.grid_w / 2 + 0.5;
                objects[i].position.y = parseFloat(poses_data[step][2 * i + 1]) - shape_config.grid_h / 2 + 0.5;
            } else if (agent_types[agent_id] === "sphere") {
                groups[i].position.x = parseFloat(poses_data[step][2 * i]) - shape_config.grid_w / 2 + 0.5;
                groups[i].position.y = parseFloat(poses_data[step][2 * i + 1]) - shape_config.grid_h / 2 + 0.5;
                if (objects[i].position.z) {
                    objects[i].position.z = ori_height;
                    shadows[i].material.opacity = 0.8;
                }
            } else {
                GLB_LOAD.models[i].position.x = parseFloat(poses_data[step][2 * i]) - shape_config.grid_w / 2 + 0.5;
                GLB_LOAD.models[i].position.y = parseFloat(poses_data[step][2 * i + 1]) - shape_config.grid_h / 2 + 0.5;
                GLB_LOAD.set_rotation(i, dirX2rotation(0, -1));
                GLB_LOAD.mixers[i].setTime = 0;
            }
            continue;
        }
        mov_para.dirX = poses_data[mov_para.step + 1][2 * i] - poses_data[mov_para.step][2 * i];
        mov_para.dirY = poses_data[mov_para.step + 1][2 * i + 1] - poses_data[mov_para.step][2 * i + 1];
        if (agent_types[agent_id] === "cube") {
            objects[i].position.x = (poses_data[mov_para.step + 1][2 * i] - poses_data[mov_para.step][2 * i]) * slipt_step / slipt_of_step +
                parseFloat(poses_data[mov_para.step][2 * i]) - shape_config.grid_w / 2 + 0.5;
            objects[i].position.y = (poses_data[mov_para.step + 1][2 * i + 1] - poses_data[mov_para.step][2 * i + 1]) * slipt_step / slipt_of_step +
                parseFloat(poses_data[mov_para.step][2 * i + 1]) - shape_config.grid_h / 2 + 0.5;
        } else if (agent_types[agent_id] === "sphere") {
            groups[i].position.x = (poses_data[mov_para.step + 1][2 * i] - poses_data[mov_para.step][2 * i]) * slipt_step / slipt_of_step +
                parseFloat(poses_data[mov_para.step][2 * i]) - shape_config.grid_w / 2 + 0.5;
            groups[i].position.y = (poses_data[mov_para.step + 1][2 * i + 1] - poses_data[mov_para.step][2 * i + 1]) * slipt_step / slipt_of_step +
                parseFloat(poses_data[mov_para.step][2 * i + 1]) - shape_config.grid_h / 2 + 0.5;
            if (mov_para.dirX || mov_para.dirY) {
                let offset = Math.sin(Math.PI / fp_mov * mov_para.frame);
                objects[i].position.z = 1.5 * offset + ori_height;
                shadows[i].material.opacity = THREE.MathUtils.lerp(0.8, .15, offset);
            } else if (Math.abs(objects[i].position.z - ori_height) > Number.EPSILON) { // 如果这一步object没动，那么它必定在平面上
                objects[i].position.z = ori_height;
                shadows[i].material.opacity = 0.8;
            }
        } else {
            GLB_LOAD.models[i].position.x = (poses_data[mov_para.step + 1][2 * i] - poses_data[mov_para.step][2 * i]) * slipt_step / slipt_of_step +
                parseFloat(poses_data[mov_para.step][2 * i]) - shape_config.grid_w / 2 + 0.5;
            GLB_LOAD.models[i].position.y = (poses_data[mov_para.step + 1][2 * i + 1] - poses_data[mov_para.step][2 * i + 1]) * slipt_step / slipt_of_step +
                parseFloat(poses_data[mov_para.step][2 * i + 1]) - shape_config.grid_h / 2 + 0.5;
            if (mov_para.dirX || mov_para.dirY) {
                GLB_LOAD.set_rotation(i, dirX2rotation(mov_para.dirX, mov_para.dirY));
                GLB_LOAD.mixers[i].update(-minus / fp_mov);
            } else {
                GLB_LOAD.set_rotation(i, dirX2rotation(0, -1));
                GLB_LOAD.mixers[i].setTime = 0;
            }
        }
    }
}

// function adjust_icon_position() {
//     let width = window.innerWidth - 2 * window_margin - right_block - left_block;
//     let margin_left = window_margin + width / 2 - 100;
//     document.getElementById("last_step").style.marginLeft = margin_left + "px";
// }

// function collapse_icons_init() {
//     var coll = document.getElementById("collapse_btn");
//     coll.addEventListener("click", function () {
//         this.classList.toggle("active");
//         var content = document.getElementById("float_nav");
//         if (content.style.maxWidth) {
//             content.style.maxWidth = null;
//         } else {
//             content.style.maxWidth = 200 + "px";
//         }
//     })
// }

// 绘制热力图
function draw_ALF() {
    let heat_data = calculate_lf(grid_data, poses_data[mov_para.step], mov_para.step, shape_config.agent_num);
    draw_heat_map_completed = false;

    htmap_r.updateData(heat_data.res_r);
    htmap_b.updateData(heat_data.res_b);

    // drawHeatMap("heatmap_r", heat_data.res_r, shape_config.grid_w, shape_config.grid_h);
    // drawHeatMap("heatmap_b", heat_data.res_b, shape_config.grid_w, shape_config.grid_h);
}