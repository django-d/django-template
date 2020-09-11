import IQueue from '../Util/IQueue';
import { tool } from '../Util/Tool';
import { rem } from './DJResManager';
import { ToastData, ToastPositionType } from '../Component/IToast';

export class IDialog {
    prefab: cc.Prefab;
    data: any;
    name: string;
    constructor(prefab: cc.Prefab, data: any) {
        this.prefab = prefab;
        this.data = data;
        this.name = prefab.name;
    }
}

export default class PopManager {
    managerName: string;

    showing: boolean = false;

    /** 弹窗对象池 */
    windowsPool: any[] = [];

    changeSceneDialogs: any[] = [];

    /** 正在显示的弹窗 */
    showingWindows: any[] = [];

    poolMap = {};

    /** 弹窗队列 */
    windowQueue: IQueue = null;

    constructor() {
        this.windowQueue = new IQueue();
    }

    /** 获取Window */
    public async getWindowByName<T>(type: { prototype: T } | string): Promise<any> {
        let wd;
        let index = -1;
        for (let i = 0; i < this.windowsPool.length; i++) {
            const w = this.windowsPool[i];
            if (w.constructor === type || w.constructor.cname === type) {
                console.log('w.constructor === type :', w.constructor === type);
                wd = w;
                index = i;
                break;
            }
        }
        if (wd && cc.isValid(wd)) {
            this.windowsPool.splice(index, 1);
            return wd;
        }
        return await rem.loadDComponent(type as any);
    }

    /** 是否在显示 */
    public isShowing<T>(type: { prototype: T } | string): boolean {
        for (const window of this.showingWindows) {
            if (window.constructor === type || window.constructor.cname === type) {
                return true;
            }
        }
        for (const window of this.windowQueue.dataStore) {
            if (window.constructor === type || window.constructor.cname === type) {
                return true;
            }
        }
        return false;
    }

    /**
     * 获取正在显示的弹窗 可能有多个
     * @param type
     */
    public getShowingWindow<T>(type: { prototype: T } | string, id?: any): T {
        const list = [];
        for (const window of this.showingWindows) {
            if (window.constructor === type || window.constructor.cname === type) {
                list.push(window);
            }
        }
        if (list.length) return list[0];
    }

    /**
     * 显示弹窗方法
     * @param prefab 弹窗预制体
     * @param data 初始化弹窗数据源
     * @param concurrence 是否可同时与其他弹窗出现 不计入弹窗队列
     * @param dialogConfig 如果有配置属性 则优先设置
     */
    async showDialog<T>(
        type: { prototype: T } | string,
        data?: any,
        isQueue: boolean = true,
        more?: boolean,
        unshift: boolean = false,
    ) {
        type = rem.getClass(type);

        const iq = type['isQueue'];
        if (typeof iq === 'boolean') isQueue = iq;

        if (!more && this.isShowing(type as any)) return;
        console.log('this.showing: ', this.showing, 'isQueue:', isQueue, 'unshift:', unshift);
        if (this.showing && isQueue) {
            if (unshift) {
                this.windowQueue.unshift({ type, data });
            } else {
                this.windowQueue.add({ type, data });
            }
            return;
        }
        if (isQueue) this.showing = true;

        const window = await this.getWindowByName(type as any);
        this.showingWindows.push(window);

        await window.updateData(data);
        window.show();
        window['hideCallBack'] = this.hideWindowCallBack.bind(this, window, isQueue);
    }

    /** @param isPut */
    public hideWindowCallBack(window: any, isQueue: boolean) {
        const index = this.showingWindows.indexOf(window);
        this.showingWindows.splice(index, 1);
        if (window.isPutPool) this.windowsPool.push(window);
        if (isQueue) {
            this.showing = false;
            this.continueShow();
        }
    }

    /** 继续弹窗 */
    public continueShow() {
        if (!this.windowQueue.isEmpty()) {
            const data: any = this.windowQueue.getEnd();
            this.showDialog(data.type, data.data);
        }
    }

    public clearQueue() {
        this.showingWindows.splice(0, this.showingWindows.length);
        this.windowQueue.clear();
        this.showing = false;
        console.log('清除弹窗');
    }

    public hideAllWindow() {
        this.windowQueue.clear();
        this.showingWindows.forEach(w => {
            w.hide();
        });
    }

    //----------------------------------------

    getNodePool(name: string): cc.NodePool {
        if (!this.poolMap[name]) this.poolMap[name] = new cc.NodePool(name);
        return this.poolMap[name];
    }

    getNode(prefab: cc.Prefab) {
        const pool = this.getNodePool(prefab.name);
        let node = pool.get();
        if (!node || !node.isValid) node = cc.instantiate(prefab);
        return node;
    }

    clearPool() {
        Object.keys(this.poolMap).forEach(key => {
            const pool = this.poolMap[key] as cc.NodePool;
            if (pool) {
                pool.clear();
            }
        });
    }

    /**
     * 是否存在于队列中
     * @param prefab
     */
    hasDialog(prefab: cc.Prefab) {
        if (!tool.getRoot()) return true;
        return !!tool.getRoot().getChildByName(prefab.name);
    }

    /**
     * 销毁弹窗
     * @param prefab
     * @param concurrence
     */
    hideDialog(node: cc.Node, concurrence?: boolean) {
        if (node) {
            const com = node.getComponent(node.name);
            if (com) com.activate = false;
            if (cc.isValid(node) && node.parent) {
                // prefab.removeFromParent();
                // prefab.destroy();
                const pool = this.getNodePool(node.name);
                pool.put(node);
            }
            if (!concurrence) {
                this.showing = false;
                this.sequenceShowDialog();
            }
        }
    }

    removeDialog(prefab: cc.Node, concurrence: boolean) {
        if (prefab) {
            const com = prefab.getComponent(prefab.name);
            if (!concurrence && com.activate) {
                this.showing = false;
                this.sequenceShowDialog();
            }
        }
    }

    /**
     * 重复使用弹窗只刷新数据
     * @param prefab 预制体
     * @param data 数据源
     * @param concurrence 可否同时出现 不加入弹窗队列
     */
    showRepetitionDialog(prefab: cc.Prefab, data: any, concurrence: boolean) {
        const node = tool.getRoot().getChildByName(prefab.name);
        if (node) {
            const comp = node.getComponent(node.name);
            comp.initData(data);
        } else {
            // this.showDialog(prefab, data, concurrence);
        }
    }

    addChangeSceneDialog(type, data: any) {
        this.changeSceneDialogs.push({ type, data });
    }

    showChangeSceneDialogs() {
        for (const d of this.changeSceneDialogs) {
            this.windowQueue.add(d);
        }
        this.changeSceneDialogs.splice(0, this.changeSceneDialogs.length);
        this.sequenceShowDialog();
    }

    sequenceShowDialog() {
        if (!this.windowQueue.isEmpty() && !this.showingWindows.length) {
            const dialog = this.windowQueue.getFirst<any>();
            this.showDialog(dialog.type, dialog.data);
        }
    }

    /**
     * 显示 toast 组件
     * @param prefab
     * @param data
     */
    showToast(prefab: cc.Prefab, data: ToastData) {
        const dialogNode = this.getNode(prefab);
        const nodes = cc.director.getScene().children[0].children;
        const position = data.position || 0;
        const stayTime = data.stayTime || 0;
        dialogNode.stopAllActions();
        dialogNode.x = 0;
        dialogNode.y = 0;
        const toasts = nodes.map(v => {
            if (v.name === prefab.name) return v;
        });
        toasts.forEach((v, i) => {
            if (v) {
                let positionY = 0;
                switch (
                    position // 设置toast初始位置&停留位置
                ) {
                    case ToastPositionType.TOP:
                        positionY = v.y - prefab.data.height;
                        break;
                    case ToastPositionType.CENTER:
                        positionY = v.y + prefab.data.height;
                        break;
                }
                if (cc.isValid(v)) {
                    v.runAction(cc.moveTo(0.4 + stayTime, v.x, positionY));
                }
            }
        });
        dialogNode.parent = tool.getRoot() || null;
        dialogNode.active = true;
        const dialogComp = dialogNode.getChildByName('toastNode').getComponent(dialogNode.name);
        if (dialogComp.initData) {
            dialogComp.initData(data);
            dialogComp.onPut = () => {
                const pool = this.getNodePool(prefab.name);
                pool.put(dialogNode);
            };
        }
    }
}

export const pom = new PopManager();
