class Tool {
    startWith(str: string, rule: string) {
        if (!str) return false;
        const fdStart = str.indexOf(rule);
        return fdStart === 0;
    }

    endWith(str: string, rule: string) {
        if (!str) return false;
        var d = str.length - rule.length;
        return d >= 0 && str.lastIndexOf(rule) == d;
    }
    getRoot() {
        const node = cc.director.getScene();
        if (!node) return null;
        return node.children[0];
    }
    isWechatGame() {
        return CC_WECHATGAME;
    }

    /**
     * @param time 毫秒
     */
    async sleep(time: number) {
        if (!time) return;
        return new Promise((r, j) => {
            setTimeout(async () => {
                r();
            }, time);
        });
    }

    /**
     * 使一个节点 一直旋转360
     * @param node
     */
    rotatingForever(node: cc.Node, time: number = 0.7) {
        if (node) {
            node.stopAllActions();
            node.angle = 0;
            node.runAction(
                cc
                    .sequence(
                        cc.rotateTo(time, 180),
                        cc.rotateTo(time, 360),
                        cc.callFunc(() => {
                            node.angle = 0;
                        }),
                    )
                    .repeatForever(),
            );
        }
    }

    /**
     * 使一个节点 一直翻转
     * @param node
     */
    scaleForever(node: cc.Node, time: number = 0.6) {
        if (node) {
            node.stopAllActions();
            node.scaleX = 1;
            const oldScaleX = node.scaleX;
            node.runAction(
                cc.sequence(cc.scaleTo(time, 0, node.scaleY), cc.scaleTo(time, oldScaleX, node.scaleY)).repeatForever(),
            );
        }
    }

    isIphoneX() {
        if (cc.sys.OS_ANDROID == cc.sys.os || cc.sys.OS_IOS == cc.sys.os) {
            const size = cc.view.getFrameSize();
            const IphoneX =
                size.width / size.height === 2436 / 1125 ||
                size.width / size.height === 1125 / 2436 ||
                size.width / size.height === 2688 / 1242 ||
                size.width / size.height === 1242 / 2688;
            return IphoneX;
        }
        return false;
    }
}

export const tool = new Tool();
