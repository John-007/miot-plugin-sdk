/**
 * @fileoverview no deprecated comment
 * @author anzhi
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/no-deprecated-comment"),

    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2015, sourceType: "module" }});
ruleTester.run("no-deprecated-comment", rule, {

    valid: [
        `class BasicDevice {
            /**
             * asdfasdf
             */
            getVirtualDevices() {
                return this.getDeviceWifi().getVirtauldevices();
            }
        }`,
        `class BasicDevice {
            /**
             * @deprecated since 120234
             */
            getVirtualDevices() {
                console.warn("fail");
                return this.hah();
            }
        }`,
        `class BasicDevice {
         /**
          * @deprecated since 120234
          */
         getVirtualDevices() {
            if (console.warn && __DEV__) {
             console.warn("fail");
            }
             return this.hah();
         }
     }
        `
    ],

    invalid: [
        {
            code: `
            export default {
               /**
                    * 获取虚拟设备的子设备列表，
                    * @deprecated since 10032 请使用Device.getDeviceWifi().getVirtualDevices()代替
                    */
                  getVirtualDevices() {
                    // @native :=> promise []
                    let a = 1;
                    let b = 2;
                    console.log(a+b);
                    return this.getDeviceWifi().getVirtualDevices();
                  }
               }
            `,
            errors: [{
                message: "deprecated no warn"
            }
         ],
            output: "ahhaa"
        }
    ]
});