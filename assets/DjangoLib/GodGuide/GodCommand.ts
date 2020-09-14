import GodGuide from './GodGuide';
import { tool } from '../Util/Tool';

/**
 * zxh
 */
//根据命令
export class GodCommand {
    static readonly DIALOGUE: string = 'dialogue'; //对话框
    static readonly FINGER: string = 'finger'; //节点定位加手指指引
    static readonly TEXT: string = 'text'; //文本显示
    static readonly LOCATOR: string = 'locator'; //节点定位
    static readonly SAVE: string = 'save'; //保存进度

    static readonly typeList = [
        GodCommand.DIALOGUE,
        GodCommand.FINGER,
        GodCommand.TEXT,
        GodCommand.LOCATOR,
        GodCommand.SAVE,
    ];

    //定位节点
    static locator(godGuide, step, callback) {
        return new Promise((resolve, reject) => {
            let { args } = step.command;
            godGuide.find(args, node => {
                godGuide._targetNode = node;

                //点击确认
                node.once(cc.Node.EventType.TOUCH_END, () => {
                    cc.log('节点被点击');
                    //任务完成
                    resolve();
                });
                //触摸模拟
                let autorun = godGuide.getTask().autorun;
                if (autorun) {
                    godGuide.touchSimulation(node);
                }
            });
        });
    }

    //定位节点，显示一个手指动画
    static async finger(godGuide, step) {
        return new Promise((resolve, reject) => {
            let { args } = step.command;
            godGuide._targetNode = null;
            //定位节点
            godGuide.find(args, node => {
                //手指动画
                godGuide.fingerToNode(node, () => {
                    godGuide._targetNode = node;
                    //点击确认
                    node.once(cc.Node.EventType.TOUCH_END, () => {
                        cc.log('节点被点击');
                        //任务完成
                        resolve();
                    });
                });

                //触摸模拟
                let autorun = godGuide.getTask().autorun;
                if (autorun) {
                    godGuide.touchSimulation(node);
                }
            });
        });
    }

    //文本指令
    static async text(godGuide, step, callback) {
        let { args } = step.command;
        if (args && (typeof args === 'string' || typeof args === 'number')) {
            args = [args];
        }

        //触摸模拟
        let autorun = godGuide.getTask().autorun;

        // let index = 0;
        // //顺序显示文本
        // // @ts-ignore
        // async.eachSeries(
        //     args,
        //     (str, cb) => {
        //         let flag = false;

        //         godGuide.showText(str, () => {
        //             if (flag) {
        //                 return;
        //             }
        //             flag = true;
        //             cb();
        //         });

        //         if (index++ >= args.length - 1) {
        //             flag = true;
        //             cb();
        //             return;
        //         }

        //         //自动引导
        //         if (autorun) {
        //             setTimeout(() => {
        //                 if (flag) {
        //                     return;
        //                 }
        //                 flag = true;
        //                 cb();
        //             }, 1000);
        //         }
        //     },
        //     callback,
        // );

        console.log('自动吗: ', autorun);
        // 改造
        for (let i = 0; i < args.length; i++) {
            let flag = false;
            let last = i >= args.length - 1;
            const str = args[i];

            if (flag) {
                return Promise.reject();
            }

            flag = true;

            //自动引导
            if (autorun) {
                godGuide.showText(str);
                if (!last) {
                    await tool.sleep(1000);
                }
                flag = true;
            } else {
                console.log('等待点击');
                if (last) {
                    godGuide.showText(str);
                } else {
                    await godGuide.showText(str);
                }
                console.log('点击完成');
                flag = true;
            }
        }
    }

    // //文本指令
    // static text(godGuide: GodGuide, step, callback) {
    //     let { args } = step.command;
    //     if (args && (typeof args === 'string' || typeof args === 'number')) {
    //         args = [args];
    //     }

    //     //触摸模拟
    //     let autorun = godGuide.getTask().autorun;

    //     let index = 0;
    //     //顺序显示文本
    //     async.eachSeries(args, (str, cb) => {
    //         let flag = false;
    //         let next = () => {
    //             if (++index >= args.length - 1) {
    //                 flag = true;
    //                 console.log('step------------->',step)
    //                 cb();
    //                 return;
    //             } else {
    //                 if (flag) {
    //                     return;
    //                 }
    //                 flag = true;
    //                 cb();
    //             }
    //         }

    //         godGuide.showText(str, () => {//点击回调
    //             next();
    //         });

    //         //自动引导
    //         if (autorun) {
    //             setTimeout(() => {
    //                 next();
    //             }, 1000);
    //         }
    //     }, callback);
    // }

    //对话框
    static async dialogue(godGuide, step, callback) {
        let { args } = step.command;
        if (args && (typeof args === 'string' || typeof args === 'number')) {
            args = [args];
        }

        //触摸模拟
        let autorun = godGuide.getTask().autorun;

        // let index = 0;
        // //顺序显示文本
        // // @ts-ignore
        // async.eachSeries(
        //     args,
        //     (str, cb) => {
        //         let flag = false;
        //         let next = () => {
        //             if (++index >= args.length - 1) {
        //                 godGuide._dialogue.active = false;
        //                 flag = true;
        //                 cb();
        //                 return;
        //             } else {
        //                 if (flag) {
        //                     return;
        //                 }
        //                 flag = true;
        //                 godGuide._dialogue.active = false;
        //                 cb();
        //             }
        //         };

        //         godGuide.showDialogue(str, () => {
        //             //点击回调
        //             next();
        //         });

        //         //自动引导
        //         if (autorun) {
        //             setTimeout(() => {
        //                 if (flag) {
        //                     return;
        //                 }
        //                 flag = true;
        //                 cb();
        //             }, 10000);
        //         }
        //     },
        //     callback,
        // );

        // 改造
        for (let i = 0; i < args.length; i++) {
            const str = args[i];
            let flag = false;
            //自动引导
            if (autorun) {
                if (flag) {
                    return Promise.reject();
                }
                await tool.sleep(10000);
                flag = true;
            } else {
                // 点击回调
                await godGuide.showDialogue(str);
                if (i >= args.length - 1) {
                    godGuide._dialogue.active = false;
                    flag = true;
                } else {
                    if (!flag) {
                        flag = true;
                        godGuide._dialogue.active = false;
                    } else {
                        return Promise.reject();
                    }
                }
            }
        }
    }
}
