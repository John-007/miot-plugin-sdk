
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


import { Entrance, Package } from "miot";
import App from "./Main/index";

// Package.BLEAutoCheckUpgradeOptions = {
//   enable: true,
//   redPoint: true,
//   alertDialog: true,
//   authType: 4
// };

switch (Package.entrance) {
  case Entrance.Scene:
    break;
  default:
    Package.entry(App, (_) => {
    });
    break;
}
