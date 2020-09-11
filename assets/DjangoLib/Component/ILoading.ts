import { dclass } from '../Descript/dclass';
import { eventHandler, eventListenerFunction } from '../Descript/eventDecorator';
import { CCWindow } from '../Base/CCWindow';
import { ccWindow } from '../Descript/WindowDecorator';
import { tool } from '../Util/Tool';
import { PopEventsEnum, CCZindex, ResPath } from '../Consts/Consts';

const { ccclass, property } = cc._decorator;

@dclass({ uiPackage: ResPath.DefaultPatch })
@ccWindow({
    isPlayAnima: false,
    isShadowClick: true,
    zIndex: CCZindex.ILoading,
    isQueue: false,
})
@eventHandler()
export default class ILoading extends CCWindow {
    @property(cc.Node)
    ring: cc.Node = null;

    @property(cc.Node)
    anima1: cc.Node = null;

    @property(cc.Label)
    loadingText: cc.Label = null;

    currentText = '';

    dotCount = 0;
    intervalId = null;

    onSetData(data: { text: string }) {
        if (!data) return;
        const text = data.text || '';
        this.currentText = text;
        this.setUI();
    }

    setUI() {
        tool.rotatingForever(this.ring);
        tool.scaleForever(this.anima1);
        if (this.intervalId) clearInterval(this.intervalId);
        const setTextFunction = this.setText.bind(this);
        setTextFunction();
        this.intervalId = setInterval(setTextFunction, 1000);
    }

    setText() {
        let dotString = '';
        for (let i = 0; i < this.dotCount; i++) {
            dotString += '.';
        }
        if (this.loadingText) {
            this.loadingText.string = this.currentText + dotString;
        }
        this.dotCount++;
        if (this.dotCount > 6) {
            this.dotCount = 0;
        }
    }

    onLoad() {
        super.onLoad();
    }

    start() {}

    @eventListenerFunction(PopEventsEnum.Close_Waiting_Loading)
    onCloseDialog() {
        clearInterval(this.intervalId);
        this.intervalId = null;
        this.hide();
    }

    onDestroy() {
        super.onDestroy();
    }
}
