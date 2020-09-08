import React from 'react';
// import {
//     View,
//     Image,
//     Text,
//     Button
// } from 'react-native';

import { ListItem, ListItemWithSlider, ListItemWithSwitch } from 'miot/ui/ListItem';
import { Bluetooth, BluetoothEvent, Device, DeviceEvent, Host } from "miot";
import { CommonSetting, SETTING_KEYS } from "miot/ui/CommonSetting";
import { ActionSheetIOS, Image, ListView, PixelRatio, StyleSheet, Text, ScrollView, TouchableHighlight, View } from 'react-native';
let BUTTONS = [
  '测试对话框',
  '确定'
];
import Service from 'miot/Service';
import Separator from 'miot/ui/Separator';

// 此ble对象，即为IBluetooth对象或者IBluetoothLock对象




export default class MoreMenu extends React.Component {


  constructor(props) {
    super(props);
    // console.warn('强烈推荐使用「通用设置项」: `miot/ui/CommonSetting`, 你可以在「首页」-「教程」-「插件通用设置项」中查看使用示例')
    let ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    });
    this._createMenuData();


    this.state = {
      dataSource: ds.cloneWithRows(this._menuData.map((o) => (o.name)))
    };
  }


  _createMenuData() {
    const { navigation } = this.props;
    this._menuData = [
      // {
      //     'name': '你好，开发者！',
      //     'func': () => {
      //         this.onShowDidButtonPress();
      //     }
      // },
      {
        'name': '设备自检',
        'func': () => {
          // alert('测试对话框');
          navigation.navigate('checkSelf', { 'title': '设备自检' });
          // this.props.navigation.navigate('checkSelf', { 'title': '设备自检' });
          // alert(Device.getBluetoothLE().readRSSI());
        }
      }
      // {
      //     'name': '弹出ActionSheet',
      //     'func': () => {
      //         this.showActionSheet();
      //     }
      // },
      // {
      //     'name': 'REACT-ART',
      //     'func': () => {
      //         this.showReactART();
      //     }
      // },
      // {
      //     'name': '高德地图',
      //     'func': () => {
      //         this.props.navigation.navigate('mhMapDemo', { 'title': '高德地图Demo' });
      //     }
      // },
      // {
      //     'name': '新目录结构获取图片方式测试',
      //     'func': () => {
      //         this.props.navigation.navigate('imagePathDemo', { 'title': '新目录结构获取图片方式测试' });
      //     }
      // },
      // {
      //     'name': '修改设备名称',
      //     'func': () => {
      //         Host.ui.openChangeDeviceName();
      //     }
      // },
      // {
      //     'name': '设备共享',
      //     'func': () => {
      //         Host.ui.openShareDevicePage();
      //     }
      // },
      // {
      //     'name': '检查固件升级',
      //     'func': () => {
      //         Host.ui.openDeviceUpgradePage();
      //     }
      // },
      // {
      //     'name': '删除设备',
      //     'func': () => {
      //         Host.ui.openDeleteDevice();
      //     }
      // },
      // {
      //     'name': '删除设备时自定义提示',
      //     'func': () => {
      //         Host.ui.openDeleteDevice("😘 🍚 🐰");
      //     }
      // },
      // {
      //     'name': '安全设置',
      //     'func': () => {
      //         Host.ui.openSecuritySetting();
      //     }
      // },
      // {
      //     'name': '常见问题',
      //     'func': () => {
      //         Host.ui.openHelpPage();
      //     }
      // },
      // {
      //     'name': '反馈问题',
      //     'func': () => {
      //         Host.ui.openFeedbackInput();
      //     }
      // },
      // {
      //     'name': '语音设备授权',
      //     'func': () => {
      //         Host.ui.openVoiceCtrlDeviceAuthPage();
      //     }
      // },
      // {
      //     'name': '分享',
      //     'func': () => {
      //         Host.ui.openShareListBar('小米智能家庭', '小米智能家庭', { uri: 'https://avatars3.githubusercontent.com/u/13726966?s=40&v=4' }, 'https://iot.mi.com/new/index.html');
      //     }
      // },
      // {
      //     'name': '获取设备列表数据',
      //     'func': () => {
      //         Host.ui.getDevicesWithModel(Device.model).then(devices => {
      //             alert(JSON.stringify(devices));
      //         }).catch(err => {
      //             alert("未获取到设备");
      //         })
      //     }
      // },
      // {
      //     'name': "开启倒计时",
      //     'func': () => {
      //         let setting = { onMethod: "power_on", offMethod: 'power_off', onParam: 'on', offParam: 'off', identify: 'aaaa' }
      //         //   let setting = {}
      //         Host.ui.openCountDownPage(false, setting);
      //     }
      // },
      // {
      //     'name': "开启定时",
      //     'func': () => {
      //         Host.ui.openTimerSettingPageWithVariousTypeParams("power_on", ["on", "title"], 'off', "title")
      //     }
      // },
      // {
      //     'name': '打开自动化界面',
      //     'func': () => {
      //         Host.ui.openIftttAutoPage();
      //     }
      // },
      // {
      //     'name': '位置管理',
      //     'func': () => {
      //         Host.ui.openRoomManagementPage();
      //     }
      // },
      // {
      //     'name': '时区设置',
      //     'func': () => {
      //         Host.ui.openDeviceTimeZoneSettingPage();
      //     }
      // },
      // {
      //     'name': '添加到桌面',
      //     'func': () => {
      //         Host.ui.openAddToDesktopPage();
      //     }
      // },
      // {
      //     'name': '蓝牙网关',
      //     'func': () => {
      //         Host.ui.openBtGatewayPage();
      //     }
      // },
      // {
      //     'name': 'Android手机蓝牙设置页面',
      //     'func': () => {
      //         Host.ui.openPhoneBluSettingPage();
      //     }
      // },


      // {
      //     'name': '查看使用条款和隐私协议',
      //     'func': () => {
      //         const licenseURL = require('../Resources/raw/license_zh.html');
      //         const policyURL = require('../Resources/raw/privacy_zh.html');
      //         Host.ui.privacyAndProtocolReview('软件许可及服务协议', licenseURL, '隐私协议', policyURL);
      //     }
      // },
      // {
      //     'name': '授权使用条款和隐私协议',
      //     'func': () => {
      //         const licenseURL = require('../Resources/raw/license_zh.html');
      //         const policyURL = require('../Resources/raw/privacy_zh.html');
      //         let licenseKey = "license-" + Device.deviceID;
      //         Host.storage.get(licenseKey).then((res) => {
      //             // if (res === true) {
      //             //   // 表示已经授权过
      //             // } else {
      //             Host.ui.openPrivacyLicense('软件许可及服务协议', licenseURL, '隐私协议', policyURL).then((res) => {
      //                 if (res) {
      //                     // 表示用户同意授权
      //                     Host.storage.set(licenseKey, true).then((res) => { });
      //                 }
      //             }).catch((error) => {
      //                 console.log(error)
      //             })
      //             // }
      //         }).catch((error) => {

      //         });

      //     }
      // }
    ];
  }






  UNSAFE_componentDidMount() {

  }
  UNSAFE_componentWillMount() {

    // Device.getBluetoothLE()
    //     .connect(5, { peripheralID: "1-a-b-3-c", timeout: 12000 })
    //     .then(ble => {
    //         console.log(res);
    //     }).catch(err => {
    //         console.log(err);
    //     });
  }

  UNSAFE_componentWillUnmount() {


    // if (bt.isConnected) {
    //     bt.disconnect();
    //     console.log('disconnect');
    // }
    // this._s1.remove();
    // this._s2.remove();
    // this._s3.remove();
    // this._s4.remove();
    // this._s5.remove();
    // this._s6.remove();
    // this._s7.remove();
    // this._s8.remove();

    // Bluetooth.checkBluetoothIsEnabled().then(result => {
    //     this.state.isEnable = result;
    //     if (result) {
    //         console.log("蓝牙已开启:", result)
    //         this.startScan();
    //     } else {
    //         console.log("蓝牙未开启，请检查开启蓝牙后再试")
    //         Host.ui.showBLESwitchGuide();
    //     }
    // });

  }

  render() {
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
        />
        {/* <Separator style={{ marginLeft: 0 }} /> */}
        {/* <ListView style={styles.list} dataSource={this.state.dataSource} renderRow={this._renderRow.bind(this)} /> */}
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

  _renderRow(rowData, sectionID, rowID) {

    return (
      <TouchableHighlight underlayColor="#838383" onPress={() => this._pressRow(rowID)}>
        <View>
          <View style={styles.rowContainer}>
            <Text style={styles.title}>{rowData}</Text>
            {/* <Image style={styles.subArrow} source={require("../Resources/sub_arrow.png")} /> */}
          </View>
          <View style={styles.separator}></View>

        </View >
      </TouchableHighlight >
    );
  }

  _pressRow(rowID) {
    // console.log("row" + rowID + "clicked!");
    this._menuData[rowID].func();
  }

  onShowDidButtonPress() {
    this.props.navigation.navigate('helloDeveloper');
  }

  showReactART() {
    this.props.navigation.navigate('helloReactART');
  }

  showActionSheet() {
    if (Host.isIOS)
      ActionSheetIOS.showActionSheetWithOptions({
        options: BUTTONS,
        destructiveButtonIndex: 1
      },
        (buttonIndex) => {

        });
  }
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
