import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Button
} from 'react-native';
import Card from 'miot/ui/Card';
import { Device, Package, Host, Entrance, Service, DeviceEvent, PackageEvent } from 'miot';
import NavigationBar from 'miot/ui/NavigationBar';

// logo页面
const radiusValue = 10;




export default class Home extends React.Component {

  static navigationOptions = ({ navigation }) => {
    return {

      headerTransparent: true
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      deviceStatus: '["00"]',
      recentLog: '暂无日志'
    };
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


  componentWillUnmount() {
    // this._deviceOnlineListener && this._deviceOnlineListener.remove();
    // msgSubscription && msgSubscription.remove();

    // this._deviceNameChangedListener.remove();
    // //add by matao begin bug id QINGMI-21 20190523
    // if (this.msgSubscription) {
    //     this.msgSubscription.remove()
    // }
  }

  componentWillMount() {


    console.log(Math.round(Date.now() / 1000));




    Service.smarthome.getDeviceData({
      did: Device.deviceID,
      type: "prop",
      // key: "4106",
      key: "4117",

      // type: "event",
      // key: "13", //Object ID 0x1004 温度 电量4106 烟感4117
      time_start: 0,
      time_end: Math.round(Date.now() / 1000),
      limit: 1
    }).then((res) => {
      console.log(res);

      if (res[0].hasOwnProperty("value")) {
        // this.setState({
        //   deviceStatus: res[0]['value']
        // })
      }

      // const a = res[0]

      // // console.log(a.hasOwnProperty("value"));
      // // console.log(a['value']);
      // if (a.hasOwnProperty("value")) {
      //     var power = a['value'].substring(2, 4)
      //     console.log(this.hex2int(power));
      //     var powerInt = this.hex2int(power)
      // }

      // else {

      // }
    }).catch((err) => {
      console.log(err);
    });


    // 请求数据
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

        switch (model['value']) {
          case '["00"]':
            this.setState({
              recentLog: '工作正常'
            });
            break;
          case '["01"]':
            this.setState({
              recentLog: '烟雾报警'
            });
            break;
          default: break;
        }


      }

    }).catch((err) => {
      console.log(err);
    });



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

        {this.state.deviceStatus == '["01"]' ? this._createAlarmText() : <Text></Text>}

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

    let cellStatusImage = '';
    let cellLogIconImage = '';
    let cellScenesIconImage = '';
    let bgNormalImage = require('../resources/Home_BG_Normal.jpg');
    let bgWarningImage = require('../resources/Home_BG_Warning.png');

    switch (this.state.deviceStatus) {
      case '["00"]':// 正常
        cellStatusImage = require('../resources/Home_StatusNormal.png');
        cellLogIconImage = require('../resources/Home_LogIcon_Normal.png');
        cellScenesIconImage = require('../resources/Home_Scenes_Normal.png');
        break;
      case '["01"]':// 报警
        cellStatusImage = require('../resources/Home_StatusAlarm.png');
        cellLogIconImage = require('../resources/Home_LogIcon_Alarm.png');
        cellScenesIconImage = require('../resources/Home_Scenes_Alarm.png');

        break;
      case '["02"]':// 故障
        cellStatusImage = require('../resources/Home_StatusBreakdown.png');
        cellLogIconImage = require('../resources/Home_LogIcon_Normal.png');
        cellScenesIconImage = require('../resources/Home_Scenes_Normal.png');
        break;
      default: break;
    }

    return (


      <View
        style={{
          flex: 1,
          // justifyContent: "center",
          // alignItems: "center",
          backgroundColor: "#F7F7F7"

          // alignItems: 'center',
          // paddingVertical: 20
        }} >
        {/* <StatusBar backgroundColor={'#eae9f1'} //状态栏背景颜色

          barStyle={'dark-content'} //状态栏样式（黑字）

        /> */}




        <ImageBackground style={{
          flex: 1,
          // justifyContent: "center",
          alignItems: "center"
          // width: null,
          // height: null,
        }}
        source={this.state.deviceStatus == '["01"]' ? bgWarningImage : bgNormalImage}>

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
  }
});