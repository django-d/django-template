import { DComponent } from '../DjangoLib/Base/DComponent';
import { eventHandler, eventListenerFunction, emitEvent } from '../DjangoLib/Descript/eventDecorator';
import { DNode } from '../DjangoLib/Descript/dclass';
import { dlm } from '../DjangoLib/Manager/DJDialogManager';

const { ccclass, property } = cc._decorator;
@ccclass
@eventHandler()
export default class MapScript extends DComponent {
    _mapNode: DNode;
    _test1: DNode;
    _test2: DNode;

    start() {
        // init logic/
        this.moveMap();
    }

    moveMap() {
        cc.tween(this._mapNode)
            .by(2, { position: cc.v3(0, this._mapNode.height - 0) })
            .call(() => {
                const firstNode = this._test1.y - this._test2.y >= 0 ? this._test1 : this._test2;
                const secondNode = firstNode !== this._test1 ? this._test1 : this._test2;
                firstNode.y = secondNode.y - secondNode.height + 0;
                firstNode.zIndex = 0;
                secondNode.zIndex = 1;
            })
            .union()
            .repeatForever()
            .start();
    }
}
