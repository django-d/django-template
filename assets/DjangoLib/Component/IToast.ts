import { CCZindex } from '../Consts/Consts';

const { ccclass, property } = cc._decorator;

@ccclass
export default class IToast extends cc.Component {
    @property(cc.Label)
    textLabel: cc.Label = null;

    @property(cc.Node)
    bg: cc.Node = null;

    fadeOutAni;

    fadeInAni;

    onClickCallBack: Function = null;

    onLoad() {
        // this.node.on(cc.Node.EventType.TOUCH_START, this.onClick, this);
        this.node.zIndex = CCZindex.IToast;
    }

    start() {}

    async initData(data: ToastData) {
        this.node.parent.zIndex = CCZindex.IToast;
        const toast = this.node;
        const toastLableC = this.textLabel;
        const canvas = this.node.parent.parent;
        const canvasH = canvas.height;
        const canvasW = canvas.width;
        if (data.fontSize) {
            toastLableC.fontSize = data.fontSize;
        }
        toastLableC.string = data.text;
        this.bg.width = toastLableC.node.width + 100;

        const maxToastLength = Math.floor((canvasW / 4) * 3);
        let textWidth = toast.width;
        const textHeight = toast.height;
        if (textWidth > maxToastLength) {
            toastLableC.overflow = cc.Label.Overflow.SHRINK;
            toast.width = maxToastLength;
            textWidth = toast.width;
        }
        const toastW = toast.width;
        const toastH = toast.height;
        let toastPositionX = 0;
        let toastPositionY = 0;
        let stayPositionX = 0;
        let stayPositionY = 0;
        let finalPositionX = 0;
        let finalPositionY = 0;
        const position = data.position || 0;
        switch (
            position // 设置toast初始位置&停留位置
        ) {
            case ToastPositionType.TOP:
                toastPositionY = canvasH / 2 + toastH / 2;
                stayPositionY = toastPositionY - toastH;
                finalPositionY = stayPositionY - toastH / 2;
                break;
            case ToastPositionType.LEFT:
                toastPositionX = 0 - canvasW / 2 - toastW / 2;
                stayPositionX = toastPositionX + toastW;
                finalPositionX = stayPositionX + toastW / 2;
                break;
            case ToastPositionType.BOTTOM:
                toastPositionY = 0 - canvasH / 2 - toastH / 2;
                stayPositionY = toastPositionY + toastH;
                finalPositionY = stayPositionY + toastH / 2;
                break;
            case ToastPositionType.RIGHT:
                toastPositionX = canvasW / 2 + toastW / 2;
                stayPositionX = toastPositionX - toastW;
                finalPositionX = stayPositionX - toastW / 2;
                break;
            case ToastPositionType.CENTER:
                toastPositionY -= toastH / 2;
                stayPositionY = toastPositionY + toastH;
                finalPositionY = stayPositionY + toastH / 2;
                break;
        }
        if (data.backToPosition) {
            finalPositionY = toastPositionY;
            finalPositionX = toastPositionX;
        }
        toast.x = toastPositionX;
        toast.y = toastPositionY;
        const speed = data.speed || 0.5;
        // 动画
        this.fadeInAni = cc.spawn(cc.fadeTo(speed, 255), cc.moveTo(speed, stayPositionX, stayPositionY));
        // tslint:disable-next-line:max-line-length
        this.fadeOutAni = cc.sequence(
            cc.spawn(cc.fadeTo(speed, 0), cc.moveTo(speed, finalPositionX, finalPositionY)),
            cc.callFunc(this.fadeOutCallBack, this),
        );
        this.playAnim(data.stayTime, data.outsideClose);
    }

    playAnim(stayTime: number = 1, outsideClose: boolean = false) {
        let anim = cc.sequence(this.fadeInAni, cc.delayTime(stayTime), this.fadeOutAni);
        if (outsideClose) {
            anim = cc.sequence(
                this.fadeInAni,
                cc.callFunc(() => {}),
            );
        }
        this.node.runAction(anim);
    }

    fadeOutCallBack() {
        this.onPut();
    }

    onPut() {}

    onClick() {
        if (this.onClickCallBack) {
            this.onClickCallBack(null, this.node);
        } else {
            this.node.runAction(this.fadeOutAni);
        }
    }
}

export interface ToastData {
    /**
     * toast显示的文字
     */
    text: string;
    /**
     * 弹出位置
     */
    position?: ToastPositionType;
    /**
     * 是否返回原来位置
     */
    backToPosition?: boolean;
    /**
     * 停留时间（秒）
     */
    stayTime?: number;
    /**
     * 飞出速度（秒）
     */
    speed?: number;
    /**
     * 点击关闭
     */
    outsideClose?: boolean;
    /**
     * 点击回调
     */
    clickCallBack?: Function;
    /**
     * destroy回调
     */
    destroyCallBack?: Function;
    /**
     * 字体大小
     */
    fontSize?: number;
}

export const enum ToastPositionType {
    TOP = 0,
    LEFT = 1,
    BOTTOM = 2,
    RIGHT = 3,
    CENTER = 4,
}
