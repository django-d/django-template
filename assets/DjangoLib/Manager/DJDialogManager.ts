import { pom } from './DJPopManager';
import { rem } from './DJResManager';
import { emitEvent } from '../Descript/eventDecorator';
import { PopEventsEnum } from '../Consts/Consts';
import ILoading from '../Component/ILoading';

export class DialogManager {
    managerName: string;

    async popDialog<T>(
        type: { prototype: T } | string,
        data?: any,
        isQueue: boolean = true,
        more?: boolean,
        unshift: boolean = false,
    ) {
        await pom.showDialog(type, data, isQueue, more, unshift);
    }

    async getDialogPrefab(name: string, pathType?: string) {
        return await rem.getPrefabByName(name, pathType);
    }

    /**
     * 换场景后弹出
     * @param name
     * @param path
     * @param data
     */
    async addChangeSceneDialog(type, data?) {
        pom.addChangeSceneDialog(type, data);
    }

    hideWaitingDialog() {
        emitEvent(PopEventsEnum.Close_Waiting_Loading);
    }

    /**
     * 显示 需要等待时的 弹窗
     * 有遮罩
     * @param text
     */
    showWaitingDialog(text: string = '') {
        this.popDialog(ILoading, { text });
    }
}

export const dlm = new DialogManager();
