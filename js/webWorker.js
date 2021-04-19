importScripts('../js/main.js')
let a_num = 0;

if (self.name === 'mainWorker') {
    onmessage = function (evt) {
        // If we've been asked to call the module's Add method then...
        var objData = evt.data;
        var sMessagePurpose = objData.MessagePurpose;
        var genFromCur = objData.genFromCur;

        if (sMessagePurpose === "SetUp") {
            // Call the add method in the WebAssembly module and pass the result back to the main thread
            console.log("set up!");
            Module.onRuntimeInitialized = function () {
                self.postMessage({ cmd: "ready" });
            }
        } else if (sMessagePurpose === "getPoseData") {
            let width = objData.width, height = objData.height;
            let shape_num = objData.shape_num;
            let agent_num = objData.agent_num;
            let grid_data = objData.grid_data;
            let init_poses_data = null;
            let init_ac_tar = agent_num;
            let init_mv_agent = 0;
            if(genFromCur){
                init_poses_data = objData.poses_data;
                // init_ac_tar = objData.ac_tar;
                // init_mv_agent = objData.mv_agent;
                for(let i=0; i<init_poses_data.length;i+=2){
                    let x = init_poses_data[i], y = init_poses_data[i+1];
                    if(grid_data[height-y-1][x]==1){
                        init_ac_tar--;
                    }
                }
            }

            // poses
            let poses_array = null;
            if(genFromCur){
                poses_array = new Int32Array(init_poses_data);
            }else{
                poses_array = new Int32Array(2 * agent_num);
            }
            let poses = Module._malloc(poses_array.length * poses_array.BYTES_PER_ELEMENT);
            Module.HEAP32.set(poses_array, poses >> 2);
            // minor termi
            let minor_termi_array = new Int32Array([0]);
            let minor_termi = Module._malloc(minor_termi_array.length * minor_termi_array.BYTES_PER_ELEMENT);
            Module.HEAP32.set(minor_termi_array, minor_termi >> 2);
            // ac_tar
            let ac_tar_array = new Int32Array([init_ac_tar]);
            let ac_tar = Module._malloc(ac_tar_array.length * ac_tar_array.BYTES_PER_ELEMENT);
            Module.HEAP32.set(ac_tar_array, ac_tar >> 2);
            // mv_agent
            let mv_agent_array = new Int32Array([init_mv_agent]);
            let mv_agent = Module._malloc(mv_agent_array.length * mv_agent_array.BYTES_PER_ELEMENT);
            Module.HEAP32.set(mv_agent_array, mv_agent >> 2);
            // init_poses
            let init_poses_array = new Int32Array(agent_num * 2);
            let init_poses = Module._malloc(init_poses_array.length * init_poses_array.BYTES_PER_ELEMENT);
            Module.HEAP32.set(init_poses_array, init_poses >> 2);
            // grids data
            let grid_data_flat = grid_data.flat();
            let grid_array = new Int32Array(grid_data_flat);
            let grid = Module._malloc(grid_array.length * grid_array.BYTES_PER_ELEMENT);
            Module.HEAP32.set(grid_array, grid >> 2);

            // loop
            let termi = 1;
            let res = 0
            let out_poses = [], out_init_poses = [];
            if (!genFromCur){
                res = _oneStep(termi, minor_termi, width, height, shape_num, agent_num, grid, poses, ac_tar, mv_agent, init_poses, true);
                termi++;
                for (let i = 0; i < agent_num * 2; i++) {
                    out_poses.push(Module.HEAP32[poses / Int32Array.BYTES_PER_ELEMENT + i]);
                    out_init_poses.push(Module.HEAP32[init_poses / Int32Array.BYTES_PER_ELEMENT + i]);
                }
                self.postMessage({ cmd: "poseData", data: out_init_poses, step: 0 });
                self.postMessage({ cmd: "poseData", data: out_poses, step: 1 });
            }
            while (res == 0) {
                res = _oneStep(termi, minor_termi, width, height, shape_num, agent_num, grid, poses, ac_tar, mv_agent, null, false);
                termi++;

                out_poses = [];
                for (let i = 0; i < agent_num * 2; i++) {
                    out_poses.push(Module.HEAP32[poses / Int32Array.BYTES_PER_ELEMENT + i]);
                }
                self.postMessage({ cmd: "poseData", data: out_poses, step: termi - 1 });
            }
            self.postMessage({ cmd: "done" });
        }
    }
}
