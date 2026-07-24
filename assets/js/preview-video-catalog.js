/*
  M.O.T. PrintCore Academy - Public Video Preview Catalog

  게시 방법
  1) MP4 파일을 아래 경로와 파일명으로 업로드합니다.
     - downloads/previews/videos/korean/
     - downloads/previews/videos/chinese/
  2) 일부만 공개: PUBLISH_ALL = false 상태에서 PUBLISHED_VIDEO_NOS에 번호를 추가합니다.
     예: const PUBLISHED_VIDEO_NOS = ['01', '02'];
  3) 33개 한국어/중국어 파일을 모두 올린 뒤 전체 공개: PUBLISH_ALL = true로 변경합니다.

  주의: GitHub 공개 저장소의 MP4는 누구나 주소를 통해 열거나 저장할 수 있습니다.
*/
(function () {
  'use strict';

  // ===== 사용자가 수정할 곳 =====
  const PUBLISH_ALL = false;
  const PUBLISHED_VIDEO_NOS = [];
  // ============================

  const COURSES = [
  {
    "no": "01",
    "slug": "01_adr_preview",
    "koTitle": "자동현상제 보충 시스템 설계 기술서",
    "koDesc": "ADR 구조, 현상제 보충 제어, 농도 안정화 설계에 대한 영상 Preview입니다.",
    "enTitle": "Auto Developer Replenishment System Design Guide",
    "enDesc": "Video preview of ADR structure, developer replenishment control, and density stabilization design.",
    "zhTitle": "自动显影剂补给系统设计技术书",
    "zhDesc": "关于 ADR 结构、显影剂补给控制及浓度稳定化设计的视频 Preview。",
    "koFile": "downloads/previews/videos/korean/kr_01_adr_preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_01_adr_preview.mp4"
  },
  {
    "no": "02",
    "slug": "02_high_altitude_transfer_preview",
    "koTitle": "고지대 환경 전사 보정 기술서",
    "koDesc": "고지대 환경에서 발생하는 전사 특성 변화와 보정 설계에 대한 영상 Preview입니다.",
    "enTitle": "High-Altitude Transfer Compensation Guide",
    "enDesc": "Video preview of transfer-characteristic changes and compensation design under high-altitude environments.",
    "zhTitle": "高海拔环境下转印补偿技术书",
    "zhDesc": "关于高海拔环境下转印特性变化及补偿设计的视频 Preview。",
    "koFile": "downloads/previews/videos/korean/kr_02_high_altitude_transfer_preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_02_high_altitude_transfer_preview.mp4"
  },
  {
    "no": "03",
    "slug": "03_1c_jumping_magnetic_roller_design_preview",
    "koTitle": "1성분 점핑 Magnetic Roller 설계 표준 기술서",
    "koDesc": "1성분 점핑 현상 방식의 Magnetic Roller 설계 기준에 대한 영상 Preview입니다.",
    "enTitle": "One-Component Jumping Magnetic Roller Design Standard",
    "enDesc": "Video preview of Magnetic Roller design standards for one-component jumping development.",
    "zhTitle": "单组分跳跃显影 Magnetic Roller 设计标准技术书",
    "zhDesc": "关于单组分跳跃显影方式 Magnetic Roller 设计标准的视频 Preview。",
    "koFile": "downloads/previews/videos/korean/kr_03_1c_jumping_magnetic_roller_design_preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_03_1c_jumping_magnetic_roller_design_preview.mp4"
  },
  {
    "no": "04",
    "slug": "04_1c_development_preview",
    "koTitle": "1성분 현상 기술서",
    "koDesc": "1성분 현상 시스템의 기본 원리, 설계 변수, 화상 품질 영향에 대한 영상 Preview입니다.",
    "enTitle": "One-Component Development Technology Guide",
    "enDesc": "Video preview of one-component development principles, design variables, and image-quality impact.",
    "zhTitle": "单组分显影技术书",
    "zhDesc": "关于单组分显影系统基本原理、设计变量及图像质量影响的视频 Preview。",
    "koFile": "downloads/previews/videos/korean/kr_04_1c_development_preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_04_1c_development_preview.mp4"
  },
  {
    "no": "05",
    "slug": "05_carrier_design_standard_preview",
    "koTitle": "Carrier 설계 표준 기술서",
    "koDesc": "2성분 현상용 Carrier 입자, 자성 특성, 대전 특성 설계에 대한 영상 Preview입니다.",
    "enTitle": "Carrier Design Standard Guide",
    "enDesc": "Video preview of carrier particle, magnetic property, and charge-property design for two-component development.",
    "zhTitle": "Carrier 设计标准技术书",
    "zhDesc": "关于双组分显影用 Carrier 粒子、磁性特性及带电特性设计的视频 Preview。",
    "koFile": "downloads/previews/videos/korean/kr_05_carrier_design_standard_preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_05_carrier_design_standard_preview.mp4"
  },
  {
    "no": "06",
    "slug": "06_cleaning_blade_design_standard_preview",
    "koTitle": "Cleaning Blade 설계 표준 기술서",
    "koDesc": "Cleaning Blade의 재료, 형상, 접촉 조건, 마모 및 Cleaning 성능에 대한 영상 Preview입니다.",
    "enTitle": "Cleaning Blade Design Standard Guide",
    "enDesc": "Video preview of cleaning-blade materials, geometry, contact conditions, wear, and cleaning performance.",
    "zhTitle": "Cleaning Blade 设计标准技术书",
    "zhDesc": "关于 Cleaning Blade 材料、形状、接触条件、磨耗及清洁性能的视频 Preview。",
    "koFile": "downloads/previews/videos/korean/kr_06_cleaning_blade_design_standard_preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_06_cleaning_blade_design_standard_preview.mp4"
  },
  {
    "no": "07",
    "slug": "07_carrier_developer_mechanism_preview",
    "koTitle": "Carrier Developer Mechanism",
    "koDesc": "Carrier 현상 메커니즘과 토너 대전, 현상 안정성 관계에 대한 영상 Preview입니다.",
    "enTitle": "Carrier Developer Mechanism",
    "enDesc": "Video preview of carrier development mechanisms and the relationship between toner charging and development stability.",
    "zhTitle": "Carrier 显影 Mechanism",
    "zhDesc": "关于 Carrier 显影机理、碳粉带电及显影稳定性关系的视频 Preview。",
    "koFile": "downloads/previews/videos/korean/kr_07_carrier_developer_mechanism_preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_07_carrier_developer_mechanism_preview.mp4"
  },
  {
    "no": "08",
    "slug": "08_auger_mark_mechanism_preview",
    "koTitle": "Auger Mark Mechanism",
    "koDesc": "Auger 이송 구조에서 발생하는 농도 불균일, 주기성 화상 문제에 대한 영상 Preview입니다.",
    "enTitle": "Auger Mark Mechanism",
    "enDesc": "Video preview of density nonuniformity and periodic image defects caused by auger transport structures.",
    "zhTitle": "Auger Mark 机制",
    "zhDesc": "关于 Auger 输送结构中发生的浓度不均及周期性图像问题的视频 Preview。",
    "koFile": "downloads/previews/videos/korean/kr_08_auger_mark_mechanism_preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_08_auger_mark_mechanism_preview.mp4"
  },
  {
    "no": "09",
    "slug": "09_cr_design_standard_preview",
    "koTitle": "CR 설계 표준 기술서",
    "koDesc": "Charge Roller의 전기적 특성, 접촉 조건, 화상 품질 영향에 대한 영상 Preview입니다.",
    "enTitle": "CR Design Standard Guide",
    "enDesc": "Video preview of charge-roller electrical characteristics, contact conditions, and image-quality influence.",
    "zhTitle": "CR 设计标准技术书",
    "zhDesc": "关于 Charge Roller 电气特性、接触条件及图像质量影响的视频 Preview。",
    "koFile": "downloads/previews/videos/korean/kr_09_cr_design_standard_preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_09_cr_design_standard_preview.mp4"
  },
  {
    "no": "10",
    "slug": "10_2c_development_design_standard_preview",
    "koTitle": "2성분 현상 설계 표준 기술서",
    "koDesc": "2성분 현상 구조, Toner/Carrier 관계, T/D 제어에 대한 영상 Preview입니다.",
    "enTitle": "Two-Component Development Design Standard",
    "enDesc": "Video preview of two-component development structure, toner/carrier relationship, and T/D control.",
    "zhTitle": "双组分显影设计标准技术书",
    "zhDesc": "关于双组分显影结构、Toner/Carrier 关系及 T/D 控制的视频 Preview。",
    "koFile": "downloads/previews/videos/korean/kr_10_2c_development_design_standard_preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_10_2c_development_design_standard_preview.mp4"
  },
  {
    "no": "11",
    "slug": "11_drawing_standard_design_preview",
    "koTitle": "제도법 기준 설계 표준 기술서",
    "koDesc": "기계 도면 작성 기준, 치수, 공차, 설계 표준화에 대한 영상 Preview입니다.",
    "enTitle": "Drawing Method and Design Standard Guide",
    "enDesc": "Video preview of mechanical drawing rules, dimensions, tolerances, and design standardization.",
    "zhTitle": "制图法基准设计标准技术书",
    "zhDesc": "关于机械图纸作成基准、尺寸、公差及设计标准化的视频 Preview。",
    "koFile": "downloads/previews/videos/korean/kr_11_drawing_standard_design_preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_11_drawing_standard_design_preview.mp4"
  },
  {
    "no": "12",
    "slug": "12_dr_design_standard_preview",
    "koTitle": "DR 설계 표준 기술서",
    "koDesc": "Developer Roller의 구조, 재료, 저항, 표면 특성 설계에 대한 영상 Preview입니다.",
    "enTitle": "DR Design Standard Guide",
    "enDesc": "Video preview of Developer Roller structure, materials, resistance, and surface-property design.",
    "zhTitle": "DR 设计标准技术书",
    "zhDesc": "关于 Developer Roller 结构、材料、电阻及表面特性设计的视频 Preview。",
    "koFile": "downloads/previews/videos/korean/kr_12_dr_design_standard_preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_12_dr_design_standard_preview.mp4"
  },
  {
    "no": "13",
    "slug": "13_edge_effect_mechanism_preview",
    "koTitle": "Edge Effect 발생 메커니즘 표준 기술서",
    "koDesc": "화상 Edge 부위에서 발생하는 농도, 전계, 현상 불균일 메커니즘에 대한 영상 Preview입니다.",
    "enTitle": "Edge Effect Generation Mechanism Standard Guide",
    "enDesc": "Video preview of density, electric-field, and development nonuniformity mechanisms at image-edge areas.",
    "zhTitle": "Edge Effect 发生机理标准技术书",
    "zhDesc": "关于图像边缘部位浓度、电场及显影不均机理的视频 Preview。",
    "koFile": "downloads/previews/videos/korean/kr_13_edge_effect_mechanism_preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_13_edge_effect_mechanism_preview.mp4"
  },
  {
    "no": "14",
    "slug": "14_fuser_belt_design_standard_preview",
    "koTitle": "Fuser Belt 설계 표준 기술서",
    "koDesc": "Fuser Belt의 구조, 재료, 열특성, 내구 설계에 대한 영상 Preview입니다.",
    "enTitle": "Fuser Belt Design Standard Guide",
    "enDesc": "Video preview of fuser-belt structure, materials, thermal characteristics, and durability design.",
    "zhTitle": "Fuser Belt 设计标准技术书",
    "zhDesc": "关于 Fuser Belt 结构、材料、热特性及耐久设计的视频 Preview。",
    "koFile": "downloads/previews/videos/korean/kr_14_fuser_belt_design_standard_preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_14_fuser_belt_design_standard_preview.mp4"
  },
  {
    "no": "15",
    "slug": "15_paper_path_design_standard_preview",
    "koTitle": "Paper Path 설계 표준 기술서",
    "koDesc": "용지 이송 경로, Jam 방지, 곡률, Guide 설계에 대한 영상 Preview입니다.",
    "enTitle": "Paper Path Design Standard Guide",
    "enDesc": "Video preview of paper transport paths, jam prevention, curvature, and guide design.",
    "zhTitle": "Paper Path 设计标准技术书",
    "zhDesc": "关于纸张输送路径、防 Jam、曲率及 Guide 设计的视频 Preview。",
    "koFile": "downloads/previews/videos/korean/kr_15_paper_path_design_standard_preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_15_paper_path_design_standard_preview.mp4"
  },
  {
    "no": "16",
    "slug": "16_opc_manufacturing_standard_preview",
    "koTitle": "OPC 제조 표준 기술서",
    "koDesc": "OPC Drum의 제조 공정, 감광층, 전기적 특성에 대한 영상 Preview입니다.",
    "enTitle": "OPC Manufacturing Standard Guide",
    "enDesc": "Video preview of OPC Drum manufacturing processes, photosensitive layers, and electrical characteristics.",
    "zhTitle": "OPC 制造标准技术书",
    "zhDesc": "关于 OPC Drum 制造工艺、感光层及电气特性的视频 Preview。",
    "koFile": "downloads/previews/videos/korean/kr_16_opc_manufacturing_standard_preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_16_opc_manufacturing_standard_preview.mp4"
  },
  {
    "no": "17",
    "slug": "17_polymer_material_standard_preview",
    "koTitle": "고분자 재료 표준 기술서",
    "koDesc": "프린터 부품에 사용되는 고분자 재료 특성과 설계 적용에 대한 영상 Preview입니다.",
    "enTitle": "Polymer Material Standard Guide",
    "enDesc": "Video preview of polymer material characteristics and design applications for printer components.",
    "zhTitle": "高分子材料标准技术书",
    "zhDesc": "关于打印机部件用高分子材料特性及设计应用的视频 Preview。",
    "koFile": "downloads/previews/videos/korean/kr_17_polymer_material_standard_preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_17_polymer_material_standard_preview.mp4"
  },
  {
    "no": "18",
    "slug": "18_heat_roller_manufacturing_standard_preview",
    "koTitle": "Heat Roller 제조 표준 기술서",
    "koDesc": "Heat Roller 제조 공정, 표면 처리, 코팅 및 품질 관리에 대한 영상 Preview입니다.",
    "enTitle": "Heat Roller Manufacturing Standard Guide",
    "enDesc": "Video preview of heat-roller manufacturing processes, surface treatment, coating, and quality control.",
    "zhTitle": "Heat Roller 制造标准技术书",
    "zhDesc": "关于 Heat Roller 制造工艺、表面处理、涂层及品质管理的视频 Preview。",
    "koFile": "downloads/previews/videos/korean/kr_18_heat_roller_manufacturing_standard_preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_18_heat_roller_manufacturing_standard_preview.mp4"
  },
  {
    "no": "19",
    "slug": "19_magnetic_roller_design_standard_preview",
    "koTitle": "Magnetic Roller 설계 표준 기술서",
    "koDesc": "Magnetic Roller의 자력 분포, Sleeve, Core 설계 기준에 대한 영상 Preview입니다.",
    "enTitle": "Magnetic Roller Design Standard Guide",
    "enDesc": "Video preview of Magnetic Roller magnetic-force distribution, sleeve, and core design standards.",
    "zhTitle": "Magnetic Roller 设计标准技术书",
    "zhDesc": "关于 Magnetic Roller 磁力分布、Sleeve 及 Core 设计标准的视频 Preview。",
    "koFile": "downloads/previews/videos/korean/kr_19_magnetic_roller_design_standard_preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_19_magnetic_roller_design_standard_preview.mp4"
  },
  {
    "no": "20",
    "slug": "20_pi_belt_manufacturing_standard_preview",
    "koTitle": "PI Belt 제조 표준 기술서",
    "koDesc": "PI Belt의 재료, 성형, Imide화, 코팅 공정에 대한 영상 Preview입니다.",
    "enTitle": "PI Belt Manufacturing Standard Guide",
    "enDesc": "Video preview of PI Belt materials, forming, imidization, and coating processes.",
    "zhTitle": "PI Belt 制造标准技术书",
    "zhDesc": "关于 PI Belt 材料、成形、Imide 化及涂层工艺的视频 Preview。",
    "koFile": "downloads/previews/videos/korean/kr_20_pi_belt_manufacturing_standard_preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_20_pi_belt_manufacturing_standard_preview.mp4"
  },
  {
    "no": "21",
    "slug": "21_static_electricity_offset_mechanism_preview",
    "koTitle": "Static Electricity Offset 발생 메커니즘 기술서",
    "koDesc": "정전기성 Offset의 발생 원리, 재료 및 공정 영향에 대한 영상 Preview입니다.",
    "enTitle": "Static Electricity Offset Generation Mechanism Guide",
    "enDesc": "Video preview of static-electricity offset generation principles and material/process influences.",
    "zhTitle": "Static Electricity Offset 发生机理技术书",
    "zhDesc": "关于静电性 Offset 发生原理、材料及工艺影响的视频 Preview。",
    "koFile": "downloads/previews/videos/korean/kr_21_static_electricity_offset_mechanism_preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_21_static_electricity_offset_mechanism_preview.mp4"
  },
  {
    "no": "22",
    "slug": "22_silicone_rubber_foaming_design_process_preview",
    "koTitle": "실리콘 고무 발포 설계 표준 제조공정 기술서",
    "koDesc": "실리콘 고무 발포 구조, Cell 제어, 제조 조건에 대한 영상 Preview입니다.",
    "enTitle": "Silicone Rubber Foaming Design and Process Standard Guide",
    "enDesc": "Video preview of silicone-rubber foaming structure, cell control, and manufacturing conditions.",
    "zhTitle": "硅橡胶发泡设计标准制造工艺技术书",
    "zhDesc": "关于硅橡胶发泡结构、Cell 控制及制造条件的视频 Preview。",
    "koFile": "downloads/previews/videos/korean/kr_22_silicone_rubber_foaming_design_process_preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_22_silicone_rubber_foaming_design_process_preview.mp4"
  },
  {
    "no": "23",
    "slug": "23_silicone_rubber_foaming_process_preview",
    "koTitle": "Silicon Rubber Foaming 제조공정 기술서",
    "koDesc": "Silicone Rubber Foaming 제조 공정 조건과 품질 관리에 대한 영상 Preview입니다.",
    "enTitle": "Silicone Rubber Foaming Manufacturing Process Guide",
    "enDesc": "Video preview of silicone-rubber foaming process conditions and quality control.",
    "zhTitle": "Silicone Rubber Foaming 制造工艺技术书",
    "zhDesc": "关于 Silicone Rubber Foaming 制造工艺条件及品质管理的视频 Preview。",
    "koFile": "downloads/previews/videos/korean/kr_23_silicone_rubber_foaming_process_preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_23_silicone_rubber_foaming_process_preview.mp4"
  },
  {
    "no": "24",
    "slug": "24_white_spot_mechanism_preview",
    "koTitle": "White Spot 발생 메커니즘 기술서",
    "koDesc": "White Spot 화상 결함의 발생 원리와 설계/공정 영향에 대한 영상 Preview입니다.",
    "enTitle": "White Spot Generation Mechanism Guide",
    "enDesc": "Video preview of White Spot image-defect generation principles and design/process influences.",
    "zhTitle": "White Spot 发生机理技术书",
    "zhDesc": "关于 White Spot 图像缺陷发生原理及设计/工艺影响的视频 Preview。",
    "koFile": "downloads/previews/videos/korean/kr_24_white_spot_mechanism_preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_24_white_spot_mechanism_preview.mp4"
  },
  {
    "no": "25",
    "slug": "25_transfer_roller_design_process_preview",
    "koTitle": "Transfer Roller 설계 표준 제조공정 기술서",
    "koDesc": "Transfer Roller의 전기적 특성, 재료, 제조 공정에 대한 영상 Preview입니다.",
    "enTitle": "Transfer Roller Design Standard and Manufacturing Process Guide",
    "enDesc": "Video preview of Transfer Roller electrical characteristics, materials, and manufacturing processes.",
    "zhTitle": "Transfer Roller 设计标准制造工艺技术书",
    "zhDesc": "关于 Transfer Roller 电气特性、材料及制造工艺的视频 Preview。",
    "koFile": "downloads/previews/videos/korean/kr_25_transfer_roller_design_process_preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_25_transfer_roller_design_process_preview.mp4"
  },
  {
    "no": "26",
    "slug": "26_rubber_parts_design_process_preview",
    "koTitle": "고무 부품 설계 표준 제조공정 기술서",
    "koDesc": "고무 부품의 재료, 경도, 치수, 제조 공정 설계에 대한 영상 Preview입니다.",
    "enTitle": "Rubber Parts Design Standard and Manufacturing Process Guide",
    "enDesc": "Video preview of rubber-part material, hardness, dimensions, and manufacturing-process design.",
    "zhTitle": "橡胶部件设计标准制造工艺技术书",
    "zhDesc": "关于橡胶部件材料、硬度、尺寸及制造工艺设计的视频 Preview。",
    "koFile": "downloads/previews/videos/korean/kr_26_rubber_parts_design_process_preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_26_rubber_parts_design_process_preview.mp4"
  },
  {
    "no": "27",
    "slug": "27_toner_charge_measurement_standard_preview",
    "koTitle": "토너 대전량 측정 표준서",
    "koDesc": "토너 대전량 측정 원리, 측정 조건, 표준화 방법에 대한 영상 Preview입니다.",
    "enTitle": "Toner Charge Measurement Standard",
    "enDesc": "Video preview of toner charge-measurement principles, measurement conditions, and standardization methods.",
    "zhTitle": "碳粉带电量测量标准书",
    "zhDesc": "关于碳粉带电量测量原理、测量条件及标准化方法的视频 Preview。",
    "koFile": "downloads/previews/videos/korean/kr_27_toner_charge_measurement_standard_preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_27_toner_charge_measurement_standard_preview.mp4"
  },
  {
    "no": "28",
    "slug": "28_toner_fusing_resin_design_preview",
    "koTitle": "토너 정착성 수지 설계 기술서",
    "koDesc": "토너 수지 설계와 정착성, 열특성, Offset 특성에 대한 영상 Preview입니다.",
    "enTitle": "Toner Fusing Resin Design Guide",
    "enDesc": "Video preview of toner resin design, fusing performance, thermal characteristics, and offset characteristics.",
    "zhTitle": "碳粉定影性树脂设计技术书",
    "zhDesc": "关于碳粉树脂设计、定影性、热特性及 Offset 特性的视频 Preview。",
    "koFile": "downloads/previews/videos/korean/kr_28_toner_fusing_resin_design_preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_28_toner_fusing_resin_design_preview.mp4"
  },
  {
    "no": "29",
    "slug": "29_toner_consumption_factor_analysis_preview",
    "koTitle": "토너 소모량 영향 요인 분석 기술서",
    "koDesc": "토너 소모량에 영향을 주는 설계, 화상, 공정 요인에 대한 영상 Preview입니다.",
    "enTitle": "Toner Consumption Factor Analysis Guide",
    "enDesc": "Video preview of design, image, and process factors affecting toner consumption.",
    "zhTitle": "碳粉消耗量影响因素分析技术书",
    "zhDesc": "关于影响碳粉消耗量的设计、图像及工艺因素的视频 Preview。",
    "koFile": "downloads/previews/videos/korean/kr_29_toner_consumption_factor_analysis_preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_29_toner_consumption_factor_analysis_preview.mp4"
  },
  {
    "no": "30",
    "slug": "30_pulverized_toner_design_manufacturing_preview",
    "koTitle": "분쇄 토너 설계 표준 제조공학 기술서",
    "koDesc": "분쇄 토너의 조성, 제조 공정, 입도 및 외첨 설계에 대한 영상 Preview입니다.",
    "enTitle": "Pulverized Toner Design Standard and Manufacturing Engineering Guide",
    "enDesc": "Video preview of pulverized-toner formulation, manufacturing process, particle size, and external-additive design.",
    "zhTitle": "粉碎碳粉设计标准制造工程技术书",
    "zhDesc": "关于粉碎碳粉组成、制造工艺、粒度及外添设计的视频 Preview。",
    "koFile": "downloads/previews/videos/korean/kr_30_pulverized_toner_design_manufacturing_preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_30_pulverized_toner_design_manufacturing_preview.mp4"
  },
  {
    "no": "31",
    "slug": "31_polymerized_toner_particle_design_manufacturing_preview",
    "koTitle": "중합 토너 입자 설계 표준 제조공학 기술서",
    "koDesc": "중합 토너 입자 설계, 중합 공정, 입자 제어에 대한 영상 Preview입니다.",
    "enTitle": "Polymerized Toner Particle Design Standard and Manufacturing Engineering Guide",
    "enDesc": "Video preview of polymerized-toner particle design, polymerization process, and particle control.",
    "zhTitle": "聚合碳粉粒子设计标准制造工程技术书",
    "zhDesc": "关于聚合碳粉粒子设计、聚合工艺及粒子控制的视频 Preview。",
    "koFile": "downloads/previews/videos/korean/kr_31_polymerized_toner_particle_design_manufacturing_preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_31_polymerized_toner_particle_design_manufacturing_preview.mp4"
  },
  {
    "no": "32",
    "slug": "32_development_layout_design_standard_preview",
    "koTitle": "현상 Layout 설계 표준 기술서",
    "koDesc": "현상기 Layout, OPC/DR/MR 배치, Gap 및 각도 설계에 대한 영상 Preview입니다.",
    "enTitle": "Development Layout Design Standard Guide",
    "enDesc": "Video preview of development-unit layout, OPC/DR/MR arrangement, gap, and angle design.",
    "zhTitle": "显影 Layout 设计标准技术书",
    "zhDesc": "关于显影器 Layout、OPC/DR/MR 配置、Gap 及角度设计的视频 Preview。",
    "koFile": "downloads/previews/videos/korean/kr_32_development_layout_design_standard_preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_32_development_layout_design_standard_preview.mp4"
  },
  {
    "no": "33",
    "slug": "33_opc_design_standard_preview",
    "koTitle": "OPC 설계 표준서 기술서",
    "koDesc": "OPC Drum의 전기적, 광학적, 기계적 설계 기준에 대한 영상 Preview입니다.",
    "enTitle": "OPC Design Standard Guide",
    "enDesc": "Video preview of electrical, optical, and mechanical design standards for OPC Drum.",
    "zhTitle": "OPC 设计标准书技术书",
    "zhDesc": "关于 OPC Drum 电气、光学及机械设计标准的视频 Preview。",
    "koFile": "downloads/previews/videos/korean/kr_33_opc_design_standard_preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_33_opc_design_standard_preview.mp4"
  }
];

  const BUTTON_TEXT = {
    ko: { ko: '한국어 영상', zh: '中文 영상' },
    en: { ko: 'Korean Video', zh: 'Chinese Video' },
    zh: { ko: '韩文视频', zh: '中文视频' }
  };

  function normalizeLang(value) {
    const raw = String(value || '').toLowerCase();
    if (raw.startsWith('zh') || raw === 'cn' || raw === 'chinese') return 'zh';
    if (raw.startsWith('en')) return 'en';
    return 'ko';
  }

  function getCurrentLang(explicitLang) {
    if (explicitLang) return normalizeLang(explicitLang);
    try {
      const urlLang = new URLSearchParams(window.location.search).get('lang');
      if (urlLang) return normalizeLang(urlLang);
    } catch (_) {}
    try {
      const stored = localStorage.getItem('mot-lang') || localStorage.getItem('academy-lang') || localStorage.getItem('lang');
      if (stored) return normalizeLang(stored);
    } catch (_) {}
    return normalizeLang(document.documentElement.lang || 'ko');
  }

  function isPublished(no) {
    return PUBLISH_ALL || PUBLISHED_VIDEO_NOS.includes(String(no).padStart(2, '0'));
  }

  function getPublishedCourses() {
    return COURSES.filter((course) => isPublished(course.no));
  }

  function getCourse(no) {
    const normalized = String(no || '').padStart(2, '0');
    return COURSES.find((course) => course.no === normalized) || null;
  }

  function textFor(course, lang, field) {
    const prefix = lang === 'en' ? 'en' : lang === 'zh' ? 'zh' : 'ko';
    return course[prefix + field] || course['ko' + field] || '';
  }

  function playerUrl(no, language) {
    return 'preview-video.html?id=' + encodeURIComponent(no) + '&lang=' + encodeURIComponent(language);
  }

  function createVideoCard(course) {
    const card = document.createElement('article');
    card.className = 'preview-card preview-video-card';
    card.setAttribute('data-preview-type', 'video');
    card.setAttribute('data-video-no', course.no);
    card.setAttribute('data-generated-video-card', 'true');

    const number = document.createElement('span');
    number.className = 'book-no';
    number.textContent = 'V' + course.no;

    const title = document.createElement('h3');
    const description = document.createElement('p');

    const buttons = document.createElement('div');
    buttons.className = 'preview-buttons';

    const koLink = document.createElement('a');
    koLink.href = playerUrl(course.no, 'ko');
    koLink.setAttribute('data-video-language', 'ko');
    koLink.setAttribute('aria-label', course.koTitle + ' 한국어 영상 Preview');

    const zhLink = document.createElement('a');
    zhLink.href = playerUrl(course.no, 'zh');
    zhLink.setAttribute('data-video-language', 'zh');
    zhLink.setAttribute('aria-label', course.zhTitle + ' 中文视频 Preview');

    buttons.append(koLink, zhLink);
    card.append(number, title, description, buttons);
    return card;
  }

  function applyVideoLanguage(lang) {
    const current = getCurrentLang(lang);
    const section = document.getElementById('technical-book-previews');
    if (!section) return;

    section.querySelectorAll('[data-generated-video-card="true"]').forEach((card) => {
      const course = getCourse(card.getAttribute('data-video-no'));
      if (!course) return;
      const title = card.querySelector('h3');
      const description = card.querySelector('p');
      const koLink = card.querySelector('[data-video-language="ko"]');
      const zhLink = card.querySelector('[data-video-language="zh"]');
      if (title) title.textContent = textFor(course, current, 'Title');
      if (description) description.textContent = textFor(course, current, 'Desc');
      if (koLink) koLink.textContent = BUTTON_TEXT[current].ko;
      if (zhLink) zhLink.textContent = BUTTON_TEXT[current].zh;
    });
  }

  function renderVideoCards() {
    const grid = document.getElementById('preview-content-grid');
    if (!grid) return;

    grid.querySelectorAll('[data-generated-video-card="true"]').forEach((card) => card.remove());
    getPublishedCourses().forEach((course) => grid.appendChild(createVideoCard(course)));
    applyVideoLanguage(getCurrentLang());

    document.dispatchEvent(new CustomEvent('mot:preview-video-catalog-ready', {
      detail: { publishedCount: getPublishedCourses().length }
    }));
  }

  window.MOTPreviewVideoCatalog = {
    courses: COURSES,
    isPublished,
    getCourse,
    getPublishedCourses,
    textFor,
    normalizeLang
  };

  document.addEventListener('mot:localechange', (event) => {
    applyVideoLanguage(event.detail && event.detail.locale);
  });
  document.addEventListener('mot:academy-languagechange', (event) => {
    applyVideoLanguage(event.detail && event.detail.locale);
  });
  window.addEventListener('storage', () => applyVideoLanguage(getCurrentLang()));

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderVideoCards);
  } else {
    renderVideoCards();
  }
})();
