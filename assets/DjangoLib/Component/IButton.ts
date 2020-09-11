// import AudioService from '../../Script/service/AudioService';

const { ccclass, property,menu } = cc._decorator;

@ccclass
@menu('DJ-View/IButton(自定义按钮)')
export default class IButton extends cc.Button {
    @property()
    isHaveSound = true; // 是否有按钮声音

    @property({
        type: cc.AudioClip,
        visible() {
            return this.isHaveSound;
        },
    })
    soundUrl: cc.AudioClip = null; // 按钮声音文件url

    @property({
        tooltip: '是否播放缩放动画',
        visible() {
            return this.transition !== cc.Button.Transition.SCALE;
        },
    })
    isScale = false;

    oldScaleX: number;
    oldScaleY: number;

    // audioService : AudioService = AudioService.getInstance();

    private defaultSoundName = 'btn';

    onLoad() {
        this.oldScaleX = this.node.scaleX;
        this.oldScaleY = this.node.scaleY;
        this.node.on(cc.Node.EventType.TOUCH_END, this.playClickSount.bind(this));
    }

    start() {
        this.zoomScale = this.oldScaleX + 0.05;
        if (this.isScale) {
            this.node.on(cc.Node.EventType.TOUCH_START, this.scaleBtnTouchStart, this);
            this.node.on(cc.Node.EventType.TOUCH_END, this.scaleBtnTouchEnd, this);
            this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.scaleBtnTouchEnd, this);
        }
    }

    scaleBtnTouchStart() {
        if (!this.interactable) return;
        const anim = cc.sequence(cc.scaleTo(this.duration, this.zoomScale), cc.callFunc(() => {}));
        this.node.runAction(anim);
    }

    scaleBtnTouchEnd() {
        if (!this.interactable) return;
        const anim = cc.sequence(cc.scaleTo(this.duration, this.oldScaleX), cc.callFunc(() => {}));
        this.node.runAction(anim);
    }

    onClick() {}

    playClickSount() {
        if (this.isHaveSound && this.interactable) {
            if (!this.isHaveSound) {
                return;
            }
            const soundName = this.defaultSoundName;
            if (this.soundUrl) {
                // 播放音乐
            } else {
                // 默认音乐
            }
        }
    }

    setInteractable(flag: boolean) {
        if (flag) this.onEnableBtn();
        else this.disabledBtn();
    }

    /**
     * 启用按钮
     */
    onEnableBtn() {
        this.interactable = true;
        if (this.enableAutoGrayEffect) this.setSpriteShader(this.node, 0);
    }

    /**
     * 禁用按钮
     */
    disabledBtn() {
        this.interactable = false;
        if (this.enableAutoGrayEffect) this.setSpriteShader(this.node, 1);
    }

    /** 利用shader */
    setSpriteShader(node: cc.Node, state: number) {
        if (node) {
            const sprite = node.getComponent(cc.Sprite);
            if (sprite) sprite.setState(state);
            if (node.children.length) {
                node.children.forEach(n => {
                    this.setSpriteShader(n, state);
                });
            } else {
                return;
            }
        } else {
            return;
        }
    }
    onClick1() {

    }
}
