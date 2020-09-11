
const { ccclass, property } = cc._decorator;

@ccclass
export default class IToggle extends cc.Toggle {
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

    // audioService : AudioService = AudioService.getInstance();

    private defaultSoundName = 'btn';

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.playClickSount.bind(this));
        this.addCheckEvents();
    }

    start() {
        this.zoomScale = 0.95;
        if (this.isScale) {
            this.node.on(cc.Node.EventType.TOUCH_START, this.scaleBtnTouchStart, this);
            this.node.on(cc.Node.EventType.TOUCH_END, this.scaleBtnTouchEnd, this);
            this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.scaleBtnTouchEnd, this);
        }
    }

    addCheckEvents() {
        // const event = new cc.Component.EventHandler();
        // event.target = this.node;
        // event.component = 'IToggle';
        // event.handler = 'onSpriteShaderHandler';
        // this.checkEvents.push(event);
    }

    scaleBtnTouchStart() {
        if (!this.interactable) return;
        const anim = cc.sequence(cc.scaleTo(this.duration, this.zoomScale), cc.callFunc(() => {}));
        this.node.runAction(anim);
    }

    scaleBtnTouchEnd() {
        if (!this.interactable) return;
        const anim = cc.sequence(cc.scaleTo(this.duration, 1), cc.callFunc(() => {}));
        this.node.runAction(anim);
    }

    onClick() {}

    playClickSount(event) {
        if (this.isHaveSound && this.interactable) {
            if (!this.isHaveSound) {
                return;
            }
            const soundName = this.defaultSoundName;
            if (this.soundUrl) {
                //TODO: 声音
            } else {
            }
        }
    }

    /**
     *
     * @param flag 是否启用按钮
     */
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
}
