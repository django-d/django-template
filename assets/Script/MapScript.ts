import { DComponent } from '../DjangoLib/Base/DComponent';
import { eventHandler, eventListenerFunction, emitEvent } from '../DjangoLib/Descript/eventDecorator';
import { DNode } from '../DjangoLib/Descript/dclass';
import { dlm } from '../DjangoLib/Manager/DJDialogManager';

const { ccclass, property } = cc._decorator;
@ccclass
@eventHandler()
export default class MapScript extends DComponent {
    _camera: DNode;
    _mapNode: DNode;
    _test1: DNode;
    _test2: DNode;
    _nodes: DNode[];
    count: number = 0;

    @property()
    speed: number = 100;

    isStart: boolean = true;

    countLabel: number = 0;

    isStop: boolean = false;

    slowDown: number = 0;

    start() {
        // init logic/
        // this.moveMap();
        setInterval(() => {
            const n = new cc.Node();
            const l = n.addComponent(cc.Label);
            l.string = `这是第${this.countLabel}`;
            n.parent = this.node;
        }, 1000);
    }

    moveMap() {
        const t = cc
            .tween(this._camera)
            .by(2, { position: cc.v3(0, -this._mapNode.height - 0) })
            .call(() => {
                const firstNode = this._test1.y - this._test2.y >= 0 ? this._test1 : this._test2;
                const secondNode = firstNode !== this._test1 ? this._test1 : this._test2;
                firstNode.y = secondNode.y - secondNode.height + 0;
                firstNode.zIndex = 0;
                secondNode.zIndex = 1;

                // if (this.count === 3) {
                //     t.stop();
                //     this.endMove(secondNode);
                // }

                this.count++;
            })
            .union()
            .repeatForever()
            .start();
    }

    endMove(secondNode) {
        cc.tween(this._camera).bezierBy(2, cc.v2(0, this._camera.y), cc.v2(0, 0), cc.v2(0, secondNode.y)).start();
    }

    checkMap() {
        const firstNode = this._nodes[0];
        if (firstNode.y - firstNode.height / 2 - this._mapNode.height / 2 > this._camera.y) {
            this._nodes.splice(0, 1);
            const endNode = this._nodes[this._nodes.length - 1];
            firstNode.y = endNode.y - endNode.height / 2 - firstNode.height / 2;
            this._nodes.push(firstNode);
            this.count++;
            if (this.count === 3) {
                // this._test1.y = firstNode.y - firstNode.height / 2 - this._test1.height / 2;
                // this._nodes.push(this._test1);
                this.isStart = false;
                cc.tween(this._camera)
                    .to(2, { position: cc.v3(0, firstNode.y) }, { easing: 'quadOut' })
                    .start();
            }
        }
    }

    update(dt) {
        if (this.isStart) {
            this._camera.y -= dt * this.speed;
            this.checkMap();
        }
    }
}
