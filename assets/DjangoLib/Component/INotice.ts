const { ccclass, property } = cc._decorator;

@ccclass
export default class INotice extends cc.Component {
    @property(cc.RichText)
    label: cc.RichText = null; // Lable 控件，需要将其 AnchorX 设置为零，Overflow 模式为 None。

    @property(cc.Mask)
    mask: cc.Mask = null; // Mask 控件，需要将其 AnchorX 设置为零，将其宽度设置为滚动区域的宽度。

    text: any[] = [];
    show: boolean = false;
    initData(data) {
        this.node.runAction(cc.fadeIn(0.5));
        this.addNotice(data);
        if (!this.show) {
            this.addData();
        }
    }

    /**
     * 存储公告
     * @param {*} data
     */
    addNotice(data) {
        if (data === undefined) return;

        this.text.push(data);

        return this.text;
    }

    /**
     * 开启公告滚动
     */
    addData() {
        this.label.node.position = cc.v3(0, -45);
        const i = 0;
        this.rollNotice(() => {
            this.show = false;
        });
    }

    /**
     * 公告滚动
     * @param {*} callback
     * @param {*} i
     */
    rollNotice(callback) {
        const text = this.text.shift();
        if (!text) return;
        this.show = true;
        this.label.string = text;
        const x = (-this.mask.node.width + this.label.node.width) / 2;
        // 比较文本宽度与遮罩宽度
        if (this.label.node.width <= this.mask.node.width) {
            this.label.node.position = cc.v3(x, -45);

            this.label.node.runAction(
                cc.sequence(
                    cc.moveTo(0.5, cc.v2(x, 0)),

                    cc.delayTime((2000 + this.label.node.width * 10) / 1000),

                    cc.moveTo(0.5, cc.v2(x, 45)),

                    cc.callFunc(() => {
                        // 将滚动内容放置在遮罩外
                        this.label.node.y = -45;

                        if (!this.text.length) {
                            this.node.runAction(cc.fadeOut(0.5));
                            return callback();
                        } else {
                            return this.rollNotice(callback);
                        }
                    }),
                ),
            );
        } else {
            this.label.node.position = cc.v3(x, -45);

            this.label.node.runAction(
                cc.sequence(
                    cc.moveTo(0.5, cc.v2(x, 0)),

                    cc.delayTime(2),

                    cc.moveTo(
                        this.label.node.width / 100,
                        cc.v2((-this.label.node.width - this.mask.node.width) / 2, 0),
                    ),

                    cc.callFunc(() => {
                        if (!this.text.length) {
                            this.node.runAction(cc.fadeOut(0.5));
                            return callback();
                        } else {
                            return this.rollNotice(callback);
                        }
                    }),
                ),
            );
        }
    }
}
