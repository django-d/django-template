export const task = {
    name: '进入商店',
    debug: true,
    autorun: false,
    steps: [
        {
            desc: '文本提示',
            command: { cmd: 'text', args: ['这里是新手引导', '点击主界面设置按钮'] },
        },

        {
            desc: '点击主界面主页按钮',
            command: { cmd: 'finger', args: 'label' },
            delayTime: 0.5,
        },
        {
            desc: '文本提示',
            command: { cmd: 'text', args: '点击主界面设置按钮' },
        },
        {
            desc: '点击主界面主页按钮',
            command: { cmd: 'finger', args: 'New Button' },
            delayTime: 0.5,
        },

        // {
        //     desc: '点击主界面设置按钮',
        //     command: { cmd: 'finger', args: 'Home > main_btns > btn_setting' },
        // },

        // {
        //     desc: '文本提示',
        //     command: { cmd: 'text', args: '点击主界面商店按钮' }
        // },

        // {
        //     desc: '点击主界面商店按钮',
        //     command: { cmd: 'finger', args: 'Home > main_btns > btn_shop' },
        // },

        // {
        //     desc: '文本提示',
        //     command: { cmd: 'text', args: '点击商店充值按钮' }
        // },

        // {
        //     desc: '点击商店充值按钮',
        //     command: { cmd: 'finger', args: 'Home > Shop > btnCharge' },
        //     onStart(callback) {
        //         setTimeout(() => {
        //             cc.log('模拟异步获取数据');
        //             callback();
        //         }, 1000);
        //     },

        //     onEnd(callback) {
        //         setTimeout(() => {
        //             cc.log('模拟异步提交数据');
        //             callback();
        //         }, 1000);
        //     },
        // },

        // {
        //     desc: '文本提示',
        //     command: { cmd: 'text', args: '点击充值界面关闭钮' }
        // },

        // {
        //     desc: '点击充值界面关闭钮',
        //     command: { cmd: 'finger', args: 'chargePanel > btn_close' },
        //     delayTime: 0.5
        // },

        // {
        //     desc: '回到主页',
        //     command: { cmd: 'finger', args: 'Home > main_btns > btn_home' },
        // },
    ],
};
