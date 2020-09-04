"use strict"

let stored_para = [
    {
        shape_name: "chinese_gong",
        sizes: [
            {
                width: 16,
                height: 16,
                grid_file: "grid_chinese_gong_84_27.txt",
                pose_file: "poses_0_0_16_16_chinese_gong_84_27.txt"
            },
            {
                width: 40,
                height: 40,
                grid_file: "grid_chinese_gong_80_234.txt",
                pose_file: "poses_0_44_40_40_chinese_gong_80_234.txt"
            },
            {
                width: 80,
                height: 80,
                grid_file: "grid_chinese_gong_77_780.txt",
                pose_file: "poses_0_0_80_80_chinese_gong_77_780.txt"
            },
        ]
    },
    {
        shape_name: "anchor",
        sizes: [
            {
                width: 16,
                height: 16,
                grid_file: "grid_anchor_62_10.txt",
                pose_file: "poses_0_3_16_16_anchor_62_10.txt"
            },
            {
                width: 40,
                height: 40,
                grid_file: "grid_anchor_64_76.txt",
                pose_file: "poses_0_9_40_40_anchor_64_76.txt"
            },
            {
                width: 80,
                height: 80,
                grid_file: "grid_anchor_63_295.txt",
                pose_file: "poses_0_12_80_80_anchor_63_295.txt"
            },
        ]
    },
    {
        shape_name: "letter-f",
        sizes: [
            {
                width: 16,
                height: 16,
                grid_file: "grid_letter-f_38_52.txt",
                pose_file: "poses_0_0_16_16_letter-f_38_52.txt"
            },
            {
                width: 40,
                height: 40,
                grid_file: "grid_letter-f_35_336.txt",
                pose_file: "poses_0_24_40_40_letter-f_35_336.txt"
            },
            {
                width: 80,
                height: 80,
                grid_file: "grid_letter-f_41_1292.txt",
                pose_file: "poses_0_21_80_80_letter-f_41_1292.txt"
            },
        ]
    },
    {
        shape_name: "dolphin2",
        sizes: [
            {
                width: 16,
                height: 16,
                grid_file: "grid_dolphin2_67_43.txt",
                pose_file: "poses_0_0_16_16_dolphin2_67_43.txt"
            },
            {
                width: 40,
                height: 40,
                grid_file: "grid_dolphin2_75_276.txt",
                pose_file: "poses_0_40_40_40_dolphin2_75_276.txt"
            },
            {
                width: 80,
                height: 80,
                grid_file: "grid_dolphin2_75_1118.txt",
                pose_file: "poses_0_23_80_80_dolphin2_75_1118.txt"
            },
        ]
    },
    {
        shape_name: "irre-curve-1",
        sizes: [
            {
                width: 16,
                height: 16,
                grid_file: "grid_irre-curve-1_14_47.txt",
                pose_file: "poses_0_33_16_16_irre-curve-1_14_47.txt"
            },
            {
                width: 40,
                height: 40,
                grid_file: "grid_irre-curve-1_14_303.txt",
                pose_file: "poses_0_17_40_40_irre-curve-1_14_303.txt"
            },
            {
                width: 80,
                height: 80,
                grid_file: "grid_irre-curve-1_13_1223.txt",
                pose_file: "poses_0_13_80_80_irre-curve-1_13_1223.txt"
            },
        ]
    },
    {
        shape_name: "r-poly-5",
        sizes: [
            {
                width: 16,
                height: 16,
                grid_file: "grid_r-poly-5_15_70.txt",
                pose_file: "poses_0_46_16_16_r-poly-5_15_70.txt"
            },
            {
                width: 40,
                height: 40,
                grid_file: "grid_r-poly-5_16_470.txt",
                pose_file: "poses_0_42_40_40_r-poly-5_16_470.txt"
            },
            {
                width: 80,
                height: 80,
                grid_file: "grid_r-poly-5_15_1899.txt",
                pose_file: "poses_0_7_80_80_r-poly-5_15_1899.txt"
            },
        ]
    },
    {
        shape_name: "cloud_lightning",
        sizes: [
            {
                width: 80,
                height: 80,
                grid_file: "grid_cloud_lightning_114_1729.txt",
                pose_file: "poses_0_8_80_80_cloud_lightning_114_1729.txt"
            },
        ]
    },
    {
        shape_name: "num6",
        sizes: [
            {
                width: 16,
                height: 16,
                grid_file: "grid_num6_103_53.txt",
                pose_file: "poses_0_34_16_16_num6_103_53.txt"
            },
            {
                width: 40,
                height: 40,
                grid_file: "grid_num6_103_341.txt",
                pose_file: "poses_0_15_40_40_num6_103_341.txt"
            },
            {
                width: 80,
                height: 80,
                grid_file: "grid_num6_102_1362.txt",
                pose_file: "poses_0_10_80_80_num6_102_1362.txt"
            },
        ]
    },
    {
        shape_name: "batman",
        sizes: [
            {
                width: 40,
                height: 40,
                grid_file: "grid_batman_96_536.txt",
                pose_file: "poses_0_13_40_40_batman_96_536.txt"
            },
        ]
    },
    {
        shape_name: "two_triangle",
        sizes: [
            {
                width: 16,
                height: 16,
                grid_file: "grid_two_triangle_87_60.txt",
                pose_file: "poses_0_8_16_16_two_triangle_87_60.txt"
            },
            {
                width: 40,
                height: 40,
                grid_file: "grid_two_triangle_89_400.txt",
                pose_file: "poses_0_29_40_40_two_triangle_89_400.txt"
            },
        ]
    },
    {
        shape_name: "kitchen-fish",
        sizes: [
            {
                width: 40,
                height: 40,
                grid_file: "grid_kitchen-fish_152_261.txt",
                pose_file: "poses_0_34_40_40_kitchen-fish_152_261.txt"
            },
            {
                width: 80,
                height: 80,
                grid_file: "grid_kitchen-fish_145_1028.txt",
                pose_file: "poses_0_7_80_80_kitchen-fish_145_1028.txt"
            },
        ]
    },
    {
        shape_name: "cat3",
        sizes: [
            {
                width: 40,
                height: 40,
                grid_file: "grid_cat3_137_259.txt",
                pose_file: "poses_0_1_40_40_cat3_137_259.txt"
            },
            {
                width: 80,
                height: 80,
                grid_file: "grid_cat3_134_1033.txt",
                pose_file: "poses_0_9_80_80_cat3_134_1033.txt"
            },
        ]
    },
    {
        shape_name: "snow2",
        sizes: [
            {
                width: 40,
                height: 40,
                grid_file: "grid_snow2_144_122.txt",
                pose_file: "poses_0_34_40_40_snow2_144_122.txt"
            },
            {
                width: 80,
                height: 80,
                grid_file: "grid_snow2_139_484.txt",
                pose_file: "poses_0_6_80_80_snow2_139_484.txt"
            },
        ]
    },
    {
        shape_name: "moonstar",
        sizes: [
            {
                width: 16,
                height: 16,
                grid_file: "grid_moonstar_121_82.txt",
                pose_file: "poses_0_34_16_16_moonstar_121_82.txt"
            },
        ]
    },
    {
        shape_name: "chesse",
        sizes: [
            {
                width: 16,
                height: 16,
                grid_file: "grid_chesse_125_36.txt",
                pose_file: "poses_0_43_16_16_chesse_125_36.txt"
            },
            {
                width: 40,
                height: 40,
                grid_file: "grid_chesse_125_236.txt",
                pose_file: "poses_0_1_40_40_chesse_125_236.txt"
            },
            {
                width: 80,
                height: 80,
                grid_file: "grid_chesse_125_943.txt",
                pose_file: "poses_0_18_80_80_chesse_125_943.txt"
            },
        ]
    },
]

export { stored_para };