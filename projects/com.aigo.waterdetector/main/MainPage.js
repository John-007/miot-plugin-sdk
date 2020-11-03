import React from 'react';
import { API_LEVEL, Package, Host, Service, SceneType, Device, DeviceEvent, PackageEvent } from 'miot';
import { View, Text, ImageBackground, Image, StyleSheet } from 'react-native';
import NavigationBar from 'miot/ui/NavigationBar';
import Separator from 'miot/ui/Separator';
import Card from 'miot/ui/Card';

//全局方法
import { formatDate, judgeDate } from './Global'

/**
 * SDK 提供的多语言 和 插件提供的多语言
 */
import { strings as SdkStrings, Styles as SdkStyles } from 'miot/resources';
import PluginStrings from '../resources/strings';
/**
 * SDK 支持的字体
 */
import * as SdkFontStyle from 'miot/utils/fonts';
import { Switch } from 'react-native';


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
      recentLog: PluginStrings.noLogs
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


    // 监听：水浸事件
    Device.getDeviceWifi().subscribeMessages("event.12").then((subcription) => {
      this.subcription = subcription;
      console.log('event.12成功添加监听');
    }).catch((error) => {

    });


    // 接收监听事件
    this.deviceReceivedMessages = DeviceEvent.deviceReceivedMessages.addListener(
      (device, map, data) => {

        console.log('接收监听事件');

        if (data[0].hasOwnProperty('value')) {
          let timeMap = formatDate(data[0]['time']);
          // let timeMap = new GlobalFunction().formatDate(data[0]['time']);
          // let timeMap = this.formatDate(data[0]['time']);
          this.setState({
            deviceStatus: data[0]['value'],

            recentLog: `${judgeDate(timeMap['date'])}  ${timeMap['time']}  ${this.subtitleString(data[0]['value'])}`
          });
        }
      });

    // 请求：第一条事件
    // Object ID 水浸事件12（）   水浸属性4116
    // 浸没状态		已浸没（0x01）、未浸没（0x00）
    // 水浸事件		水浸报警（0x01）、水浸报警解除（0x00）

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

        // let timeMap = this.formatDate(model['time']);
        let timeMap = formatDate(model['time']);

        this.setState({
          recentLog: `${judgeDate(timeMap['date'])}  ${timeMap['time']}  ${this.subtitleString(model['value'])}`
        });
      }

    }).catch((err) => {
      console.log(err);
    });



  }

  //状态文字处理
  subtitleString(typeStr) {

    let typeString = typeStr;
    if (typeString.length > 2) {

      typeString = typeString.substring(2, 4);
    }

    if (typeString == '00') {
      return PluginStrings.workNormally;
    } else if (typeString == '01') {
      return PluginStrings.floodAlarm;
    } else if (typeString == '02') {
      return PluginStrings.deviceFailure;
    }

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

    let cellStatusImage = '';
    let cellLogIconImage = '';
    let cellScenesIconImage = '';
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
                mainTitleStr: PluginStrings.logs,
                subTitleStr: this.state.recentLog,
                iconImg: cellLogIconImage
              })
            }

            onPress={() => {
              navigation.navigate('deviceLog', { title: PluginStrings.logs });

            }}
          />
          < Card
            underlayColor="rgba(0,0,0,.05)"
            cardStyle={{ borderRadius: 10, height: 70 }}
            innerView={
              this._createCard({
                mainTitleStr: PluginStrings.smartScene,
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



