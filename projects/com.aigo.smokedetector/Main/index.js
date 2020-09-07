
import React from 'react';
import { Package } from 'miot';
import NavigationBar from 'miot/ui/NavigationBar';
import { createStackNavigator } from 'react-navigation';

// 首页引用
import Home from './Home';
import DeviceLog from './DeviceLog';
import MoreMenu from './MoreMenu';
import CheckSelf from './CheckSelf';
import CheckSelfDone from './CheckSelfDone';



class BackImage extends React.Component { // 创建一个返回按钮的组件
  render() {
    return (
      <Image
        source={require('../resources/back.png')}
        style={{ width: 40, height: 40 }}
      />
    );
  }
}

const RootStack = createStackNavigator(
  {

    deviceLog: DeviceLog,
    moreMenu: MoreMenu,
    checkSelf: CheckSelf,
    checkSelfDone: CheckSelfDone,
    // home: Home
    home: {
      screen: Home,
      navigationOptions: ({ navigation }) => ({

        // headerBackImage: require("../resources/back.png"),
        // // headerBackImage: <BackImage />,
        header: <NavigationBar
          left={[
            {
              key: NavigationBar.ICON.BACK,
              // key: '../resources/back.png',
              onPress: (_) => Package.exit()
            }
          ]}
          right={[
            {
              key: NavigationBar.ICON.MORE,
              // showDot: this.state.showDot,
              onPress: (_) => navigation.navigate('moreMenu', { title: '设置' })
            }
          ]}
          title="烟雾传感器"
          backgroundColor="#F7F7F7"
        // backgroundColor="transparent"
        // translusent="true"
        // subtitle='副标题'
        // onPressTitle={_ => console.log('onPressTitle')}
        />,
        headerTransparent: true
      })
    }
  },

  {
    initialRouteName: 'home',
    navigationOptions: ({ navigation }) => {
      return {
        header: <NavigationBar
          title={navigation.state.params ? navigation.state.params.title : ''}

          left={
            [
              {
                key: NavigationBar.ICON.BACK,
                onPress: (_) => navigation.goBack()
              }
            ]}
        />
      };
    }
  }

);



export default class App extends React.Component {

  render() {
    return <RootStack />;
  }

}

