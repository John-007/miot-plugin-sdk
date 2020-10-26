import React from 'react';
import {
  Easing,
  Animated,
  View,
  Image,
  Text,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Button
} from 'react-native';
import {
  AbstractDialog
} from 'miot/ui/Dialog';
import Card from 'miot/ui/Card';
import { Device, Package, Host, Entrance, Service, DeviceEvent, PackageEvent } from 'miot';
import NavigationBar from 'miot/ui/NavigationBar';


/**
 * 蓝牙模块 通用api使用
 */
export default class MainPage extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { titleProps } = navigation.state.params || {};
    if (!titleProps) return { header: null };
    return {
      header: <NavigationBar {...titleProps} />
    };
  };

  constructor(props) {
    super(props);


    this.spinValue = new Animated.Value(0)

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
              this.props.navigation.navigate('moreMenu', { title: '设置', checkSelfSwitchOn: this.state.checkSelfSwitchOn });
            }
          }
        ]
      }
    });
  }




  UNSAFE_componentWillUnmount() {
    // this._deviceOnlineListener && this._deviceOnlineListener.remove();
    // msgSubscription && msgSubscription.remove();

    // this._deviceNameChangedListener.remove();
    // //add by matao begin bug id QINGMI-21 20190523
    // if (this.msgSubscription) {
    //     this.msgSubscription.remove()
    // }

    this.subcription.remove();
    this.deviceReceivedMessages.remove();


  }

  UNSAFE_componentWillMount() {

    this.spin();

    console.log(Math.round(Date.now() / 1000));


    // 监听：烟雾事件
    Device.getDeviceWifi().subscribeMessages("event.13").then((subcription) => {
      this.subcription = subcription;
      // console.log('event.13成功添加监听');
    }).catch((error) => {
      console.log(error);
    });


    // 接收监听事件
    this.deviceReceivedMessages = DeviceEvent.deviceReceivedMessages.addListener(
      (device, map, data) => {
        // alert(data[0]['key'] + ' ' + data[0]['value']);
        console.log('Device.addListener', device, map, data);
        if (data[0].hasOwnProperty('value')) {
          let timeMap = this.formatDate(data[0]['time']);
          this.setState({
            deviceStatus: data[0]['value'],

            recentLog: `${this.judgeDate(timeMap['date'])}  ${timeMap['time']}  ${this.subtitleString(data[0]['value'])}`
          });
        }
      });


    // 请求：第一条事件
    Service.smarthome.getDeviceData({
      did: Device.deviceID,

      type: "event",
      key: "13", // Object ID 0x1004 温度 电量4106 烟感4117    
      time_start: 0,
      time_end: Math.round(Date.now() / 1000),
      limit: 1
    }).then((res) => {

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




    // 获取自检提醒开关
    Service.storage.getThirdUserConfigsForOneKey(Device.model, 200).then((res) => {

      if (res.hasOwnProperty('data') && res['data'] === 'true') {
        this.judgeCheckSelf();
      }

    }).catch((error) => {
      console.log("error", error);
    });

  }

  //旋转方法
  spin = () => {
    this.spinValue.setValue(0)
    Animated.timing(this.spinValue, {
      toValue: 1, // 最终值 为1，这里表示最大旋转 360度
      duration: 4000,
      easing: Easing.linear
    }).start(() => this.spin())
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

        console.log("时间相差：", date1, date2, date);

        if (date > 30 && date1 > 10) {
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
      return '烟雾报警';
    } else if (typeString == '02') {
      return '设备故障';
    } else if (typeString == '03') {
      return '设备自检';
    } else if (typeString == '04') {
      return '模拟报警';
    }

  }

  formatDate(rawDate) {

    let date = new Date(parseInt(rawDate) * 1000);
    if (date.length == 13) {
      date = new Date(parseInt(rawDate));
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

    const spin = this.spinValue.interpolate({
      inputRange: [0, 1],//输入值
      outputRange: ['0deg', '360deg'] //输出值
    })

    return (

      // <View style={{
      //   flex: 1,
      //   justifyContent: "center"
      // }}>
      //   <Animated.Image style={[styles.statusImage, { transform: [{ rotate: spin }] }]} source={image} />
      //   {this.state.deviceStatus == '01' ? this._createAlarmText() : <Text></Text>}
      // </View>

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
        }}>烟雾触发报警</Text>
        <Text style={{
          marginTop: 5,
          fontSize: 15,
          color: '#fff'
        }}>请及时检查家庭情况</Text>

      </View >
    );
  }

  // 生成卡片
  createCard = (cardProps = {}) => {

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
          // source={require("../resources/back.png")}
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
              this.createCard({
                mainTitleStr: '日志',
                subTitleStr: this.state.recentLog,
                // iconImg: require("../resources/Home_LogIcon_Normal.png")
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
              this.createCard({
                mainTitleStr: '智能场景',
                // iconImg: require("../resources/Home_Scenes_Normal.png")
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


      </View >

    );
  }

}

const styles = StyleSheet.create({
  statusImage: {
    marginTop: 50,
    width: 250,
    height: 250
  },

  innerTitle: {
    fontSize: 16,
    color: '#000'
  },
  innersubTitle: {
    fontSize: 14,
    color: '#333'
  },
  circle: {
    flex: 1,
    justifyContent: "center"
  }
});



