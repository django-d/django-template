import { GTween } from '../Tween/GTween';
import { EaseType } from '../Tween/EaseType';
import { DComponent } from './DComponent';

export abstract class CCWindow extends DComponent {
    timeID: any;

    _activate_: boolean = false;

    set activate(v: boolean) {
        this._activate_ = v;
    }

    get activate() {
        return this._activate_ && cc.isValid(this.node);
    }

    autoClose() {
        if (this.timeID) {
            clearTimeout(this.timeID);
            this.timeID = null;
        }
        this.timeID = setTimeout(() => {
            this.hide();
        }, 5000);
    }

    /** 初始化 onload */
    onLoad() {
        super.onLoad();
    }

    protected start() {}

    // 组件被load 的时候
    protected onConstructor(): void {
        console.log('onConstructor');
    }

    /** 每桢 调用 */
    protected onUpdate() {}

    // 每次打开调一次
    protected abstract onSetData(data);

    // 更新数据
    async onUpdateData(data) {
        // this.setData(data);
        this.onSetData(data);
    }

    /** 显示动画 需要时可重写 @override*/
    protected doShowAnimation(): void {
        this.node.setScale(0.7, 0.7);
        this.node.opacity = 150;
        GTween.to2(0.7, 0.7, 1, 1, 0.2).setTarget(this.node, this.node.setScale).setEase(EaseType.CircOut);
        GTween.to(150, 255, 0.2)
            .setTarget(this, op => {
                if (cc.isValid(this.node)) this.node.opacity = op;
            })
            .setEase(EaseType.SineOut)
            .onComplete(this.onShown, this);
    }

    /** 隐藏动画 需要时可 @override */
    protected doHideAnimation(): void {
        GTween.to2(1, 1, 0.7, 0.7, 0.2).setTarget(this.node, this.node.setScale).setEase(EaseType.CircOut);
        GTween.to(255, 0, 0.2)
            .setTarget(this, op => {
                if (cc.isValid(this.node)) this.node.opacity = op;
            })
            .setEase(EaseType.SineOut)
            .onComplete(this.onHide, this);
    }

    /**
     * 动画结束后
     */
    protected hideImmediately() {}

    protected hide() {}

    /** active true */
    onEnable() {
        if (super.onEnable) super.onEnable();
    }

    /** active true */
    onDisable() {
        if (super.onDisable) super.onDisable();
    }

    /** 动画结束后 */
    protected onShown(): void {}

    /** 动画结束后 */
    protected onHide() {}

    protected closeDialog(): void {
        this.hide();
        // this.onUnBind();
    }

    /** 事件相关 */
    addListeners(): void {}
    removeListener(): void {}
    onDestroy() {
        super.onDestroy();
    }
}
