import React from 'react';
import { Service, Device } from 'miot';
import { View, ScrollView, PixelRatio, Text, StyleSheet } from 'react-native';
import { CommonSetting, SETTING_KEYS } from "miot/ui/CommonSetting";
import Separator from 'miot/ui/Separator';
import Protocol from '../../resources/protocol';
import { strings as SdkStrings, Styles as SdkStyles } from "miot/resources";
import { ListItem, ListItemWithSwitch } from "miot/ui/ListItem";

export default class SettingPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      protocol: null,
      powerString: '暂无数据',
      switchOn: ''
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
        showUpgrade: true,
        bleOtaAuthType: 4
      }
    };
  }

  UNSAFE_componentWillMount() {
    this.initCommonSettingParams();
    this.initProtocol();


    // 获取自检提醒开关
    Service.storage.getThirdUserConfigsForOneKey(Device.model, 200).then((res) => {

      // alert(JSON.stringify(res))
      console.log("res200", res);
      this.setState({
        switchOn: res['data'] === 'true' ? true : false
      });

    }).catch((error) => {
      console.log("error", error);
    });


    // 固件更新相关
    Service.smarthome.getLatestVersionV2(Device.deviceID).then((res) => {

      console.log(res);

    }).catch((err) => {
      console.log(err);
    });


    Device.getBluetoothLE().getVersion(true, true).then((version) => {
      Device.getBluetoothLE().securityLock.decryptMessageWithToken(version).then((data) => {
        console.log(`设备版本为：${ version }, 解析结果：${ JSON.stringify(data) }`);
      });
      console.log(version);
    }).catch((err) => {
      // console.log(err, '-------');
    });

    // Device.checkFirmwareUpdateAndAlert().then(res => {
    //   console.log(res);
    // }).catch(err => {
    //   console.log(err);
    // })
  }

  initProtocol() {
    Protocol.getProtocol().then((protocol) => {
      this.setState({
        protocol: protocol
      });
    }).catch((error) => {
      // 错误信息上报， 通过米家app反馈可以上报到服务器
      Service.smarthome.reportLog(Device.model, `Service.getServerName error: ${ JSON.stringify(error) }`);
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
          title="设备自检"
          // showDot={true}
          onPress={() => navigation.navigate('checkSelf', { 'title': '设备自检' })}
          accessible={true}
          accessibilityHint="press title"
        />

        <ListItem
          title="消音"
          // showDot={true}
          onPress={() => navigation.navigate('silencer', { 'title': '设备消音' })}
          accessible={true}
          accessibilityHint="press title"
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
            Service.storage.setThirdUserConfigsForOneKey(Device.model, 200, value).then((res) => {
              console.log("res", res);
              this.setState({
                switchOn: value
              });
            }).catch((error) => {
              console.log("error", error);
            });
          }}
        />


        <View style={[styles.blank, { borderTopWidth: 0 }]} />

        {/* <CommonSetting
          navigation={this.props.navigation} // 插件的路由导航，必填！！！
          firstOptions={firstOptions}
          secondOptions={secondOptions}
          containerStyle={{ marginTop: 24 }}
        /> */}
        <CommonSetting
          navigation={this.props.navigation}
          firstOptions={this.commonSettingParams.firstOptions}
          secondOptions={this.commonSettingParams.secondOptions}
          extraOptions={this.commonSettingParams.extraOptions}
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

