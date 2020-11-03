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
import PluginStrings from '../../resources/strings';
import { Host } from 'miot';

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



  UNSAFE_componentWillUnmount() {

  }

  UNSAFE_componentWillMount() {

    // console.log(this.props.navigation.state.params.status);
    // let id = this.props.navigation.state.params.id;
    // let name = this.props.navigation.state.params.name;
  }



  // 创建状态页面
  _createResultView() {





    let resultStatus = this.props.navigation.state.params.status;
    let successImage = require('../../resources/images/CheckSelf_Success.png');
    let errorImage = require('../../resources/images/CheckSelf_Error.png');

    let language = Host.locale.language
    if (language != 'zh') {
      successImage = require('../../resources/images/CheckSelf_Success_en.png');
      errorImage = require('../../resources/images/CheckSelf_Error_en.png');
    }

    return (

      <View
        style={{
          flex: 1,
          justifyContent: "center"
        }}>
        <Image
          style={{
            resizeMode: 'contain',
            width: 292,
            height: 420
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

          // alignItems: 'center',
          // paddingVertical: 20
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
