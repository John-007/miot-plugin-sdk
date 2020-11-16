

import React from 'react';

import {
  AbstractDialog
} from 'miot/ui/Dialog';
// import AbstractDialog from "./AbstractDialog";
import { Bluetooth, BluetoothEvent, Device, DeviceEvent, Host } from "miot";
import { Button, Image, Text, View } from 'react-native';

import Service from 'miot/Service';
import PluginStrings from '../../resources/strings';

// 此ble对象，即为IBluetooth对象或者IBluetoothLock对象

let bt = Device.getBluetoothLE();
let macStr = '';
let peripheralIDStr = '';
// uuids for testing.
const UUID_SERVICE = 'FE95';
const UUID_LED_READ_WRITE = '0010';
const UUID_BUTTON_READ_WRITE_NOTIFY = '0017';


const CheckStatusView = (props) => {

  return (
    <View
      style={{
        flex: 1,

        alignItems: 'center',
        justifyContent: "center"
      }}>
      <Image
        style={{
          width: 100,
          height: 100
          // marginRight: 10
        }}
        source={require("../../resources/images/CheckSelf_Smoke.png")}
        resizeMode="contain"
      />
      <Text
        style={{
          // justifyContent: "center",

          // width: 240,
          // height: 240,
          marginTop: 20,
          fontSize: 16
          // color: '#32BAC0'
        }}
        numberOfLines={0}
        ellipsizeMode="tail"
        accessible={false}
      >{props.text}</Text>



    </View>
  );
};

export default class CheckSelf extends React.Component {


  constructor(props, context) {
    super(props, context);
    const sctype = props.navigation.state.params.sc_type === undefined ? 0 : props.navigation.state.params.sc_type;
    this.state = {

      chars: {},
      services: [],
      checkStatus: PluginStrings.bleStr11,
      visible0: false,
      buttonVisible: false
    };
  }

  componentWillUnmount() {

    this.setState = (state, callback) => {
      return;
    };

    clearTimeout(this.timeoutID);

    if (bt.isConnected) {
      bt.disconnect();
      console.log('disconnect');
    }
    this._s1.remove();
    this._s2.remove();
    this._s3.remove();
    this._s4.remove();
    this._s5.remove();
    this._s6.remove();
    this._s7.remove();
    this._s8.remove();

  }

  UNSAFE_componentWillMount() {

    console.log("UUID", bt.UUID);
    console.log("deviceID", Device.deviceID);
  }

  componentDidMount() {

    console.log(bt.UUID);
    console.log(bt.isConnected);
    console.log(bt.isConnecting);
    let btMac = bt.mac;
    let strs = new Array(); // 定义一数组
    this.addLog(`JLDebug ----- btMac${ JSON.stringify(btMac) }`);
    strs = btMac.split(":"); // 字符分割
    macStr = strs[5] + strs[4] + strs[3] + strs[2] + strs[1] + strs[0];



    // 1秒后执行callback, 只会执行一次
    const timeoutID = setTimeout(() => {

      // //执行
      // alert("1秒时间到了，开始执行");

      console.log('3秒时间到了，开始执行');
      this.setState({
        checkStatus: PluginStrings.bleStr1
      });

      this.connect();
      // 清除
      clearTimeout(timeoutID);

    }, 1000 * 3);




    Bluetooth.checkBluetoothIsEnabled().then((result) => {

      if (result) {
        this.setState({
          checkStatus: PluginStrings.bleStr2
        });

      } else {
        // this.addLog('蓝牙未开启，请检查开启蓝牙后再试');
        this.setState({
          checkStatus: PluginStrings.bleStr3
        });
      }
    });

    this._s5 = BluetoothEvent.bluetoothStatusChanged.addListener((isOn) => {
      // console.log('bluetoothStatusChanged', isOn);
      // this.addLog('蓝牙状态发生变化 ： ' + JSON.stringify(isOn));
      if (!isOn) {

      } else {

      }
      this.setState({
        checkStatus: isOn ? PluginStrings.bleStr4 : PluginStrings.bleStr5
      });
    });

    this._s7 = BluetoothEvent.bluetoothDeviceDiscovered.addListener((result) => {
      // this.addLog('发现设备' + JSON.stringify(result));
      // this.addLog(`发现设备${result.peripheral.name}`);

      if (result.advertisementData.kCBAdvDataServiceData.hasOwnProperty("FE95")) {
        let deviceServerDataStr = result.advertisementData.kCBAdvDataServiceData['FE95'];
        this.addLog(`发现设备${ deviceServerDataStr }`);

      }


      if (result.mac === bt.mac) {

        // this.addLog('发现设备' + JSON.stringify(result));
        // this.connect(result.mac);
        this.connect();
      }
      // else {
      //     this.addLog("初次发现设备" + JSON.stringify(result))
      //     //普通蓝牙设备的连接必须在扫描到设备之后手动创建 ble 对象
      //     bt = Bluetooth.createBluetoothLE(result.uuid || result.mac);//android 用 mac 创建设备，ios 用 uuid 创建设备
      //     Bluetooth.stopScan();
      //     this.connect();
      // }
    });
    this._s1 = BluetoothEvent.bluetoothSeviceDiscovered.addListener((blut, services) => {
      if (services.length <= 0) {
        return;
      }
      console.log('bluetoothSeviceDiscovered', blut.mac, services.map((s) => s.UUID), bt.isConnected);
      this.addLog(`发现蓝牙服务更新：${ JSON.stringify(services.map((s) => s.UUID)) }`);

      const s = services.map((s) => ({ uuid: s.UUID, char: [] }));
      this.setState({ services: s });
      if (bt.isConnected) {
        this.addLog('开始扫描特征值');
        services.forEach((s) => {
          this.state.services[s.UUID] = s;
          s.startDiscoverCharacteristics();
        });
      }
      Device.getBluetoothLE().getVersion(true, true).then((version) => {
        Device.getBluetoothLE().securityLock.decryptMessageWithToken(version).then((data) => {
          this.addLog(`设备版本为：${ version }, 解析结果：${ JSON.stringify(data) }`);
        });
      }).catch((err) => {
        // console.log(err, '-------');
      });
    });
    this._s2 = BluetoothEvent.bluetoothCharacteristicDiscovered.addListener((bluetooth, service, characters) => {
      console.log('bluetoothCharacteristicDiscovered', characters.map((s) => s.UUID), bt.isConnected);
      this.addLog(`${ service.UUID } 蓝牙特征值已扫描成功${ JSON.stringify(characters.map((s) => s.UUID)) }`);
      const { services } = this.state;
      services.forEach((s) => {
        if (s.uuid === service.UUID) {
          s.char = characters.map((s) => s.UUID);
        }
      });
      this.setState({ services });
      if (bt.isConnected) {
        characters.forEach((c) => {
          this.state.chars[c.UUID] = c;
        });

        console.log('jl--连接成功');
        this.setState({ checkStatus: PluginStrings.bleStr6, buttonVisible: true });
      }


    });
    this._s3 = BluetoothEvent.bluetoothCharacteristicValueChanged.addListener((bluetooth, service, character, value) => {
      // if (service.UUID.indexOf('ffd5') > 0) {
      //   console.log('bluetoothCharacteristicValueChanged', character.UUID, value);// 刷新界面
      // }
      // if (character.UUID.toUpperCase() === UUID_BUTTON_READ_WRITE_NOTIFY) {
      //   this.addLog(`收到原始回复：${value}`);
      //   bt.securityLock.decryptMessage(value).then((res) => {
      //     this.addLog(`解密之后回复：${res}`);
      //   });
      // }


      if (service.UUID.indexOf('FE95') > 0) {
        console.log('bluetoothCharacteristicValueChanged', character.UUID, value);// 刷新界面
      }
      if (character.UUID.toUpperCase() === UUID_LED_READ_WRITE) {
        this.addLog(`收到原始回复：${ value }`);
        bt.securityLock.decryptMessage(value).then((res) => {
          this.addLog(`解密之后回复：${ res }`);
        });
      }
      this.addLog(`bluetoothCharacteristicValueChanged:${ character.UUID }>${ value }`);
    });
    this._s4 = BluetoothEvent.bluetoothSeviceDiscoverFailed.addListener((blut, data) => {
      console.log('bluetoothSeviceDiscoverFailed', data);
      //   this.setState({ buttonText: 'bluetoothSeviceDiscoverFailed :' + data });
    });
    this._s5 = BluetoothEvent.bluetoothCharacteristicDiscoverFailed.addListener((blut, data) => {
      console.log('bluetoothCharacteristicDiscoverFailed', data);
      //   this.setState({ buttonText: 'bluetoothCharacteristicDiscoverFailed:' + data });
    });
    this._s6 = BluetoothEvent.bluetoothConnectionStatusChanged.addListener((blut, isConnect) => {
      console.log('bluetoothConnectionStatusChanged', blut, isConnect);
      if (bt.mac === blut.mac) {
        this.setState({ checkStatus: isConnect ? PluginStrings.bleStr7 : PluginStrings.bleStr8 });
        this.addLog(`蓝牙${ JSON.stringify(blut) }状态变化${ isConnect }`);
        this.addLog('蓝牙连接已断开');
        if (!isConnect) {
          this.setState({
            checkStatus: PluginStrings.bleStr9,
            testCharNotify: false,
            btConnect: false,
            chars: {},
            services: []
          });
          this.connect();
        }
      }
    });
    this._s8 = DeviceEvent.bleDeviceFirmwareNeedUpgrade.addListener((device) => {
      this.addLog(`bleDeviceFirmwareNeedUpgrade ${ device.needUpgrade },${ device.latestVersion },${ device.lastVersion }`);
    });
  }




  addLog(string) {
    // let { log } = this.state;
    // log = string + '\n' + log;
    // this.setState({ log });
    console.log(string);
  }


  connect(mac = undefined, disconnectOntimeOut = true) {
    // if (Host.isAndroid) {
    //   Bluetooth.stopScan(15000);
    // }
    Bluetooth.stopScan();
    // this.setState({ blueConnecting: true, connectState: '连接中。。。' });
    this.addLog(`准备开始蓝牙连接${ bt.isConnected }${ bt.isConnecting }`);
    if (bt.isConnected) {
      // this.addLog('开始搜索');
      // console.log();
      // this.addLog('蓝牙设备已经连接');
      this.addLog('开始发现服务');
      // this.setState({ blueConnecting: false, connectState: '已连接', btConnect: true });
      bt.startDiscoverServices();
    } else if (bt.isConnecting) {
      this.addLog('蓝牙正处于连接中，请等待连接结果后再试');
    } else {
      // const that = this;

      // // this.addLog('' + Host.isAndroid);
      // if (Host.isAndroid && mac === undefined) {

      //   // this.setState({ blueConnecting: true, connectState: '扫描设备中' + bt.mac });
      //   // Bluetooth.startScan()peripheralID
      //   Bluetooth.startScan(15000);
      //   return;
      // }



      // this.addLog('JLDebug ----- peripheralID：' + mac);
      bt.connect(4, { did: Device.deviceID, timeout: 12000 })
        // bt.connect(4, { peripheralID: '2269360F-2F82-8DD9-AB33-4154EDDACA88', timeout: 12000 })
        // bt.connect(4, { peripheralID: mac, timeout: 120000 })
        // bt.connect(4)
        .then((ble) => {

          bt.startDiscoverServices();
          this.addLog(`JLDebug ----- 连接成功${ JSON.stringify(ble) }`);
        })
        .catch((err) => {

          this.setState({ checkStatus: PluginStrings.bleStr10 });
          this.addLog(`JLDebug ----- 连接err${ JSON.stringify(err) }`);
        });
    }
  }

  enableNotify(val) {
    if (!bt.isConnected || this.state.services.length <= 0) {
      this.addLog('蓝牙尚未连接或者service未发现');
      return Promise.reject('蓝牙尚未连接或者service未发现');
    }
    this.addLog(`switch${ val }`);
    // bt.getService(UUID_SERVICE).getCharacteristic(UUID_BUTTON_READ_WRITE_NOTIFY).setNotify(val)
    bt.getService(UUID_SERVICE).getCharacteristic(UUID_LED_READ_WRITE).setNotify(val)

      .then((res) => {
        this.setState({ testCharNotify: val });
        this.addLog(`${ val ? '开启' : '关闭' }特征值通知成功`);
      })
      .catch((err) => {
        this.setState({ testCharNotify: !val });
        this.addLog(`${ val ? '开启' : '关闭' }特征值通知失败：${ JSON.stringify(err) }`);
      });
  }

  sendTestText() {
    if (!bt.isConnected || this.state.services.length <= 0) {
      this.addLog('蓝牙尚未连接或者service未发现');
      return;
    }
    // if (!this.state.testCharNotify) {
    //   this.addLog('蓝牙通知尚未开启，请点击 开启数据交互 之后尝试写入测试数据');
    //   return;
    // }
    // let text = this.state.testEncrptText;
    // if (text === '' || text === undefined) {
    //   text = '01010101';
    // }


    bt.getService(UUID_SERVICE).getCharacteristic(UUID_BUTTON_READ_WRITE_NOTIFY).setNotify(true);




    // let text = 'ZIJIAN';
    let text = '5A494A49414E';
    bt.getService(UUID_SERVICE).getCharacteristic(UUID_LED_READ_WRITE).writeWithoutResponse(text);
    this.addLog('自检发送完成');
    //  -1: 自动判断，0: 普通小米蓝牙协议设备，1: 安全芯片小米蓝牙设备（比如锁类产品），2: 分享的安全芯片小米蓝牙设备，3: 普通的BLE蓝牙设备(无 mibeacon，无小米 FE95 service)， 4: Standard Auth 标准蓝牙认证协议(通常2019.10.1之后上线的新设备，使用的都是该蓝牙协议，具体详情可以与设备端开发沟通)
    // if (this.state.scType === 0) {
    //   this.addLog('使用Token加密传输，' + text);
    //   bt.securityLock.encryptMessageWithToken(text).then(res => {
    //     const { result } = res;
    //     bt.getService(UUID_SERVICE).getCharacteristic(UUID_LED_READ_WRITE).writeWithoutResponse(result);
    //   })
    //     .then(res => {
    //       this.addLog('write res: ' + JSON.stringify(res));
    //     })
    //     .catch(err => {
    //       this.addLog('write error: ' + JSON.stringify(err));
    //     });
    // }
    // else {
    //   this.addLog('使用Session加密传输，' + text);
    //   bt.securityLock.encryptMessage(text)
    //     .then(hex => {
    //       bt.getService(UUID_SERVICE).getCharacteristic(UUID_LED_READ_WRITE).writeWithoutResponse(hex);
    //     })
    //     .then(res => {
    //       this.addLog('write res: ' + JSON.stringify(res));
    //     })
    //     .catch(err => {
    //       this.addLog('write error: ' + JSON.stringify(err));
    //     });
    // }
  }

  // `Modal` 隐藏了，父组件必须要同步更新状态，但不必用 `setState` 触发 `render`
  onDismiss(index) {


    this.setState({
      [`visible${ index }`]: false
    });


  }


  render() {
    const { navigation } = this.props;
    return (
      <View
        style={{
          flex: 1,
          // justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F7F7F7"
          // alignItems: 'center',
          // paddingVertical: 20
        }} >

        < CheckStatusView text={this.state.checkStatus} />



        <View style={{
          marginBottom: 0,

          height: 42,
          width: 327,
          borderRadius: 10

        }}>
          {
            this.state.buttonVisible ? (
              <Button
                style={{
                  // display: this.state.buttonVisible
                  display: false
                }}
                title={PluginStrings.bleBtnStr}
                color={'#32BAC0'}
                onPress={() => {
                  this.sendTestText();
                  this.setState({ visible0: true });
                }} />
            ) : (
              <View>

              </View>
            )
          }

        </View>

        <AbstractDialog
          visible={this.state.visible0}
          title={PluginStrings.isSuccess}
          buttons={[
            {
              text: PluginStrings.noStr,
              style: { color: '#757575' },
              callback: (_) => {

                this.setState({
                  visible0: false
                });
                navigation.navigate('checkSelfDone', { title: PluginStrings.selfCheckFail, status: false, navKey: this.props.navigation.state.key });
              }
            },
            {
              text: PluginStrings.yesStr,
              style: { color: '#32BAC0' },
              callback: (_) => {
                this.setState({
                  visible0: false
                });

                // 保存当前自检时间
                let date = new Date();
                let year = date.getFullYear().toString();
                let month = (date.getMonth() + 1).toString();
                let day = date.getDate().toString();

                console.log(`${ year }年${ month }月${ day }日`);

                Service.storage.setThirdUserConfigsForOneKey(Device.model, 100, month).then((res) => {
                  console.log("res", res);
                }).catch((error) => {
                  console.log("error", error);
                });

                navigation.navigate('checkSelfDone', { title: PluginStrings.selfCheckSuccess, status: true, navKey: this.props.navigation.state.key });
              }
            }
          ]}
          onDismiss={(_) => this.onDismiss('0')}>
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
        </AbstractDialog>


        < View
          style={{ height: 35 }}
        />

      </View >
    );
  }



}
