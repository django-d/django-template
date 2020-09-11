import { jarvis } from '../Jarvis';
import { ResPath } from '../Consts/Consts';
import { rem } from '../Manager/DJResManager';
import { VM } from '../ModelView/ViewModel';

const { ccclass, property } = cc._decorator;

@ccclass
export abstract class DComponent extends cc.Component{
    /** clss name */
    static cname: string;

    static uiPackage: string;

    static prefabName: string;

    /** 打开节点绑定 */
    @property({
        tooltip: '是否打开绑定节点',
    })
    public openBind: boolean = false;

    /** 是否已经绑定过 */
    private isBind: boolean = false;

    eventHandlers: any = [];

    public _Index: number = 0;

    tony: any;

    private scheduleSeq: number = 0;
    private ischedules: { callback: Function; id: number }[];

    __preload() {
        this.bindHammer();
    }

    onLoad() {
        this.ischedules = [];
    }

    bindHammer() {
        if (CC_EDITOR || !this.openBind || this.isBind) return;
        this.isBind = true;
        jarvis.bindComponent(this, { debug: false }); // 绑定节点
    }

    /**
     * 动态加载prefab
     */
    public static async loadPackage<T>(): Promise<T> {
        const prefab = await rem.getPrefabByName(this.prefabName || this.cname, this.uiPackage || ResPath.DefaultPatch);
        const node = cc.instantiate(prefab);
        const comp = node.getComponent(this.cname);
        return comp;
    }

    /**
     * 组件定时器
     * @param callback
     * @param interval
     * @param repeat
     * @param delay
     */
    public ischedule(callback?: Function, interval?: number, repeat?: number, delay?: number, rightNow?: boolean) {
        this.scheduleSeq++;
        this.ischedules.push({ callback, id: this.scheduleSeq });
        if (rightNow) callback();
        this.schedule(callback, interval, repeat, delay);
        return this.scheduleSeq;
    }

    /**
     * 关闭组件定时器
     * @param id
     * @param callback
     */
    public unischedule(id?: number, callback?: Function) {
        if (callback) {
            this.unschedule(callback);
        } else {
            if (id) {
                let index;
                this.ischedules.forEach((obj, i) => {
                    if (obj.id === id) {
                        index = i;
                        this.unschedule(obj.callback);
                    }
                });
                if (typeof index === 'number') this.ischedules.splice(index, 1);
            }
        }
    }

    public binVMPath(path: string, onValueChanged: Function, target) {
        const changeFunc = onValueChanged.bind(target);
        this.eventHandlers.push({ path, func: changeFunc });
        VM.bindPath(path, changeFunc, target);
    }

    public unbinVMPath(path: string, onValueChanged: Function, target) {
        VM.unbindPath(path, onValueChanged, target);
    }

    /** 组件销毁 */
    onDestroy() {
        if (CC_EDITOR) return;
        for (const iterator of this.eventHandlers) {
            this.unbinVMPath(iterator.path, iterator.func, this);
        }
    }

    onEnable() {
        this._Index = this.node.getParent().children.indexOf(this.node);
    }

    addListeners() {}

    removeListener() {}
}
