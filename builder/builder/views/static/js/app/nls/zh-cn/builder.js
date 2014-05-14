﻿/*
Copyright ©2014 Esri. All rights reserved.
 
TRADE SECRETS: ESRI PROPRIETARY AND CONFIDENTIAL
Unpublished material - all rights reserved under the
Copyright Laws of the United States and applicable international
laws, treaties, and conventions.
 
For additional information, contact:
Attn: Contracts and Legal Department
Environmental Systems Research Institute, Inc.
380 New York Street
Redlands, California, 92373
USA
 
email: contracts@esri.com
*/
define("builder/nls/zh-cn/builder", {
  common: {
    ok: "确定",
    cancel: "取消",
    save:"保存",
    doNotSave: "不保存",
    saved: "已保存"
  },

  apps: {
    welcomeMessage: "欢迎使用 ArcGIS WebApp Builder!",
    appCreate: "新建",
    appCreateTitle:"创建新App",
    appUpload: "上传",
    appName: "名称",
    appDesc: "描述",
    appTime: "最近更新",
    edit: "编辑",
    launch: "打开",
    createFromHere: "从这里创建",
    remove: "删除",
    duplicate: "复制",
    editAppInfo: "编辑App信息",
    download: "下载",
    agolTemp: "导出为模板",
    createAppFailedMeg: "创建新App失败。",
    noAppName: "请输入App名字。",
    confirmRemoveApp: "你确认要删除该App？",
    removeAppTitle: "删除App",
    downloadFailedTip:"下载失败!"
  },

  header: {
    appDefaultAttributes:"应用程序默认属性",
    help:"帮助",
    settings:"设置",
    signIn:"登录",
    signOut:"注销",
    saveSuccessfully:"保存成功 !",
    saveFailed:"保存失败 !"
  },

  settings: {
    settings:"全局设置",
    lSettings:"设置",
    showAdSetting:"+ 显示高级设置",
    hideAdSetting:"隐藏高级设置...",
    bingMapKey:"Bing地图密钥",
    bingMapId:"Bing地图ID",
    defaultPortalUrl:"默认Portal地址",
    portalUrl:"Portal地址",
    geometryServiceUrl:"几何服务地址",
    routeServiceUrl:"网路服务地址",
    geocodeServiceUrl:"地理编码服务地址",
    printTaskUrl:"打印服务地址",
    httpProxyUrl:"HTTP代理地址",
    appId:"应用程序ID",
    locale:"区域设置",
    save:"保存",
    themeRepo: "主题仓库",
    widgetRepo: "工具仓库",
    loadHelperServices:"加载辅助服务",
    loadServiceError: "无效的portal URL, 正确格式为: http(s)://www.arcgis.com/ 或 http(s)://&lt;portal_server&gt;/&lt;instance_name&gt;",
    webMapError: "该Portal没有有效的webmap",
    helpText: {
      bingMapKey: "访问Bing地图和Bing地理编码器时所需要的密钥。",
      defaultPortalUrl: "ArcGIS Online或你的本地Portal for ArcGIS的URL地址。",
      geometryServiceUrl: "用在某些工具中的几何操作所需要的服务。",
      geocodeServiceUrl: "用在某些工具中的地理编码操作所需要的服务。",
      routeServiceUrl: "用在某些工具中的路线规划操作所需要的服务。",
      printTaskUrl: "用在某些工具中的打印操作所需要的服务。",
      httpProxyUrl: "在访问安全或跨域内容时，需要使用HTTP代理。",
      locale: "你的web应用的区域设置。",
      appId: "使用OAuth2授权登录ArcGIS Online时所需要用到应用ID。",
      themeRepo: "ArcGIS WebApp Builder的主题仓库位置。",
      widgetRepo: "ArcGIS WebApp Builder的工具仓库位置。"
    }
  },

  leftPane:{
    themes: "主题",
    map: "地图",
    widgets: "工具",
    attributes: "属性",
    width:"宽度",
    height:"高度",
    selectDevice:"通过选择某一设备或自定义尺寸预览",
    previewMore:"更多预览",
    back2Configure:"返回配置",
    unSaveMegBegin: "是否要保存对",
    unSaveMegEnd: "的更改？",
    canNotSaveMeg: "不能保存这个默认App",
    saveSuccessMeg: "保存成功",
    saveFailedMeg: "保存App失败",
    toHomeTitle: "ArcGIS WebApp Builder"
  },

  themes: {
    themeTitle: "主题",
    styleTitle: "风格",
    layoutTitle: "布局"
  },

  mapConfig: {
    map: "地图",
    selectWebMap:"选择Web Map",
    addMapLabel:"单击此处添加地图",
    addMapFromOnlineOrPortal:"从ArcGIS Online公共资源或您在ArcGIS Online及Portal的私有资源中查找并添加Web地图，供应用程序使用。",
    searchMapName:"搜索地图名称...",
    searchNone:"无搜索结果，请重新尝试。",
    groups:"组",
    noneGroups:"没有组",
    signInTip:"请登录以访问私有资源",
    signIn:"登录",
    publicMap:"公共",
    myOrganization:"我的组织",
    myGroup:"我的组",
    myContent:"我的内容",
    setExtentTip:'在右侧地图中导航至合适范围，单击"设置初始范围"按钮设置初始地图范围。',
    setExtent:"设置初始范围",
    count:"数量",
    fromPortal:"来自Portal",
    fromOnline:"来自ArcGIS.com",
    noneThumbnail:"无缩略图",
    changeMap:"选择地图",
    owner:"拥有者",
    signInTo:"登录到",
    lastModified:"最后修改",
    moreDetails:"更多详细信息",
    originalExtentTip:"恢复Web Map原始范围",
    setInitialExtent:"设置初始范围"
  },

  widgets: {
    openAtStart: "启动时打开",
    jsonEditor: "JSON编辑器",
    back: "返回",
    changeIcon: "修改图标",
    more: "更多信息",
    dropWidgetMessage: "确定删除该工具?",
    dropGroupMessage: "确定删除该组?",
    setControlledWidgets: "设置受控制的工具",
    setControlledWidgetsBy: "设置被控制的工具",
    noConfig: "没有更多的可配置信息.",
    notFinished:"未完成 !"
  },

  groups: {
    label: "标签"
  },
  
  attributes: {
    headerTitle: "标题",
    headerDesc: "添加 logo、标题、或子标题到应用程序",
    linksTitle: "链接",
    addLogo: "点击添加logo",
    title: "标题",
    subtitle: "子标题",
    addLink: "添加一个新链接",
    namePlaceholder: "链接名称",
    urlPlaceholder: "链接URL",
    addName: "双击这里编辑链接",
    save: "保存",
    ignoreWebmapPopups: "忽略 Webmap 弹出",
    moreAttributes: "更多属性"
  },

  agolTemplate: {
    title: "导出为Web Map App模板",
    rightPartHead: "设置可在模板中配置的参数",
    rightPartSubhead:"参数类别",
    rightPartHead2: "模板 JSON 代码",
    viewJsonCode: "浏览JSON代码",
    viewJsonBack: "回到设置",
    ok: "确定",
    save: "保存",
    download: "导出",
    unSaveMeg: "是否要保存更改？",
    cancelPopupTitle: "Webmap App 模板",
    saveSuccessMeg: "保存成功",
    appNameTitle: "App 名字： "
  }
});