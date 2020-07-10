"use strict"

import * as THREE from './three.js-master/build/three.module.js';
import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js';
import { parse_grid, parse_poses } from './parse-module.js';

// test wasm
// async function fetchAndInstantiate() {
//     const response = await fetch("hello.wasm");
//     const buffer = await response.arrayBuffer();
//     const obj = await WebAssembly.instantiate(buffer, undefined);
//     console.log(obj.instance.exports.hello());  // "3"
// }
// fetchAndInstantiate();
// WebAssembly.instantiateStreaming(fetch('hello.wasm'))
//       .then(obj => {
//         var tbl = obj.instance.exports.hello;
//         console.log(hello());  // 13
//       });
Module.onRuntimeInitialized = () => { _hello(); }

// config
let agent_types = ["cube", "sphere"];
let agent_id = 0;
let fp_mov = 60;
let pause_frame = 60;
let per_mov = 1 / fp_mov;
let objects = [];
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

// global
let scene = new THREE.Scene();
let renderer = new THREE.WebGLRenderer();
let controls = null;
let grid = null;
let camera = null;

let agents_num = 0;
let total_step = 0; // steps of iteration
let grid_w = 0, grid_h = 0; // size of grid
let horizon_line = [], vertical_line = [];

// load data
let { i: grid_line, content: grid_data } = parse_grid('./data/grid_2_43.txt');
let { i: pose_line, content: poses_data } = parse_poses('./data/poses_2_43.txt');

init();

// compute the shape of pattern to draw the outline
function outline_grid() {
    let last_up = -1, last_down = -1, start_node = -1, cur_node = -1, cur_up = -1, cur_down = -1;
    for (let i = 1; i < grid_h; i++) {
        for (let j = 0; j < grid_w; j++) {
            cur_up = grid_data[i - 1][j], cur_down = grid_data[i][j];
            if (cur_up === last_up && cur_down === last_down) {
                cur_node = j + 1;
                continue;
            }
            if (last_up !== last_down)
                horizon_line.push([i, start_node, cur_node]);
            if (cur_up !== cur_down) {
                start_node = j;
                cur_node = j + 1;
            }
            last_up = cur_up, last_down = cur_down;
        }
        last_up = -1, last_down = -1, start_node = -1, cur_node = -1;
    }
    for (let i = 1; i < grid_w; i++) {
        for (let j = 0; j < grid_h; j++) {
            cur_up = grid_data[j][i - 1], cur_down = grid_data[j][i];
            if (cur_up === last_up && cur_down === last_down) {
                cur_node = j + 1;
                continue;
            }
            if (last_up !== last_down)
                vertical_line.push([i, start_node, cur_node]);
            if (cur_up !== cur_down) {
                start_node = j;
                cur_node = j + 1;
            }
            last_up = cur_up, last_down = cur_down;
        }
        last_up = -1, last_down = -1, start_node = -1, cur_node = -1;
    }
}

// add the outline to the scene
function build_outline_wall() {
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
                value: new THREE.Color(0x669999)
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
        let row = grid_h / 2 - line[0], start_node = line[1] - grid_w / 2, end_node = line[2] - grid_w / 2;
        let geometry = new THREE.PlaneGeometry(end_node - start_node, outline_h);
        let mesh = new THREE.Mesh(geometry, materialY);
        mesh.position.x = (start_node + end_node) / 2;
        mesh.position.y = row;
        mesh.position.z = outline_h/2;
        mesh.rotateX(Math.PI/2);
        scene.add(mesh);
    }
    let materialX = new THREE.ShaderMaterial({
        uniforms: {
            color1: {
                value: new THREE.Color(0x669999)
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
        let col = line[0] - grid_w/2, end_node = grid_w / 2 - line[1], start_node = grid_w / 2 - line[2];
        let geometry = new THREE.PlaneGeometry(outline_h, end_node - start_node);
        let mesh = new THREE.Mesh(geometry, materialX);
        mesh.position.y = (start_node + end_node) / 2;
        mesh.position.x = col;
        mesh.position.z = outline_h/2;
        mesh.rotateY(Math.PI/2);
        scene.add(mesh);
    }
}

function cube_generate() {
    // a cube
    let material = new THREE.MeshBasicMaterial({
        color: 0xfc2701, polygonOffset: true,
        polygonOffsetFactor: 0.1,
        polygonOffsetUnits: 2
    });
    for (let i = 0; i < agents_num; i++) {
        let geometry = new THREE.BoxGeometry(1, 1, 1);
        let cube = new THREE.Mesh(geometry, material);
        let [x, y] = poses_data[2][i];
        cube.position.y = y - grid_h / 2 + 0.5;
        cube.position.x = x - grid_w / 2 + 0.5;
        cube.position.z = 0.5;
        scene.add(cube);
        objects.push(cube);
    }
}

function sphere_generate() {
    let material = new THREE.MeshBasicMaterial({
        color: 0xfc2701, polygonOffset: true,
        polygonOffsetFactor: 0.1,
        polygonOffsetUnits: 2
    });
    for (let i = 0; i < agents_num; i++) {
        let geometry = new THREE.SphereBufferGeometry(sphere_r, 32, 32);
        let sphere = new THREE.Mesh(geometry, material);
        let [x, y] = poses_data[2][i];
        sphere.position.y = y - grid_h / 2 + 0.5;
        sphere.position.x = x - grid_w / 2 + 0.5;
        sphere.position.z = 0.5;
        scene.add(sphere);
        objects.push(sphere);
        bounce_height.push(Math.random() * 5 + 2);
    }
}

function init() {
    // load data
    agents_num = poses_data[0][3];
    grid_w = grid_line, grid_h = grid_line;
    total_step = (pose_line - 1) / 2;
    console.assert(typeof total_step === 'number' && total_step % 1 === 0);

    // highlight the outline
    outline_grid();
    console.log(horizon_line);
    console.log(vertical_line);
    build_outline_wall();

    scene.background = new THREE.Color(0xe0e0e0);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.sortObjects = false;
    document.body.appendChild(renderer.domElement);

    // viewpoint controller
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.5, 0);
    controls.update();
    controls.enablePan = false;
    controls.enableDamping = true;

    // grid
    grid = new THREE.GridHelper(grid_line, grid_line, 0xf9fbe9, 0xf9fbe9);
    grid.material.opacity = 1;
    grid.material.transparent = true;
    grid.material.polygonOffset = true;
    grid.material.polygonOffsetFactor = -0.1;
    grid.material.polygonOffsetUnits = -2;
    grid.rotateX(Math.PI / 2);
    scene.add(grid);

    // create agents
    sphere_generate();

    // a plane to show the grid pattern
    let geometry = new THREE.PlaneGeometry(grid_line, grid_line, grid_line, grid_line);
    let mats = [];
    let material = new THREE.MeshBasicMaterial({
        color: 0xcae5fe, side: THREE.DoubleSide
    });
    mats.push(material);
    material = new THREE.MeshBasicMaterial({
        color: 0xffffff, side: THREE.DoubleSide
    });
    mats.push(material);
    let plane = new THREE.Mesh(geometry, mats);
    console.log(geometry);
    for (let i = 0; i < geometry.faces.length; i++) {
        let _i = Math.floor(i / 2);
        let row = Math.floor(_i / grid_h), col = _i % grid_w;
        if (grid_data[row][col] == 0)
            geometry.faces[i].materialIndex = 0;
        else {
            geometry.faces[i].materialIndex = 1;
        }
    }
    scene.add(plane);
    geometry = new THREE.PlaneBufferGeometry(grid_line, grid_line, grid_line, grid_line);
    console.log(geometry);

    // axis
    var axesHelper = new THREE.AxesHelper(grid_line);
    scene.add(axesHelper);

    camera.position.z = 60;

    window.onresize = function () {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

    };
}

function reset() {
    mov_para.step = 0;
    for (let i = 0; i < agents_num; i++) {
        let [x, y] = poses_data[2][i];
        objects[i].position.y = y - grid_h / 2 + 0.5;
        objects[i].position.x = x - grid_w / 2 + 0.5;
        objects[i].position.z = ori_height;
    }
    mov_para.dirX = 0;
    mov_para.dirY = 0;
    mov_para.frame = 0;
}

function agent_move_cube() {
    if (mov_para.step >= total_step - 1) {
        mov_para.frame++;
        if (mov_para.frame === pause_frame) {
            reset();
        }
        return;
    }

    for (let i = 0; i < agents_num; i++) {
        mov_para.dirX = poses_data[mov_para.step * 2 + 4][i][0] - poses_data[mov_para.step * 2 + 2][i][0];
        mov_para.dirY = poses_data[mov_para.step * 2 + 4][i][1] - poses_data[mov_para.step * 2 + 2][i][1];
        objects[i].position.x += mov_para.dirX * per_mov;
        objects[i].position.y += mov_para.dirY * per_mov;
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
            reset();
        }
        return;
    }

    for (let i = 0; i < agents_num; i++) {
        mov_para.dirX = poses_data[mov_para.step * 2 + 4][i][0] - poses_data[mov_para.step * 2 + 2][i][0];
        mov_para.dirY = poses_data[mov_para.step * 2 + 4][i][1] - poses_data[mov_para.step * 2 + 2][i][1];
        objects[i].position.x += mov_para.dirX * per_mov;
        objects[i].position.y += mov_para.dirY * per_mov;
        if (mov_para.dirX || mov_para.dirY)
            objects[i].position.z = 1.5 * Math.sin(Math.PI / fp_mov * mov_para.frame) + ori_height;
    }
    mov_para.frame = (mov_para.frame + 1) % fp_mov;
    if (mov_para.frame === 0) {
        mov_para.step++;
    }
}

let animate = function () {
    requestAnimationFrame(animate);

    agent_move_sphere();
    controls.update();

    renderer.render(scene, camera);
};

animate();