
import React from 'react';
import { Entrance, Package } from 'miot';
import NavigationBar from 'miot/ui/NavigationBar';
import { createStackNavigator } from 'react-navigation';

// 首页引用
import Home from './Home';
import DeviceLog from './DeviceLog';
import MoreMenu from './MoreMenu';
import CheckSelf from './CheckSelf';
import CheckSelfDone from './CheckSelfDone';
import Silencer from './Silencer';

export default class App extends React.Component {

  constructor(props) {
    super(props);

    this.initData();
  }

  /**
   * 此处决定，进入插件需要进入到哪个页面
   */
  initData() {
    this.initPage = 'home';
    switch (Package.entrance) {
      case Entrance.Main:
        this.initPage = 'home';
        break;
      default:
        this.initPage = 'home';
        break;
    }
  }

  UNSAFE_componentWillMount() {
    /**
     * 检测是否需要弹出隐私弹窗
     * 如果您的插件决定使用开发者平台上进行配置隐私协议，则无需调用此API，删除如下一行代码即可
     * 具体文档可以查看：
     * https://iot.mi.com/new/doc/app-development/extension-development/law-info.html
     */
    // this.checkToAlertLegalInformationAuthorization();
  }

  render() {
    let RootStack = createRootStack(this.initPage);
    return <RootStack />;
  }

}

function createRootStack(initPage) {
  return createStackNavigator(
    {
      deviceLog: DeviceLog,
      moreMenu: MoreMenu,
      checkSelf: CheckSelf,
      checkSelfDone: CheckSelfDone,
      home: Home,
      silencer: Silencer
    },
    {
      initialRouteName: initPage,
      navigationOptions: ({ navigation }) => {

        let { titleProps, title } = navigation.state.params || {};
        // 如果 titleProps和title 都为空， 则不显示页面header部分
        if (!titleProps && !title) return { header: null };

        // 如果titleProps为空， 则title肯定不为空， 初始化titleProps并赋值title
        if (!titleProps) {
          titleProps = {
            title: title
          };
        }

        if (!titleProps.left) {
          titleProps.left = [
            {
              key: NavigationBar.ICON.BACK,
              onPress: () => {
                navigation.goBack();
              }
            }
          ];
        }
        return {
          header: <NavigationBar {...titleProps} />
        };
      },
      // // 控制页面切换的动画
      // transitionConfig: () => ({
      //   screenInterpolator: interpolator
      // })
    }
  );
}

// const RootStack = createStackNavigator(
//   {

//     deviceLog: DeviceLog,
//     moreMenu: MoreMenu,
//     checkSelf: CheckSelf,
//     checkSelfDone: CheckSelfDone,
//     home: Home
//     // home: {
//     //   screen: Home,
//     //   navigationOptions: ({ navigation }) => ({

//     //     // headerBackImage: require("../resources/back.png"),
//     //     // // headerBackImage: <BackImage />,

//     //     header: <NavigationBar
//     //       left={[
//     //         {
//     //           key: NavigationBar.ICON.BACK,
//     //           // key: '../resources/back.png',
//     //           onPress: (_) => Package.exit()
//     //         }
//     //       ]}
//     //       right={[
//     //         {
//     //           key: NavigationBar.ICON.MORE,
//     //           // showDot: this.state.showDot,
//     //           onPress: (_) => navigation.navigate('moreMenu', { title: '设置' })
//     //         }
//     //       ]}
//     //       // title="烟雾传感器"
//     //       backgroundColor="#F7F7F7"
//     //     // backgroundColor="transparent"
//     //     // translusent="true"
//     //     // subtitle='副标题'
//     //     // onPressTitle={_ => console.log('onPressTitle')}
//     //     />,
//     //     headerTransparent: true
//     //   })
//     // }
//   },

//   {
//     initialRouteName: 'home',
//     navigationOptions: ({ navigation }) => {

//       let { titleProps, title } = navigation.state.params || {};
//       // 如果 titleProps和title 都为空， 则不显示页面header部分
//       if (!titleProps && !title) return { header: null };

//       // 如果titleProps为空， 则title肯定不为空， 初始化titleProps并赋值title
//       if (!titleProps) {
//         titleProps = {
//           title: title
//         };
//       }
//       if (!titleProps.left) {
//         titleProps.left = [
//           {
//             key: NavigationBar.ICON.BACK,
//             onPress: () => {
//               navigation.goBack();
//             }
//           }
//         ];
//       }
//       return {
//         header: <NavigationBar {...titleProps} />
//       };

//       // return {
//       //   header: <NavigationBar
//       //     title={navigation.state.params ? navigation.state.params.title : ''}

//       //     left={
//       //       [
//       //         {
//       //           key: NavigationBar.ICON.BACK,
//       //           onPress: (_) => navigation.goBack()
//       //         }
//       //       ]}
//       //   />
//       // };
//     }
//   }

// );



// export default class App extends React.Component {

//   render() {
//     return <RootStack />;
//   }

// }

