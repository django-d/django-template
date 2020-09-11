import { CCWindow } from '../Base/CCWindow';
import { GTween } from '../Tween/GTween';
import { EaseType } from '../Tween/EaseType';
import IButton from '../Component/IButton';
import { tool } from '../Util/Tool';

export function setClassName(name: string, type) {
    cc.js.setClassName(name, type);
    return name;
}

export function ccWindow(option?: {
    /**
     *
     * @param isShowShadow 是否需要遮罩
     * @param isShadowClick 遮罩是否需要点击 默认：点击关闭
     * @param shadowOpacity 设置遮罩透明度 默认：0.8 （255 * 0.8）
     * @param isPlayAnima 是否需要播放动画
     * @param isPutPool 是否需要加入对象池
     * @param isLazyLoad 是否是懒加载
     * @param isQueue 是否加入弹窗队列
     * @param zIndex 节点深度
     */
    // 是否显示遮罩
    isShowShadow?: boolean;
    isShadowClick?: boolean;
    shadowOpacity?: number;
    isPlayAnima?: boolean;
    isPutPool?: boolean;
    isLazyLoad?: boolean;
    isQueue?: boolean;
    zIndex?: number;
}) {
    return <T extends { new (...args: any[]): CCWindow }>(constructorFunction: T): T => {
        if (!option) option = {};
        return class extends constructorFunction {
            /** 是否显示遮罩 */
            isShowShadow: boolean = true;

            /** 是否允许点击遮罩 */
            isShadowClick: boolean = true;

            /** 点击遮罩的方法 */
            onShaowClickCB: Function = null;

            /** 遮罩透明度 百分比 0.8 */
            shadowOpacity: number = 0.8;

            /** 是否需要延迟加载 */
            isLazyLoad: boolean = false;

            /** 是否需要动画 */
            isPlayAnima: boolean = true;

            /** 是否要缓存 */
            isPutPool: boolean = true;

            zIndex: number;

            hideCallBack: Function;

            isTweening: boolean = false;

            initialized: boolean = false;

            /** 创建弹窗父节点 */
            parentNode: cc.Node;

            windowData: any;

            static isQueue: boolean = option.isQueue;

            __preload() {
                if (super.__preload) {
                    super.__preload();
                }
            }

            onLoad() {
                super.onLoad();
                this.addCloseBtn();
                this.updateOption();
            }

            /**
             * 初始化钩子函数
             */
            protected onConstructor() {
                if (this.initialized) return;
                this.initialized = true;
                super.onConstructor();
                this.setOption(option);
            }

            onEnable() {
                super.onEnable();
                // this.onUpdateData(this.windowData);
            }

            /**
             * 添加关闭按钮
             */
            protected addCloseBtn() {
                const closeBtn = this.node.getChildByName('closeBtn');
                if (closeBtn) {
                    const btn = closeBtn.addComponent(IButton);
                    btn.transition = cc.Button.Transition.SCALE;
                    closeBtn.on(cc.Node.EventType.TOUCH_END, () => {
                        this.closeDialog();
                    });
                }
            }

            onSetData(data) {
                // @ts-ignore
                if (super.onSetData) {
                    // @ts-ignore
                    super.onSetData(data);
                }
            }

            public updateData(data: any = {}) {
                if (data.option) {
                    this.setOption(data.option);
                    this.updateOption();
                }
                // if (data && data.filter) {
                //     super.onUpdateData(...data);
                // } else {
                // }
                super.onUpdateData(data);
            }

            protected updateOption() {
                if (this.isShowShadow) this.addShadow();
                else this.removeShadow();
                this.parentNode.zIndex = this.zIndex;
            }

            /** 移除遮罩 */
            protected removeShadow() {
                const obj = this.parentNode.getChildByName('shadow-add');
                if (obj) {
                    obj.destroy();
                }
            }

            /** 显示遮罩阴影 */
            protected addShadow() {
                const obj = this.parentNode.getChildByName('shadow-add');
                if (obj) return;
                const node = new cc.Node();
                const holder = node.addComponent(cc.Graphics);
                node.width = cc.view.getVisibleSize().width;
                node.height = cc.view.getVisibleSize().height;
                holder.fillColor = new cc.Color(0, 0, 0, 255 * this.shadowOpacity);
                holder.fillRect(
                    -cc.view.getVisibleSize().width / 2,
                    -cc.view.getVisibleSize().height / 2,
                    cc.view.getVisibleSize().width,
                    cc.view.getVisibleSize().height,
                );
                this.parentNode.addChild(node, -1, 'shadow-add');
                node.on(
                    cc.Node.EventType.TOUCH_END,
                    () => {
                        if (this.isShadowClick) {
                            this.closeDialog();
                            if (this.onShaowClickCB) this.onShaowClickCB();
                        }
                    },
                    this,
                );
            }

            protected setOption(option: any) {
                if (!option) return;
                if (typeof option.isShowShadow === 'boolean') this.isShowShadow = option.isShowShadow;
                if (typeof option.isShadowClick === 'boolean') this.isShadowClick = option.isShadowClick;
                if (typeof option.shadowOpacity === 'number') this.shadowOpacity = option.shadowOpacity;
                if (typeof option.isPlayAnima === 'boolean') this.isPlayAnima = option.isPlayAnima;
                if (typeof option.isPutPool === 'boolean') this.isPutPool = option.isPutPool;
                if (typeof option.zIndex === 'number') this.zIndex = option.zIndex;
            }

            protected doShowAnimation(): void {
                if (this.isPlayAnima) {
                    if (!this.isTweening) {
                        this.isTweening = true;
                        const obj = this.parentNode.getChildByName('shadow-add');
                        if (obj) {
                            GTween.to(0, 255 * this.shadowOpacity, 0.2).setTarget(this, op => {
                                if (!cc.isValid(this.node)) return;
                                const holder = obj.getComponent(cc.Graphics);
                                holder.clear();
                                obj.opacity = op;
                                holder.fillColor = new cc.Color(0, 0, 0, op);
                                holder.fillRect(
                                    -cc.view.getVisibleSize().width / 2,
                                    -cc.view.getVisibleSize().height / 2,
                                    cc.view.getVisibleSize().width,
                                    cc.view.getVisibleSize().height,
                                );
                            });
                        }
                        super.doShowAnimation();
                    }
                } else {
                    this.onShown();
                }
            }

            protected doHideAnimation(): void {
                if (this.isPlayAnima && !this.isTweening) {
                    this.isTweening = true;
                    const obj = this.parentNode.getChildByName('shadow-add');
                    if (obj) {
                        GTween.to(255 * this.shadowOpacity, 0, 0.2)
                            .setTarget(this, op => {
                                if (!cc.isValid(this.node)) return;
                                const holder = obj.getComponent(cc.Graphics);
                                holder.clear();
                                obj.opacity = op;
                                holder.fillColor = new cc.Color(0, 0, 0, op);
                                holder.fillRect(
                                    -cc.view.getVisibleSize().width / 2,
                                    -cc.view.getVisibleSize().height / 2,
                                    cc.view.getVisibleSize().width,
                                    -cc.view.getVisibleSize().height,
                                );
                            })
                            .setEase(EaseType.SineOut);
                    }
                    super.doHideAnimation();
                }
            }

            protected show() {
                console.log('show：', this.constructor['cname']);
                this.activate = true;
                // this.windowData = args;
                if (!this.parentNode) {
                    this.parentNode = new cc.Node(this.constructor['cname']);
                    this.parentNode.width = cc.view.getVisibleSize().width;
                    this.parentNode.height = cc.view.getVisibleSize().height;
                    this.node.parent = this.parentNode;
                }
                this.parentNode.parent = tool.getRoot();
                if (this.isPlayAnima) this.doShowAnimation();
            }

            protected onShown(): void {
                this.isTweening = false;
                super.onShown();
            }

            protected hide() {
                super.hide();
                this.activate = false;
                if (this.timeID) {
                    clearTimeout(this.timeID);
                    this.timeID = null;
                }
                if (this.isPlayAnima) this.doHideAnimation();
                else this.onHide();
            }

            protected async onHide() {
                this.isTweening = false;
                await super.onHide();
                this.hideImmediately();
                if (this.hideCallBack) this.hideCallBack();
            }

            /** 动画结束后 */
            protected hideImmediately() {
                console.log('hideImmediately');
                super.hideImmediately();
                this.windowData = null;
                if (!this.isPutPool) this.parentNode.destroy();
                else this.parentNode.removeFromParent(false);
            }

            onDestroy() {
                super.onDestroy();
                console.log('onDestroy');
            }
        };
    };
}

export function shadowCB() {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        Object.defineProperty(target, 'shadowName', {
            value: propertyKey,
            writable: !!propertyKey,
            enumerable: true,
            configurable: true,
        });
    };
}
