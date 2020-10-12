

import React from 'react';
import {
  View,
  Image,
  ListView,
  Text,
  StyleSheet,
  PixelRatio,
  Button
} from 'react-native';
import Separator from 'miot/ui/Separator';
import { Device, Package, Host, Entrance, Service, DeviceEvent, PackageEvent } from 'miot';




export default class DeviceLog extends React.Component {

  constructor(props) {
    super(props);
    let ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 != s2
    });
    this.state = {
      dataSource: ds,
      // logData: { '今天': [{ 'time': '1', 'event': '自检成功' }, { 'time': '2', 'event': '自检失败' }], '9月1日': [{ 'time': '1', 'event': '自检成功' }, { 'time': '2', 'event': '自检失败' }], '8月31日': [{ 'time': '1', 'event': '自检成功' }, { 'time': '2', 'event': '自检失败' }] }
      logData: {}

    };
  }



  UNSAFE_componentWillUnmount() {


  }

  UNSAFE_componentWillMount() {

    // 请求数据
    Service.smarthome.getDeviceData({
      did: Device.deviceID,

      type: "event",
      key: "13", // Object ID 0x1004 温度 电量4106 烟感4117
      time_start: 0,
      time_end: Math.round(Date.now() / 1000),
      limit: 50
    }).then((res) => {

      const a = res[0];

      if (a.hasOwnProperty("time")) {
        this.dealWithData(res);
      }

    }).catch((err) => {
      console.log(err);
    });

  }

  dealWithData(resData) {

    let lastDate = '';
    let dayLogList = [];
    for (let i = 0; i < resData.length; i++) {

      let model = resData[i];
      // 对比日期
      let modelDate = this.formatDate(model['time']);
      let subData = { 'time': modelDate['time'], 'logType': model['value'] };


      if (lastDate == modelDate['date']) {
        // 若和之前日期相同 -- 加入临时数组

        if (i == resData.length - 1) {
          // 最后一个元素
          subData['imageType'] = 2;
          dayLogList.push(subData);

          let subMap1 = this.state.logData;
          subMap1[lastDate] = dayLogList;
          this.setState({
            logData: subMap1
          });
        } else {
          // 中间的元素
          subData['imageType'] = 1;
          dayLogList.push(subData);
        }

      } else {

        // 若和之前日期不同 -- 提交之前的数组，清空临时数组
        if (i != 0) {

          // 非第一组的组头元素

          // 修改上一组组尾信息
          dayLogList[dayLogList.length - 1]['imageType'] = 2;
          // 添加到dataSource,并清空临时数组
          let subMap2 = this.state.logData;
          subMap2[lastDate] = dayLogList;
          this.setState({
            logData: subMap2
          });
          dayLogList = [];

          // 设置组头信息
          subData['imageType'] = 0;
          dayLogList.push(subData);

        } else {


          // 第一组的组头元素
          subData['imageType'] = 0;
          dayLogList.push(subData);
        }

        lastDate = modelDate['date'];

      }


    }

  }


  formatDate(rawDate) {

    let date = new Date(parseInt(rawDate) * 1000);
    if (date.length == 13) {
      date = new Date(parseInt(rawDate));
    }

    let MM = (date.getMonth() + 1 < 10 ? `0${ date.getMonth() + 1 }` : date.getMonth() + 1);
    let DD = (date.getDate() < 10 ? `0${ date.getDate() }` : date.getDate());
    let hh = `${ date.getHours() < 10 ? `0${ date.getHours() }` : date.getHours() }:`;
    let mm = (date.getMinutes() < 10 ? `0${ date.getMinutes() }` : date.getMinutes());
    // return MM + '月' + DD + '日' + '_' + hh + mm;
    return { 'date': `${ MM }月${ DD }日`, 'time': hh + mm };
  }


  // 渲染cell和header的方法

  _renderRow(rowData, sectionID, rowID) {

    let cellImage = '';
    let cellStatus = '';
    let cellImageType = rowData['imageType'];

    switch (rowData['logType']) {
      case '["00"]':
        cellStatus = '工作正常';
        break;
      case '["01"]':
        cellStatus = '烟雾报警';
        cellImageType += 3;
        break;
      case '["02"]':
        cellStatus = '设备故障';
        break;
      case '["03"]':
        cellStatus = '设备自检';
        break;
      case '["04"]':
        cellStatus = '模拟报警';
        break;
      default: break;
    }

    switch (cellImageType) {
      case 0:
        cellImage = require('../resources/images/DeviceLog_GrayTop.png');
        break;
      case 1:
        cellImage = require('../resources/images/DeviceLog_GrayMiddle.png');
        break;
      case 2:
        cellImage = require('../resources/images/DeviceLog_GrayBottom.png');
        break;
      case 3:
        cellImage = require('../resources/images/DeviceLog_RedTop.png');
        break;
      case 4:
        cellImage = require('../resources/images/DeviceLog_RedMiddle.png');
        break;
      case 5:
        cellImage = require('../resources/images/DeviceLog_RedBottom.png');
        break;
      default: break;
    }


    return (

      <View style={{
        flex: 1,
        backgroundColor: '#ffffff',
        height: 50,
        flexDirection: 'row'
      }}>

        <View style={{
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row'
        }}>
          <Text style={styles.timeText}>{rowData.time}</Text>

          <Image style={{
            marginLeft: 5,
            height: 50,
            width: 50
          }}
          source={cellImage}
          />
          <Text style={cellStatus == '烟雾报警' ? styles.warningText : styles.normalText}>{cellStatus}</Text>
        </View >
      </View >
    );
  }
  _renderHeader(sectionData, sectionID) {

    // 先判断是不是今天
    let dateStr = sectionID;
    let nowDate = Date.parse(new Date());
    let nowDateStr = this.formatDate(parseInt(nowDate) / 1000);

    if (dateStr == nowDateStr['date']) {
      dateStr = '今天';
    }


    return (
      <View style={{
        flex: 1,
        backgroundColor: '#F7F7F7',
        height: 40
      }}>
        <View style={{
          backgroundColor: '#ffffff',
          marginLeft: 0,
          marginTop: 8,
          height: 32
        }}>
          <View style={{
            height: 32,
            justifyContent: 'center'
          }}>
            <Text style={styles.sectionText}>{dateStr}</Text>
          </View >

          <Separator style={{ marginTop: -2, marginLeft: 24 }} />
        </View>
      </View >
    );
  }


  // _renderList() {
  //   if (this.state.logData && this.state.logData.length > 0) {
  //     var _listView: ListView
  //     return (
  //       <ListView
  //         // style={styles.list}
  //         ref={(listview) => _listView = listview}
  //         dataSource={this.state.dataSource.cloneWithRowsAndSections(this.state.logData)}
  //         renderRow={(rowData, sectionID, rowID) => this._renderRow(rowData, sectionID, rowID)}
  //         showsVerticalScrollIndicator={false}
  //         renderSectionHeader={(sectionData, sectionID) => this._renderHeader(sectionData, sectionID)}
  //       />
  //     );
  //   } else {
  //     return false
  //   }
  // }

  render() {
    return (

      <View
        style={{
          flex: 1
        }}>

        <ListView
          dataSource={this.state.dataSource.cloneWithRowsAndSections(this.state.logData)}
          renderRow={(rowData, sectionID, rowID) => this._renderRow(rowData, sectionID, rowID)}
          renderSectionHeader={(sectionData, sectionID) => this._renderHeader(sectionData, sectionID)}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

}


var styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopColor: '#f1f1f1',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginBottom: 0,
    marginTop: 0
  },

  rowContainer: {
    height: 52,
    alignSelf: 'stretch',
    flexDirection: 'row',
    paddingLeft: 23,
    paddingRight: 23,
    alignItems: 'center',
    flex: 1
  },
  sectionText: {
    fontSize: 12,
    color: '#7F7F7F',
    marginLeft: 25
  },
  timeText: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 25,
    width: 40
  },

  normalText: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 25
  },
  warningText: {
    fontSize: 14,
    color: '#F43F31',
    marginLeft: 25
  },
  separator: {
    height: 1 / PixelRatio.get(),
    backgroundColor: '#e5e5e5',
    marginLeft: 20
  }

});