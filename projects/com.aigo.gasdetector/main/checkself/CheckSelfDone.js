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
import PluginStrings from '../../resources/strings';

export default class CheckSelfDone extends React.Component {

  static navigationOptions = ({ navigation }) => {
    return {

      headerTransparent: true
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      // deviceStatus: '["00"]',
      // recentLog: '暂无日志'
    };
  }


  // 创建状态页面
  _createResultView() {

    let resultStatus = this.props.navigation.state.params.status;
    let successImage = require('../../resources/images/CheckSelf_Success.png');
    let errorImage = require('../../resources/images/CheckSelf_Error.png');
    return (

      <View
        style={{
          flex: 1,
          justifyContent: "center"
        }}>
        <Image
          style={{
            width: 292,
            height: 292
          }}
          source={resultStatus ? successImage : errorImage}
        />

      </View>
    );
  }



  render() {
    const { navigation } = this.props;

    let resultStatus = this.props.navigation.state.params.status;

    return (


      <View
        style={{
          flex: 1,
          // justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#FFF"
        }} >

        {this._createResultView()}

        <View style={{
          marginBottom: 0,

          height: 42,
          width: 327,
          borderRadius: 10

        }}>
          <Button title={resultStatus ? PluginStrings.selfCheckDone : PluginStrings.selfCheckRetry} color={'#32BAC0'} onPress={() => {
            // this.props.router.callBack('I am a Student');
            resultStatus ? this.props.navigation.goBack(this.props.navigation.state.params.navKey) : this.props.navigation.goBack();
          }} />
        </View>





        < View
          style={{ height: 35 }}
        />

      </View >

    );
  }

}
