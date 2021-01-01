"use strict"

let stored_para = [
    {
        shape_name: "dolphin1",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_dolphin1_657.txt",
                pose_file: "poses_0_0_80_80_dolphin1_69_657.txt"
            },
        ]
    },
    {
        shape_name: "gear",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_gear_1585.txt",
                pose_file: "poses_0_9_80_80_gear_107_1585.txt"
            },
        ]
    },
    {
        shape_name: "dolphin2",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_dolphin2_1118.txt",
                pose_file: "poses_0_23_80_80_dolphin2_75_1118.txt"
            },
        ]
    },
    {
        shape_name: "scissor",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_scissor_907.txt",
                pose_file: "poses_0_20_80_80_scissor_144_907.txt"
            },
            {
                width: 18,
                height: 18,
                grid_file: "grid_scissor_44.txt",
                pose_file: "poses_0_20_18_18_scissor_44.txt"
            },
            {
                width: 48,
                height: 48,
                grid_file: "grid_scissor_319.txt",
                pose_file: "poses_0_24_48_48_scissor_319.txt"
            },
            {
                width: 125,
                height: 125,
                grid_file: "grid_scissor_2243.txt",
                pose_file: "poses_0_1_125_125_scissor_2243.txt"
            },
            {
                width: 155,
                height: 155,
                grid_file: "grid_scissor_3464.txt",
                pose_file: "poses_0_4_155_155_scissor_3464.txt"
            },
            {
                width: 180,
                height: 180,
                grid_file: "grid_scissor_4701.txt",
                pose_file: "poses_0_9_180_180_scissor_4701.txt"
            },
        ]
    },
    {
        shape_name: "jeep",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_jeep_1217.txt",
                pose_file: "poses_0_1_80_80_jeep_146_1217.txt"
            },
        ]
    },
    {
        shape_name: "dog2",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_dog2_1128.txt",
                pose_file: "poses_0_12_80_80_dog2_70_1128.txt"
            },
        ]
    },
    {
        shape_name: "gong-bank",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_gong-bank_1722.txt",
                pose_file: "poses_0_5_80_80_gong-bank_3_1722.txt"
            },
        ]
    },
    {
        shape_name: "dog1",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_dog1_1151.txt",
                pose_file: "poses_0_19_80_80_dog1_73_1151.txt"
            },
        ]
    },
    {
        shape_name: "letter-b",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_letter-b_2015.txt",
                pose_file: "poses_0_17_80_80_letter-b_97_2015.txt"
            },
        ]
    },
    {
        shape_name: "locomotive",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_locomotive_1785.txt",
                pose_file: "poses_0_4_80_80_locomotive_9_1785.txt"
            },
        ]
    },
    {
        shape_name: "num4",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_num4_1090.txt",
                pose_file: "poses_0_22_80_80_num4_103_1090.txt"
            },
        ]
    },
    {
        shape_name: "num5",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_num5_1268.txt",
                pose_file: "poses_0_21_80_80_num5_57_1268.txt"
            },
        ]
    },
    {
        shape_name: "letter-c",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_letter-c_1383.txt",
                pose_file: "poses_0_1_80_80_letter-c_50_1383.txt"
            },
        ]
    },
    {
        shape_name: "letter-a",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_letter-a_1385.txt",
                pose_file: "poses_0_0_80_80_letter-a_101_1385.txt"
            },
        ]
    },
    {
        shape_name: "train-roadsign",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_train-roadsign_1418.txt",
                pose_file: "poses_0_19_80_80_train-roadsign_131_1418.txt"
            },
        ]
    },
    {
        shape_name: "num7",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_num7_891.txt",
                pose_file: "poses_0_1_80_80_num7_56_891.txt"
            },
        ]
    },
    {
        shape_name: "cat2",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_cat2_1051.txt",
                pose_file: "poses_0_8_80_80_cat2_147_1051.txt"
            },
        ]
    },
    {
        shape_name: "cat3",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_cat3_1033.txt",
                pose_file: "poses_0_9_80_80_cat3_134_1033.txt"
            },
        ]
    },
    {
        shape_name: "bird",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_bird_1133.txt",
                pose_file: "poses_0_6_80_80_bird_135_1133.txt"
            },
        ]
    },
    {
        shape_name: "num6",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_num6_1362.txt",
                pose_file: "poses_0_10_80_80_num6_102_1362.txt"
            },
        ]
    },
    {
        shape_name: "letter-d",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_letter-d_2017.txt",
                pose_file: "poses_0_12_80_80_letter-d_98_2017.txt"
            },
        ]
    },
    {
        shape_name: "num2",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_num2_1212.txt",
                pose_file: "poses_0_11_80_80_num2_55_1212.txt"
            },
        ]
    },
    {
        shape_name: "3-holes",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_3-holes_1670.txt",
                pose_file: "poses_0_12_80_80_3-holes_4_1670.txt"
            },
        ]
    },
    {
        shape_name: "num3",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_num3_1138.txt",
                pose_file: "poses_0_8_80_80_num3_54_1138.txt"
            },
        ]
    },
    {
        shape_name: "face",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_face_1296.txt",
                pose_file: "poses_0_15_80_80_face_60_1296.txt"
            },
        ]
    },
    {
        shape_name: "letter-e",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_letter-e_1681.txt",
                pose_file: "poses_0_20_80_80_letter-e_31_1681.txt"
            },
        ]
    },
    {
        shape_name: "letter-g",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_letter-g_2008.txt",
                pose_file: "poses_0_0_80_80_letter-g_49_2008.txt"
            },
        ]
    },
    {
        shape_name: "num1",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_num1_730.txt",
                pose_file: "poses_0_3_80_80_num1_58_730.txt"
            },
        ]
    },
    {
        shape_name: "num0",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_num0_1256.txt",
                pose_file: "poses_0_5_80_80_num0_86_1256.txt"
            },
        ]
    },
    {
        shape_name: "letter-f",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_letter-f_1292.txt",
                pose_file: "poses_0_21_80_80_letter-f_41_1292.txt"
            },
        ]
    },
    {
        shape_name: "4-curves",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_4-curves_1316.txt",
                pose_file: "poses_0_15_80_80_4-curves_2_1316.txt"
            },
        ]
    },
    {
        shape_name: "cat",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_cat_923.txt",
                pose_file: "poses_0_10_80_80_cat_67_923.txt"
            },
        ]
    },
    {
        shape_name: "r-6-edge",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_r-6-edge_1592.txt",
                pose_file: "poses_0_19_80_80_r-6-edge_5_1592.txt"
            },
        ]
    },
    {
        shape_name: "train2",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_train2_1202.txt",
                pose_file: "poses_0_8_80_80_train2_129_1202.txt"
            },
        ]
    },
    {
        shape_name: "train3",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_train3_1174.txt",
                pose_file: "poses_0_13_80_80_train3_150_1174.txt"
            },
        ]
    },
    {
        shape_name: "train1",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_train1_801.txt",
                pose_file: "poses_0_8_80_80_train1_140_801.txt"
            },
        ]
    },
    {
        shape_name: "num8",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_num8_1368.txt",
                pose_file: "poses_0_6_80_80_num8_104_1368.txt"
            },
        ]
    },
    {
        shape_name: "cruise",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_cruise_1011.txt",
                pose_file: "poses_0_0_80_80_cruise_141_1011.txt"
            },
        ]
    },
    {
        shape_name: "num9",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_num9_1351.txt",
                pose_file: "poses_0_22_80_80_num9_105_1351.txt"
            },
        ]
    },
    {
        shape_name: "butterfly2",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_butterfly2_1694.txt",
                pose_file: "poses_0_4_80_80_butterfly2_72_1694.txt"
            },
        ]
    },
    {
        shape_name: "aircraft",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_aircraft_1865.txt",
                pose_file: "poses_0_18_80_80_aircraft_136_1865.txt"
            },
        ]
    },
    {
        shape_name: "end_oval",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_end_oval_1886.txt",
                pose_file: "poses_0_3_80_80_end_oval_88_1886.txt"
            },
            {
                width: 15,
                height: 15,
                grid_file: "grid_end_oval_64.txt",
                pose_file: "poses_0_42_15_15_end_oval_64.txt"
            },
            {
                width: 38,
                height: 38,
                grid_file: "grid_end_oval_421.txt",
                pose_file: "poses_0_45_38_38_end_oval_421.txt"
            },
            {
                width: 56,
                height: 56,
                grid_file: "grid_end_oval_932.txt",
                pose_file: "poses_0_12_56_56_end_oval_932.txt"
            },
            {
                width: 90,
                height: 90,
                grid_file: "grid_end_oval_2393.txt",
                pose_file: "poses_0_0_90_90_end_oval_2393.txt"
            },
            {
                width: 115,
                height: 115,
                grid_file: "grid_end_oval_3984.txt",
                pose_file: "poses_0_3_115_115_end_oval_3984.txt"
            },
            {
                width: 135,
                height: 135,
                grid_file: "grid_end_oval_5469.txt",
                pose_file: "poses_0_8_135_135_end_oval_5469.txt"
            },
        ]
    },
    {
        shape_name: "5-angles",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_5-angles_930.txt",
                pose_file: "poses_0_8_80_80_5-angles_21_930.txt"
            },
            {
                width: 16,
                height: 16,
                grid_file: "grid_5-angles_60.txt",
                pose_file: "poses_0_15_16_16_1_60.txt"
            },
            {
                width: 40,
                height: 40,
                grid_file: "grid_5-angles_286.txt",
                pose_file: "poses_0_4_40_40_1_286.txt"
            },
            {
                width: 115,
                height: 115,
                grid_file: "grid_5-angles_2375.txt",
                pose_file: "poses_0_4_115_115_1_2375.txt"
            },
            {
                width: 130,
                height: 130,
                grid_file: "grid_5-angles_2986.txt",
                pose_file: "poses_0_9_130_130_1_2986.txt"
            },
            {
                width: 145,
                height: 145,
                grid_file: "grid_5-angles_3793.txt",
                pose_file: "poses_0_7_145_145_1_3793.txt"
            },
        ]
    },
    {
        shape_name: "cloud_lightning",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_cloud_lightning_1729.txt",
                pose_file: "poses_0_8_80_80_cloud_lightning_114_1729.txt"
            },
        ]
    },
    {
        shape_name: "butterfly1",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_butterfly1_703.txt",
                pose_file: "poses_0_2_80_80_butterfly1_66_703.txt"
            },
        ]
    },
    {
        shape_name: "irre-curve-1",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_irre-curve-1_1223.txt",
                pose_file: "poses_0_13_80_80_irre-curve-1_13_1223.txt"
            },
            {
                width: 16,
                height: 16,
                grid_file: "grid_irre-curve-1_47.txt",
                pose_file: "poses_0_32_16_16_irre-curve-1_47.txt"
            },
            {
                width: 40,
                height: 40,
                grid_file: "grid_irre-curve-1_303.txt",
                pose_file: "poses_0_7_40_40_irre-curve-1_303.txt"
            },
            {
                width: 120,
                height: 120,
                grid_file: "grid_irre-curve-1_2755.txt",
                pose_file: "poses_0_3_120_120_irre-curve-1_2755.txt"
            },
            {
                width: 135,
                height: 135,
                grid_file: "grid_irre-curve-1_3508.txt",
                pose_file: "poses_0_5_135_135_irre-curve-1_3508.txt"
            },
            {
                width: 155,
                height: 155,
                grid_file: "grid_irre-curve-1_4634.txt",
                pose_file: "poses_0_2_155_155_irre-curve-1_4634.txt"
            },
        ]
    },
    {
        shape_name: "r-edge-3",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_r-edge-3_1088.txt",
                pose_file: "poses_0_3_80_80_r-edge-3_18_1088.txt"
            },
        ]
    },
    {
        shape_name: "maplog",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_maplog_1655.txt",
                pose_file: "poses_0_11_80_80_maplog_119_1655.txt"
            },
        ]
    },
]

export { stored_para };
