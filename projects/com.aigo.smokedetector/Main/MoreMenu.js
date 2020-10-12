import React from 'react';
// import {
//     View,
//     Image,
//     Text,
//     Button
// } from 'react-native';

import { ListItem, ListItemWithSlider, ListItemWithSwitch } from 'miot/ui/ListItem';
import { Service, Device, DeviceEvent, Host } from "miot";
import { CommonSetting, SETTING_KEYS } from "miot/ui/CommonSetting";
import { NordicDFU, DFUEmitter } from "react-native-nordic-dfu";
import { Dimensions, Image, ListView, PixelRatio, StyleSheet, Text, ScrollView, TouchableHighlight, View } from 'react-native';
let BUTTONS = [
  '测试对话框',
  '确定'
];
import Separator from 'miot/ui/Separator';

// 此ble对象，即为IBluetooth对象或者IBluetoothLock对象


const { width, height } = Dimensions.get('window');

export default class MoreMenu extends React.Component {


  constructor(props) {
    super(props);
    // console.warn('强烈推荐使用「通用设置项」: `miot/ui/CommonSetting`, 你可以在「首页」-「教程」-「插件通用设置项」中查看使用示例')

    this.state = {
      powerString: '暂无数据',
      switchOn: ''
      // switchOn: this.props.navigation.state.params.checkSelfSwitchOn == "true" ? true : false
    };

    this._createMenuData();

  }


  _createMenuData() {
    const { navigation } = this.props;

    // this.state({

    //   switchOn: this.props.navigation.state.params.checkSelfSwitchOn
    // })


    console.log(this.props.navigation.state.params.checkSelfSwitchOn);

    this._menuData = [

      {
        'name': '设备自检',
        'func': () => {
          navigation.navigate('checkSelf', { 'title': '设备自检' });
        }
      }

    ];

    this.commonSettingParams = {

      extraOptions: {
        option: "",
        showUpgrade: true
      }
    };
  }



  UNSAFE_componentWillMount() {

    // 获取自检提醒开关
    Service.storage.getThirdUserConfigsForOneKey(Device.model, 101).then((res) => {

      // alert(JSON.stringify(res))

      console.log("res101", res);
      this.setState({
        switchOn: res['data'] === 'true' ? true : false
      });

    }).catch((error) => {
      console.log("error", error);
    });


    // 请求：第一条事件
    Service.smarthome.getDeviceData({
      did: Device.deviceID,
      type: "prop",
      key: "4106", // Object ID 0x1004 温度 电量4106 烟感4117
      time_start: 0,
      time_end: Math.round(Date.now() / 1000),
      limit: 1
    }).then((res) => {

      console.log(res);
      const model = res[0];
      if (model.hasOwnProperty("value")) {
        let power = model['value'].substring(2, 4);
        console.log(this.hex2int(power));
        // var powerInt = this.hex2int(power)
        this.setState({
          powerString: `${ this.hex2int(power) }%`
        });
      }

    }).catch((err) => {
      console.log(err);
    });


    // Service.smarthome.getAvailableFirmwareForDids(Device.deviceID).then(res => {
    //   console.log(res);
    // }).catch((err) => {
    //   console.log(err);
    // });

    // Service.smarthome.getLatestVersionV2(Device.deviceID).then((res) => {

    //   console.log('getLatestVersionV2', res);
    //   var versionString = res['version']
    //   if (Device.lastVersion != versionString) {
    //     //需要更新
    //     Device.needUpgrade = true

    //     Device.force = true
    //   }

    // }).catch((err) => {
    //   console.log(err);
    // });

    // console.log('lastVersion', Device.lastVersion);
    // console.log('needUpgrade', Device.needUpgrade);

    // Device.lastVersion().then(res => {
    //   console.log('lastVersion', res);
    // }).catch(err => {
    //   console.log(err);
    // })

    // Device.needUpgrade().then(res => {
    //   console.log('needUpgrade', res);
    // }).catch(err => {
    //   console.log(err);
    // })



    // Device.checkFirmwareUpdateAndAlert().then(res => {
    //   console.log('checkFirmwareUpdateAndAlert', res);


    // }).catch(err => {
    //   console.log(err);
    // })


    // Device.getDeviceWifi().startUpgradingFirmware()
    //   .then(res => console.log('success:', res))
    //   .catch(err => console.log('failed:', err))

    // Device.getBluetoothLE()
    // require("../resources/CheckSelf_Smoke.png")
    // // 获取最新版本信息
    // Service.smarthome.getLatestVersionV2(Device.deviceID).then(newest => {
    //   // 获取当前版本信息
    //   Device.getBluetoothLE().getVersion(current => {
    //     // 比较版本
    //     if (newest.version > current.version) {
    //       console.log('需要升级文件');
    //       // 下载升级文件
    //       Host.file.downloadFile(newest.filePath, myfile)
    //         .then(res => {
    //           // nordic升级
    //           NordicDFU.startDFU({

    //             deviceAddress: "C3:53:C0:39:2F:99", // MAC address (Android) / UUID (iOS)
    //             name: "Pilloxa Pillbox",
    //             filePath: myfile
    //           }).then(res => console.log("Transfer done:", res)).catch(console.log);
    //         }).catch(err => { })
    //     }
    //   })
    // })

    // DFUEmitter.addlistener("DFUProgress", ({ percent, currentPart, partsTotal, avgSpeed, speed }) => {
    //   console.log("DFU progress: " + percent + "%");
    // });

    // DFUEmitter.addListener("DFUStateChanged", ({ state }) => {
    //   console.log("DFU State:", state);
    //   if (state === "completed") {
    //     Device.needUpgrade = false;
    //     console.log("updated");
    //   }
    // })

  }

  UNSAFE_componentWillUnmount() {

  }

  hex2int(hex) {
    let len = hex.length, a = new Array(len), code;
    for (let i = 0; i < len; i++) {
      code = hex.charCodeAt(i);
      if (48 <= code && code < 58) {
        code -= 48;
      } else {
        code = (code & 0xdf) - 65 + 10;
      }
      a[i] = code;
    }

    return a.reduce(function(acc, c) {
      acc = 16 * acc + c;
      return acc;
    }, 0);
  }

  render() {


    this.commonSettingParams.extraOptions.option = {
      option: "",
      showUpgrade: true, // 跳转到 sdk 提供的固件升级页面
      bleOtaAuthType: 1 // 蓝牙设备类型, 有哪些取值可以参考CommonSetting 注释
    };

    const { navigation } = this.props;
    const { first_options, second_options } = SETTING_KEYS; // 一级页面和二级页面可选项的keys
    // 比如我想在一级页面按顺序显示「设备共享」「智能场景」和「固件升级」
    // 通过枚举值 first_options 传入这三个设置项的key

    const firstOptions = [
      first_options.SHARE,
      first_options.IFTTT,
      first_options.FIRMWARE_UPGRADE
    ];
    // 然后我想在「更多设置」二级页面显示「设备时区」
    const secondOptions = [
    ];

    return (

      <ScrollView
        showsVerticalScrollIndicator={false}>
        {/* <View style={[styles.blank, { borderTopWidth: 0 }]} /> */}
        <View style={{
          backgroundColor: '#fff',
          justifyContent: 'center'
        }}>
          <Separator style={{ marginLeft: 0 }} />
          <View style={styles.titleContainer}>
            <Text style={{
              fontSize: 11,
              color: '#7F7F7F',
              marginLeft: 24
            }}>{"功能设置"}</Text>
          </View>
          <Separator style={{ marginLeft: 0 }} />
        </View>

        <ListItem
          title="设备自检"
          // showDot={true}
          onPress={() => navigation.navigate('checkSelf', { 'title': '设备自检' })}
          accessible={true}
          accessibilityHint="press title"
        // containerStyle={{ height: 44 }}
        />

        <ListItem
          title="消音"
          // showDot={true}
          onPress={() => navigation.navigate('silencer', { 'title': '消音' })}
          accessible={true}
          accessibilityHint="press title"
        // containerStyle={{ height: 44 }}
        />

        <ListItemWithSwitch
          title="每月自检提醒"
          value={this.state.switchOn}
          // value={false}
          onValueChange={(value) => {
            console.log(value);
            // this.setState({
            //   switchOn: value
            // });
            Service.storage.setThirdUserConfigsForOneKey(Device.model, 101, value).then((res) => {
              console.log("res", res);
              this.setState({
                switchOn: value
              });
            }).catch((error) => {
              console.log("error", error);
            });
          }}
        />


        <ListItem
          title="电池寿命"
          value={this.state.powerString}
          containerStyle={{ height: 44, backgroundColor: 'white' }}
          titleStyle={{ fontSize: 16 }}
          valueStyle={{ fontSize: 14 }}
          separator={<Separator />}
          hideArrow={true}
        // onPress={() => {
        //   console.log('设置电量')
        //   this.setState = ({
        //     powerString: '1234%'
        //   })
        // }}
        />

        <View style={[styles.blank, { borderTopWidth: 0 }]} />

        <CommonSetting
          navigation={this.props.navigation} // 插件的路由导航，必填！！！
          firstOptions={firstOptions}
          secondOptions={secondOptions}
          // extraOptions={Host.locale.language === 'zh' ? extraOptions_ch : extraOptions_en}
          containerStyle={{ marginTop: 24 }}
        />
      </ScrollView>
    );
  }

  // _renderRow(rowData, sectionID, rowID) {

  //   return (
  //     <TouchableHighlight underlayColor="#838383" onPress={() => this._pressRow(rowID)}>
  //       <View>
  //         <View style={styles.rowContainer}>
  //           <Text style={styles.title}>{rowData}</Text>
  //           {/* <Image style={styles.subArrow} source={require("../Resources/sub_arrow.png")} /> */}
  //         </View>
  //         <View style={styles.separator}></View>

  //       </View >
  //     </TouchableHighlight >
  //   );
  // }

  // _pressRow(rowID) {
  //   // console.log("row" + rowID + "clicked!");
  //   this._menuData[rowID].func();
  // }

  // onShowDidButtonPress() {
  //   this.props.navigation.navigate('helloDeveloper');
  // }

  // showReactART() {
  //   this.props.navigation.navigate('helloReactART');
  // }

  // showActionSheet() {
  //   if (Host.isIOS)
  //     ActionSheetIOS.showActionSheetWithOptions({
  //       options: BUTTONS,
  //       destructiveButtonIndex: 1
  //     },
  //       (buttonIndex) => {

  //       });
  // }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopColor: '#f1f1f1',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginBottom: 0,
    marginTop: 0
  },

  rowContainer: {
    height: 52,
    alignSelf: 'stretch',
    flexDirection: 'row',
    paddingLeft: 23,
    paddingRight: 23,
    alignItems: 'center',
    flex: 1
  },
  list: {
    alignSelf: 'stretch',
    backgroundColor: '#ffffff'
  },

  title: {
    fontSize: 15,
    color: '#333333',
    alignItems: 'center',
    // marginLeft: 2,
    flex: 1
  },
  subArrow: {
    width: 7,
    height: 14
  },
  separator: {
    height: 1 / PixelRatio.get(),
    backgroundColor: '#e5e5e5',
    marginLeft: 20
  },
  blank: {
    height: 8,
    backgroundColor: '#F7F7F7'
    // borderTopColor: Styles.common.hairlineColor,
    // borderTopWidth: StyleSheet.hairlineWidth,
    // borderBottomColor: Styles.common.hairlineColor,
    // borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleContainer: {
    height: 32,
    backgroundColor: '#fff',
    justifyContent: 'center'
    // alignItems: 'center',
    // paddingLeft: 24
  }

});
