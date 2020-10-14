import React from 'react';
import { API_LEVEL, Package, Host, Device, DeviceEvent, PackageEvent, Service } from 'miot';
import { View, Text, Image, ImageBackground, StyleSheet } from 'react-native';
import NavigationBar from 'miot/ui/NavigationBar';
import {
  AbstractDialog
} from 'miot/ui/Dialog';

import Card from 'miot/ui/Card';

import Protocol from '../resources/protocol';

/**
 * SDK 提供的多语言 和 插件提供的多语言
 */
import { strings as SdkStrings, Styles as SdkStyles } from 'miot/resources';
import PluginStrings from '../resources/strings';
/**
 * SDK 支持的字体
 */
import * as SdkFontStyle from 'miot/utils/fonts';

export default class MainPage extends React.Component {

  /**
   * 页面内部自定义Header
   * @param navigation
   * @returns {{header: *}|{header: null}}
   */
  static navigationOptions = ({ navigation }) => {
    const { titleProps } = navigation.state.params || {};
    if (!titleProps) return { header: null };
    return {
      header: <NavigationBar {...titleProps} />
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      deviceStatus: '00',
      recentLog: '暂无日志',
      visibleRemindCheckSelf: false
    };

    this.initNavigationBar();
  }

  initNavigationBar() {
    this.props.navigation.setParams({
      titleProps: {
        title: Device.name,
        left: [
          {
            key: NavigationBar.ICON.BACK,
            onPress: () => {
              Package.exit();
            }
          }
        ],
        right: [
          {
            key: NavigationBar.ICON.MORE,
            onPress: () => {
              // 跳转到设置页
              this.props.navigation.navigate('SettingPage', { title: SdkStrings.setting });
            }
          }
        ]
      }
    });
  }
  UNSAFE_componentWillUnmount() {


    this.subcription.remove();
    this.deviceReceivedMessages.remove();
  }

  UNSAFE_componentWillMount() {
    this.packageAuthorizationAgreed = PackageEvent.packageAuthorizationAgreed.addListener(() => {
      // 隐私弹窗-用户点击同意
      console.log('user agree protocol...');
    });

    // 获取自检提醒开关
    Service.storage.getThirdUserConfigsForOneKey(Device.model, 200).then((res) => {

      if (res.hasOwnProperty('data') && res['data'] === 'true') {
        this.judgeCheckSelf();
      }

    }).catch((error) => {
      console.log("error", error);
    });



    // 监听：燃气事件
    Device.getDeviceWifi().subscribeMessages("event.14").then((subcription) => {
      this.subcription = subcription;
    }).catch((error) => {

    });


    // 接收监听事件
    this.deviceReceivedMessages = DeviceEvent.deviceReceivedMessages.addListener(
      (device, map, data) => {
        console.log(data);
        // alert(data[0]['value'] + ' ' + this.state.deviceStatus);
        // console.log('Device.addListener', device, map, data);
        // console.log(data[0]['value'] + ' ' + this.state.deviceStatus);
        if (data[0].hasOwnProperty('value')) {
          let timeMap = this.formatDate(data[0]['time']);
          this.setState({
            deviceStatus: data[0]['value'],
            recentLog: `${this.judgeDate(timeMap['date'])}  ${timeMap['time']}  ${this.subtitleString(data[0]['value'])}`
          });

        }
      });


    // 请求：第一条事件
    // Object ID 燃气事件14（）   气感4118
    // 燃气状态	有泄漏（0x01）、无泄漏（0x00）
    // 燃气事件	正常监测(0x00)、燃气泄漏报警(0x01)、设备故障(0x02)、传感器寿命到期(0x03)、传感器预热(0x04)


    Service.smarthome.batchGetDeviceDatas([{ did: Device.deviceID, props: ["prop.s_auth_config"] }]).then((res) => {
      let alreadyAuthed = true;
      let result = res[Device.deviceID];
      let config;
      if (result && result['prop.s_auth_config']) {
        config = result['prop.s_auth_config'];
      }
      if (config) {
        try {
          let authJson = JSON.parse(config);
          alreadyAuthed = authJson.privacyAuthed && true;
        } catch (err) {
          // json解析失败，不处理
        }
      } else {
        alreadyAuthed = false;
      }
      if (alreadyAuthed) {
        return;
      }

      // 需要弹出隐私弹出
      this.alertLegalInformationAuthorization();

    }).catch((error) => {
      Service.smarthome.reportLog(Device.model, `Service.smarthome.batchGetDeviceDatas error: ${JSON.stringify(error)}`);
    });


    Service.smarthome.getDeviceData({
      did: Device.deviceID,

      type: "event",
      key: "14",
      time_start: 0,
      time_end: Math.round(Date.now() / 1000),
      limit: 1
    }).then((res) => {

      console.log(res);

      const model = res[0];

      if (model.hasOwnProperty("value")) {

        let timeMap = this.formatDate(model['time']);

        this.setState({
          recentLog: `${this.judgeDate(timeMap['date'])}  ${timeMap['time']}  ${this.subtitleString(model['value'])}`
        });

      }
    }).catch((err) => {
      console.log(err);
    });

  }

  judgeCheckSelf() {

    // 获取上次自检时间
    Service.storage.getThirdUserConfigsForOneKey(Device.model, 100).then((res) => {

      // alert(JSON.stringify(res))

      console.log("res100", res);

      if (res.hasOwnProperty('data')) {


        let date1 = new Date(Number(res['data']));
        let date2 = new Date();
        let date = (date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24);

        console.log("事件对比", res['data']);
        if (date > 30) {
          // 弹窗提醒用户自检

          this.setState({
            visibleRemindCheckSelf: true
          });

        } else {
          console.log("30天内自检过");
        }


      }
    }).catch((error) => {
      console.log("error", error);
    });
  }

  alertCheckSelf() {

    console.log(333);
    Protocol.getProtocol().then((protocol) => {
      console.log(protocol);
      Host.ui.alertLegalInformationAuthorization(protocol).then((res) => {
        console.log(res);
        if (res === 'ok' || res === true || res === 'true') {
          Service.smarthome.batchSetDeviceDatas([{ did: Device.deviceID, props: { "prop.s_auth_config": JSON.stringify({ 'privacyAuthed': true }) } }]);
          PackageEvent.packageAuthorizationAgreed.emit();
        }
      }).catch((error) => {
        console.log(error);
        // 打开弹出过程中出现了意外错误, 进行上报
        Service.smarthome.reportLog(Device.model, `Host.ui.alertLegalInformationAuthorization error: ${JSON.stringify(error)}`);
      });
    }).catch((error) => {
      console.log(error);
      Service.smarthome.reportLog(Device.model, `Service.getServerName() error: ${JSON.stringify(error)}`);
    });

  }



  alertLegalInformationAuthorization() {

    Protocol.getProtocol().then((protocol) => {
      console.log(protocol);
      Host.ui.alertLegalInformationAuthorization(protocol).then((res) => {
        console.log(res);
        if (res === 'ok' || res === true || res === 'true') {
          Service.smarthome.batchSetDeviceDatas([{ did: Device.deviceID, props: { "prop.s_auth_config": JSON.stringify({ 'privacyAuthed': true }) } }]);
          PackageEvent.packageAuthorizationAgreed.emit();
        }
      }).catch((error) => {
        console.log(error);
        // 打开弹出过程中出现了意外错误, 进行上报
        Service.smarthome.reportLog(Device.model, `Host.ui.alertLegalInformationAuthorization error: ${JSON.stringify(error)}`);
      });
    }).catch((error) => {
      console.log(error);
      Service.smarthome.reportLog(Device.model, `Service.getServerName() error: ${JSON.stringify(error)}`);
    });

  }

  judgeDate(dateStr) {

    // 先判断是不是今天
    let nowDate = Date.parse(new Date());
    let nowDateStr = this.formatDate(parseInt(nowDate) / 1000);

    if (dateStr == nowDateStr['date']) {
      return '今天';
    }
    return dateStr;
  }

  subtitleString(typeStr) {

    let typeString = typeStr;
    if (typeString.length > 2) {

      typeString = typeString.substring(2, 4);
    }

    if (typeString == '00') {
      return '工作正常';
    } else if (typeString == '01') {
      return '燃气泄漏报警';
    } else if (typeString == '02') {
      return '设备故障';
    } else if (typeString == '03') {
      return '传感器寿命到期';
    } else if (typeString == '04') {
      return '传感器预热';
    } else if (typeString == '05') {
      return '设备自检';
    } else if (typeString == '06') {
      return '模拟报警';
    }

  }

  formatDate(date) {

    var date = new Date(parseInt(date) * 1000);
    if (date.length == 13) {
      date = new Date(parseInt(date));
    }

    let MM = (date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1);
    let DD = (date.getDate() < 10 ? `0${date.getDate()}` : date.getDate());
    let hh = `${date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()}:`;
    let mm = (date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes());
    // return MM + '月' + DD + '日' + '_' + hh + mm;
    return { 'date': `${MM}月${DD}日`, 'time': hh + mm };
  }


  // 创建状态页面
  _createStatusView(image) {

    return (

      <View
        style={{
          flex: 1,
          justifyContent: "center"
        }}>
        <Image
          style={styles.statusImage}
          source={image}
        />

        {this.state.deviceStatus == '01' ? this._createAlarmText() : <Text></Text>}

      </View>
    );
  }

  // 创建状态页面
  _createAlarmText() {

    return (

      <View
        style={{
          marginTop: 25,
          justifyContent: "center",
          alignItems: 'center'
        }}>
        <Text style={{
          fontSize: 17,
          color: '#fff'
        }}>燃气触发报警</Text>
        <Text style={{
          marginTop: 5,
          fontSize: 15,
          color: '#fff'
        }}>请及时检查家庭情况</Text>

      </View >
    );
  }

  // 生成卡片
  _createCard = (cardProps = {}) => {

    let showText = cardProps.subTitleStr != undefined ? <Text
      style={{
        marginTop: 6,
        fontSize: 14,
        color: '#999999'
      }}
      numberOfLines={1}
      ellipsizeMode="tail"
      accessible={false}
    >
      {cardProps.subTitleStr}
    </Text> : null;

    return (
      <View style={{
        flex: 1,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 20
      }} accessible={true}>
        <Image
          style={{
            width: 40,
            height: 40,
            marginRight: 15
          }}
          // source={require("../resources/images/back.png")}
          source={cardProps.iconImg}

          resizeMode="contain"
        />
        <View style={{
          flex: 1
        }}>
          <Text
            style={{
              fontSize: 16,
              color: '#000'
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
            accessible={false}
          >
            {cardProps.mainTitleStr}
          </Text>

          {showText}
        </View>
      </View >
    );
  }



  render() {

    const { navigation } = this.props;

    let cellStatusImage = require('../resources/images/Home_StatusNormal.png');
    let cellLogIconImage = require('../resources/images/Home_LogIcon_Normal.png');
    let cellScenesIconImage = require('../resources/images/Home_Scenes_Normal.png');
    let bgNormalImage = require('../resources/images/Home_BG_Normal.jpg');
    let bgWarningImage = require('../resources/images/Home_BG_Warning.png');

    if (this.state.deviceStatus == '00') {

      cellStatusImage = require('../resources/images/Home_StatusNormal.png');
      cellLogIconImage = require('../resources/images/Home_LogIcon_Normal.png');
      cellScenesIconImage = require('../resources/images/Home_Scenes_Normal.png');

    } else if (this.state.deviceStatus == '01') {

      cellStatusImage = require('../resources/images/Home_StatusAlarm.png');
      cellLogIconImage = require('../resources/images/Home_LogIcon_Alarm.png');
      cellScenesIconImage = require('../resources/images/Home_Scenes_Alarm.png');

    } else if (this.state.deviceStatus == '02') {

      cellStatusImage = require('../resources/images/Home_StatusBreakdown.png');
      cellLogIconImage = require('../resources/images/Home_LogIcon_Normal.png');
      cellScenesIconImage = require('../resources/images/Home_Scenes_Normal.png');

    } else if (this.state.deviceStatus == '03') {

      cellStatusImage = require('../resources/images/Home_StatusBreakdown.png');
      cellLogIconImage = require('../resources/images/Home_LogIcon_Normal.png');
      cellScenesIconImage = require('../resources/images/Home_Scenes_Normal.png');

    } else if (this.state.deviceStatus == '04') {

      cellStatusImage = require('../resources/images/Home_StatusWarmUp.png');
      cellLogIconImage = require('../resources/images/Home_LogIcon_Normal.png');
      cellScenesIconImage = require('../resources/images/Home_Scenes_Normal.png');

    }


    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F7F7F7"

        }} >




        <ImageBackground style={{
          flex: 1,
          // justifyContent: "center",
          alignItems: "center"
          // width: null,
          // height: null,
        }}
          source={this.state.deviceStatus == '01' ? bgWarningImage : bgNormalImage}>

          {this._createStatusView(cellStatusImage)}

          < Card
            underlayColor="rgba(0,0,0,.05)"
            cardStyle={{ borderRadius: 10, height: 70 }}
            innerView={
              this._createCard({
                mainTitleStr: '日志',
                subTitleStr: this.state.recentLog,

                // iconImg: require("../resources/images/Home_LogIcon_Normal.png")
                iconImg: cellLogIconImage
              })
            }


            onPress={() => {
              navigation.navigate('deviceLog', { title: '日志' });

            }}
          />
          < Card

            underlayColor="rgba(0,0,0,.05)"
            cardStyle={{ borderRadius: 10, height: 70 }}
            innerView={
              this._createCard({
                mainTitleStr: '智能场景',
                // iconImg: require("../resources/images/Home_Scenes_Normal.png")
                iconImg: cellScenesIconImage
              })
            }
            onPress={() => Service.scene.openIftttAutoPage()}
          />

          < View
            style={{ height: 35 }}
          />

        </ImageBackground>

        <AbstractDialog
          visible={this.state.visibleRemindCheckSelf}
          title={'温馨提示：建议您进行设备自检'}
          buttons={[
            {
              text: '好',
              style: { color: '#32BAC0' },
              callback: (_) => {
                this.setState({
                  visibleRemindCheckSelf: false
                });

                // 保存当前自检时间
                Service.storage.setThirdUserConfigsForOneKey(Device.model, 100, Number(new Date())).then((res) => {
                  console.log("res", res);
                }).catch((error) => {
                  console.log("error", error);
                });
              }
            }
          ]}
        // onDismiss={(_) => this.onDismiss('0')}
        >
          <View
            style={{
              flex: 1,
              height: 0.5,
              backgroundColor: '#D9D9D9',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* <Text>有蜂鸣声吗</Text> */}
          </View>
        </AbstractDialog >
      </View>
    );
  }

  componentWillUnmount() {
    // 取消监听
    this.packageAuthorizationAgreed && this.packageAuthorizationAgreed.remove();
  }
}

const styles = StyleSheet.create({
  statusImage: {
    marginTop: 50,
    width: 250,
    height: 250
  },
  container: {
    backgroundColor: SdkStyles.common.backgroundColor,
    flex: 1
  },
  textStyle: {
    fontSize: 16,
    lineHeight: 18,
    color: '#666666',
    marginBottom: 10
  },
  textStyle1: {
    fontSize: 20,
    lineHeight: 22,
    color: '#333333',
    fontFamily: SdkFontStyle.FontKmedium,
    marginBottom: 20
  }
});



// <View style={styles.container}>
//   <Separator />
//   <View style={{ marginTop: 20, justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
//     <Image
//       style={{ width: 350, height: 200 }}
//       source={require('../resources/images/welcome.png')} />
//   </View>