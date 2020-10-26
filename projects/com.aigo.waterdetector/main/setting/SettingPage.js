import React from 'react';
import { Service, Device } from 'miot';
import { View, ScrollView, PixelRatio, Text, StyleSheet } from 'react-native';
import { CommonSetting, SETTING_KEYS } from "miot/ui/CommonSetting";
import Separator from 'miot/ui/Separator';
import Protocol from '../../resources/protocol';
import { strings as SdkStrings, Styles as SdkStyles } from "miot/resources";
import { ListItem } from "miot/ui/ListItem";

export default class SettingPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      protocol: null,
      powerString: '暂无数据'
    };
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
  initCommonSettingParams() {
    this.commonSettingParams = {
      firstOptions: [
        SETTING_KEYS.first_options.SHARE,
        SETTING_KEYS.first_options.IFTTT,
        SETTING_KEYS.first_options.FIRMWARE_UPGRADE,
        SETTING_KEYS.first_options.MORE
      ],
      secondOptions: [
        SETTING_KEYS.second_options.TIMEZONE,
        SETTING_KEYS.second_options.SECURITY
      ],
      extraOptions: {
        option: "",
        showUpgrade: true, // 跳转到 sdk 提供的固件升级页面
        bleOtaAuthType: 4 // 蓝牙设备类型, 有哪些取值可以参考CommonSetting 注释
      }
    };
  }



  UNSAFE_componentWillMount() {
    this.initCommonSettingParams();
    this.initProtocol();

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
          powerString: `${this.hex2int(power)}%`
        });
      }

    }).catch((err) => {
      console.log(err);
    });
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

  initProtocol() {
    Protocol.getProtocol().then((protocol) => {
      this.setState({
        protocol: protocol
      });
    }).catch((error) => {
      // 错误信息上报， 通过米家app反馈可以上报到服务器
      Service.smarthome.reportLog(Device.model, `Service.getServerName error: ${JSON.stringify(error)}`);
    });
  }

  render() {


    if (!this.state.protocol) {
      return null;
    }

    this.commonSettingParams.extraOptions.option = this.state.protocol;


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
          title="电池寿命"
          value={this.state.powerString}
          hideArrow={true}
        // containerStyle={{ height: 44, backgroundColor: 'white' }}
        // titleStyle={{ fontSize: 16 }}
        // valueStyle={{ fontSize: 14 }}
        // separator={<Separator />}

        // onPress={() => {
        //   console.log('设置电量')
        //   this.setState({
        //     powerString: '1234%'
        //   });
        // }}
        />


        <View style={[styles.blank, { borderTopWidth: 0 }]} />

        <CommonSetting
          navigation={this.props.navigation} // 插件的路由导航，必填！！！
          firstOptions={firstOptions}
          secondOptions={secondOptions}
          extraOptions={this.commonSettingParams.extraOptions}
          containerStyle={{ marginTop: 24 }}
        />
      </ScrollView>
    );
  }

  openTimerSettingPageWithOptions() {
    let params = {
      onMethod: "power_on",
      onParam: "on",
      offMethod: "power_off",
      offParam: "off",
      timerTitle: "这是一个自定义标题",
      displayName: "自定义场景名称",
      identify: "identify_1",
      onTimerTips: '',
      offTimerTips: '定时列表页面、设置时间页面 关闭时间副标题（默认：关闭时间）',
      listTimerTips: '定时列表页面 定时时间段副标题（默认：开启时段）',
      bothTimerMustBeSet: false,
      showOnTimerType: true,
      showOffTimerType: false,
      showPeriodTimerType: false
    };
    Service.scene.openTimerSettingPageWithOptions(params);
  }

  openCountDownPage() {
    let params = {
      onMethod: "power_on",
      offMethod: 'power_off',
      onParam: 'on',
      offParam: 'off',
      identify: "custom",
      displayName: '自定义名称'
    };
    Service.scene.openCountDownPage(true, params);
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: SdkStyles.common.backgroundColor,
    flex: 1
  },
  separator: {
    height: 1 / PixelRatio.get(),
    backgroundColor: '#e5e5e5',
    marginLeft: 20
  },
  blank: {
    height: 8,
    backgroundColor: '#F7F7F7'
  },
  titleContainer: {
    height: 32,
    backgroundColor: '#fff',
    justifyContent: 'center'
  }
});

