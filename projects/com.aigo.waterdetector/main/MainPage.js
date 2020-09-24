import React from 'react';
import { API_LEVEL, Package, Host, Service, SceneType, Device, DeviceEvent, PackageEvent } from 'miot';
import { View, Text, ImageBackground, Image, StyleSheet } from 'react-native';
import NavigationBar from 'miot/ui/NavigationBar';
import Separator from 'miot/ui/Separator';
import Card from 'miot/ui/Card';
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
      recentLog: '暂无日志'
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

  componentDidMount() {

  }

  UNSAFE_componentWillMount() {

    this.packageAuthorizationAgreed = PackageEvent.packageAuthorizationAgreed.addListener(() => {
      // 隐私弹窗-用户点击同意
      console.log('user agree protocol...');
    });


    //监听：水浸事件
    Device.getDeviceWifi().subscribeMessages("event.12").then((subcription) => {
      this.subcription = subcription;
      console.log('event.12成功添加监听');
    }).catch((error) => {

    });


    //接收监听事件
    this.deviceReceivedMessages = DeviceEvent.deviceReceivedMessages.addListener(
      (device, map, data) => {

        console.log('接收监听事件');
        // alert(data[0]['value'] + ' ' + this.state.deviceStatus);
        // console.log('Device.addListener', device, map, data);
        // console.log(data[0]['value'] + ' ' + this.state.deviceStatus);
        if (data[0].hasOwnProperty('value')) {
          let timeMap = this.formatDate(data[0]['time']);
          this.setState({
            deviceStatus: data[0]['value'],
            recentLog: this.judgeDate(timeMap['date']) + '  ' + timeMap['time'] + '  ' + this.subtitleString(data[0]['value'])
          });
        }
      });

    // 请求：第一条事件
    // Object ID 水浸事件12（）   水浸属性4116
    // 浸没状态		已浸没（0x01）、未浸没（0x00）
    // 水浸事件		水浸报警（0x01）、水浸报警解除（0x00）


    // console.log(Device.deviceID);
    // Service.smarthome.getDeviceData({
    //   did: Device.deviceID,

    //   type: "prop",
    //   key: "4116",
    //   // type: "event",
    //   // key: "12",
    //   time_start: 0,
    //   time_end: Math.round(Date.now() / 1000),
    //   limit: 1
    // }).then((res) => {

    //   console.log(res);
    //   // const model = res[0];
    //   // if (model.hasOwnProperty("value")) {
    //   //   let timeMap = this.formatDate(model['time']);
    //   //   this.setState({
    //   //     recentLog: this.judgeDate(timeMap['date']) + '  ' + timeMap['time'] + '  ' + this.subtitleString(model['value'])
    //   //   });
    //   // }
    // }).catch((err) => {
    //   console.log(err);
    // });


    //属性的设置与获取
    // Service.smarthome.setDeviceData({
    //   did: Device.deviceID,
    //   uid: Device.ownerId,
    //   type: "prop",
    //   key: "4106",
    //   value: "10",
    //   time: Math.round(Date.now() / 1000)
    // }).then((res) => {

    //   console.log(res);

    // }).catch((err) => {
    //   console.log(err);
    // });

    // let params = {
    //   'did': Device.deviceID,
    //   'props': {
    //     "event.s_selfCheck": "123"
    //   }
    // }
    // Service.smarthome.batchSetDeviceDatas([params]).then((res) => {

    //   console.log('batchSetDeviceDatas');
    //   console.log(res);

    // })



    // Service.smarthome.batchGetDeviceDatas(
    //   [{ did: Device.deviceID, props: ["event.s_selfCheck", "selfCheck", "12"] }]
    // ).then((res) => {

    //   console.log('batchGetDeviceDatas');
    //   console.log(res);
    // }).catch({});


    // let eventName = 'selfCheck';
    // let params = { 'key1': 'value1', 'key2': 'value2', 'tip': 'tips' };
    // Service.smarthome.reportEvent(eventName, params)


    let params = {
      'did': Device.deviceID,
      'props': {
        "prop.s_synchronizedAlarm": "true"
      }
    }
    Service.smarthome.batchSetDeviceDatas([params]).then((res) => {

      console.log('batchSetDeviceDatas');
      console.log(res);

    })


    Service.smarthome.batchGetDeviceDatas(
      [{ did: Device.deviceID, props: ["prop.s_synchronizedAlarm", "4106"] }]
    ).then((res) => {

      console.log('batchGetDeviceDatas');
      console.log(res);
    }).catch({});

    //结束




    // const setting = {
    //   // onMethod: 'method_name', //咨询硬件工程师,指硬件端，打开开关的方法。miot-spec下，一般为：set_properties
    //   // on_param: 'param', //咨询硬件工程师，指硬件端，打开开关应该传入的参数。miot-spec下，一般为：[{did,siid,piid,value}]
    //   // off_method: 'method_name', //咨询硬件工程师，指硬件端，关闭开关的方法。miot-spec下，一般为：set_properties
    //   // off_param: 'param', //咨询硬件工程师，关闭开关应该传入的参数。 miot-spec下，一般为：[{did,siid,piid,value}]
    // }
    // const scene = Service.scene.createScene(Device.deviceID, SceneType.Automatic, {
    //   identify: 'identify',
    //   name: 'myTimer',
    //   setting: setting
    // });

    // Service.scene.loadScenes(Device.deviceID, SceneType.Automatic).then((scenes) => {
    //   console.log('scenes', scenes)
    //   if (scenes && scenes.length > 0) {
    //     let scene = {
    //       sceneID: scenes[0].sceneID,
    //       createTime: scenes[0].createTime,
    //       status: scenes[0].status,
    //       name: scenes[0].name,
    //       type: scenes[0].type,
    //     }
    //     alert(JSON.stringify(scene))
    //   } else {
    //     alert("该设备没有自动场景")
    //   }
    // }).catch((error) => {
    //   console.log('error', error)
    // })
    // console.log('sceneID' + Device.authorizedDeviceIDs);


    // Device.isNew().then((res) => {

    //   console.log('isNew');
    //   console.log(res);

    // }).catch((err) => {

    //   console.log(err);
    // });



    // Service.smarthome.getDeviceData({
    //   did: Device.deviceID,

    //   // type: "prop",
    //   // key: "synchronizedAlarm",
    //   type: "event",
    //   key: "12",
    //   time_start: 0,
    //   // time_end: Math.round(Date.now() / 1000),
    //   time_end: Math.round(Date.now()),
    //   limit: 1
    // }).then((res) => {

    //   console.log('getDeviceData');
    //   console.log(res);

    // }).catch((err) => {
    //   console.log(err);
    // });


    Service.smarthome.getDeviceData({
      did: Device.deviceID,

      // type: "prop",
      // key: "synchronizedAlarm",
      type: "event",
      key: "12",
      time_start: 0,
      time_end: Math.round(Date.now() / 1000),
      // time_end: Math.round(Date.now()),
      limit: 1
    }).then((res) => {

      console.log('getDeviceData');
      console.log(res);
      const model = res[0];

      if (model.hasOwnProperty("value")) {

        let timeMap = this.formatDate(model['time']);

        this.setState({

          recentLog: this.judgeDate(timeMap['date']) + '  ' + timeMap['time'] + '  ' + this.subtitleString(model['value'])
        });
      }

    }).catch((err) => {
      console.log(err);
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

    var typeString = typeStr
    if (typeString.length > 2) {

      typeString = typeString.substring(2, 4)
    }

    if (typeString == '00') {
      return '工作正常'
    } else if (typeString == '01') {
      return '水浸报警'
    } else if (typeString == '02') {
      return '设备故障'
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


      </View>
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

    var cellStatusImage = '';
    var cellLogIconImage = '';
    var cellScenesIconImage = '';
    let bgNormalImage = require('../resources/images/Home_BG_Normal.jpg');

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

          source={bgNormalImage}>

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



