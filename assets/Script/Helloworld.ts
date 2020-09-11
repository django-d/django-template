import { DComponent } from '../DjangoLib/Base/DComponent';
import { eventHandler, eventListenerFunction, emitEvent } from '../DjangoLib/Descript/eventDecorator';
import { DNode } from '../DjangoLib/Descript/dclass';
import TestDialog from './TestDialog';
import { dlm } from '../DjangoLib/Manager/DJDialogManager';
import ILoading from '../DjangoLib/Component/ILoading';

const { ccclass, property } = cc._decorator;
@ccclass
@eventHandler()
export default class Helloworld extends DComponent {
    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    @property(cc.Node)
    cocos: cc.Node = null;

    _test: DNode;

    start() {
        // init logic
        this.label.string = this.text;
    }
    @eventListenerFunction('haha')
    test(parm) {
        console.log('test: ', parm);
    }

    @eventListenerFunction('haha')
    test1(parm) {
        console.log('test1: ', parm);
    }

    onClick() {
        emitEvent('haha', 'aaaa');
        dlm.showWaitingDialog('hahha');
    }
}
