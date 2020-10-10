
// import React from 'react';
// import { API_LEVEL, Package, Device, Service, Host } from 'miot';
// import { PackageEvent, DeviceEvent } from 'miot';
// import { View, Text } from 'react-native';

// class App extends React.Component {
//     render() {
//         return (
//         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'powderblue' }}>
//         <Text>hello, this is a tiny plugin project of MIOT</Text>
//         <Text>API_LEVEL:{API_LEVEL}</Text>
//         <Text>NATIVE_API_LEVEL:{Host.apiLevel}</Text>
//         <Text>{Package.packageName}</Text>
//         <Text>models:{Package.models}</Text>
//         </View>
//         )
//     }
// }
// Package.entry(App, () => {

// })


// import { Entrance, Package } from "miot";
// import App from "./Main/index";

// // Package.BLEAutoCheckUpgradeOptions = {
// //   enable: true,
// //   redPoint: true,
// //   alertDialog: true,
// //   authType: 4
// // };

// switch (Package.entrance) {
//   case Entrance.Scene:
//     break;
//   default:
//     Package.entry(App, (_) => {
//     });
//     break;
// }



import { Package } from 'miot';

import App from './Main/index';

/**
 * 是否需要自动检测wifi固件强制升级, 自动检测出需要升级则会出现弹窗提示升级
 * 此属性对分享的设备、虚拟设备、离线设备无效, 如果是蓝牙设备请将disableAutoCheckUpgrade设置为true
 * Package.disableAutoCheckUpgrade = false  表示会自动检测， 当发现需要强制升级时，进入插件会自动出现强制升级的弹窗,反之则不会
 * @type {boolean}
 */
Package.disableAutoCheckUpgrade = true;

Package.BLEAutoCheckUpgradeOptions = {
    enable: true,
    redPoint: true,
    alertDialog: true,
    authType: 4 // 此处值需要开发者根据具体蓝牙设备类型来做相关修改
};

Package.entry(App, () => { });