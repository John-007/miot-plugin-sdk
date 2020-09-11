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
      powerString: '暂无数据'
    };

    this._createMenuData();

  }


  _createMenuData() {
    const { navigation } = this.props;
    this._menuData = [

      {
        'name': '设备自检',
        'func': () => {
          navigation.navigate('checkSelf', { 'title': '设备自检' });
        }
      }

    ];
  }


  componentDidMount() {

    console.log('设置state');
    this.setState = ({

      powerString: '1234%'
    });

  }
  UNSAFE_componentWillMount() {


    //请求：第一条事件
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
        var power = model['value'].substring(2, 4)
        console.log(this.hex2int(power));
        // var powerInt = this.hex2int(power)
        this.setState = ({
          powerString: '1234%'
        });
      }

    }).catch((err) => {
      console.log(err);
    });

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

    return a.reduce(function (acc, c) {
      acc = 16 * acc + c;
      return acc;
    }, 0);
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
        // containerStyle={{ height: 44 }}
        />
        <ListItem
          title="电池寿命"
          value={this.state.powerString}
          containerStyle={{ height: 44, backgroundColor: 'white' }}
          titleStyle={{ fontSize: 16 }}
          valueStyle={{ fontSize: 14 }}
          separator={<Separator />}
          hideArrow={true}
          onPress={() => {
            console.log('设置电量')
            this.setState = ({
              powerString: '1234%'
            })
          }}
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
