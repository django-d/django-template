import { VM } from './ViewModel';
import { DComponent } from '../Base/DComponent';

//用来处理通知数据的层级
//控制旗下子节点的数据

//目前只是起到一个识别组件的作用，之后会抽象很多功能在这里面

// player.equips.* 可以自动根据所在父对象的位置设置顺序

const DEBUG_WATCH_PATH: boolean = true;

const { ccclass, property } = cc._decorator;

/**
 * watchPath 的基础，只提供绑定功能 和 对应的数据更新函数
 */
@ccclass
export default class VMBase extends DComponent {
    /** watch 单路径  */
    public watchPath: string = '';

    /** tag */
    public vmTag: string = 'global';

    /** watch 多路径 */
    protected watchPathArr: string[] = [];

    /**是否启用模板多路径模式 */
    public templateMode: boolean = false;

    /**储存模板多路径的值 */
    protected templateValueArr: any[] = [];

    /**VM管理 */
    public VM = VM;

    changeFunc: Function;

    // private eventHandlers: any[] = [];

    public inited: boolean = false;

    __preload() {
        if (super.__preload) super.__preload();
        this.onInit();
    }

    onLoad() {
        super.onLoad();
        // this.onInit();
    }

    onInit() {
        if (CC_EDITOR || this.inited) return;
        this.inited = true;
        // 如果没有指定watchpath 默认会找 node 里的 watch path
        if (this.watchPath === '' && this.node['watchPath']) this.watchPath = this.node['watchPath'];
        if (this.watchPath === '' || !this.watchPath) return cc.warn('没有绑定数据!');
        this.watchPath = this.changeWatchPath(this.watchPath);
        //提前进行路径数组 的 解析
        let pathArr = this.watchPathArr;
        if (pathArr.length >= 1) {
            for (let i = 0; i < pathArr.length; i++) {
                const path = pathArr[i];
                let paths = path.split('.');

                for (let i = 1; i < paths.length; i++) {
                    const p = paths[i];
                    if (p == '*') {
                        let index = this.node.getParent().children.findIndex(n => n === this.node);
                        if (index <= 0) index = 0;
                        paths[i] = index.toString();
                        break;
                    }
                }

                this.watchPathArr[i] = paths.join('.');
            }
        }

        //打印出所有绑定的路径，方便调试信息
        if (DEBUG_WATCH_PATH && CC_DEBUG) {
            cc.log(
                '所有路径',
                this.watchPath ? [this.watchPath] : this.watchPathArr,
                '<<',
                this.node.getParent().name + '.' + this.node.name,
            );
        }

        if (this.watchPath == '' && this.watchPathArr.join('') == '') {
            cc.log('可能未设置路径的节点:', this.node.getParent().name + '.' + this.node.name);
        }

        this.initBind();
    }

    start() {
        if (CC_EDITOR) return;
        if (super.start) super.start();
        if (this.templateMode || this.watchPath) this.onValueInit(); //激活时,调用值初始化
    }

    public initBind() {
        if (this.templateMode) {
            this.setMultPathEvent(this.watchPathArr, true);
        } else if (this.watchPath != '') {
            this.binPath(this.watchPath);
        }
    }

    public changeChildPath() {
        cc.log(VM['跟新子节点绑定路径:'], this.watchPath);
        //搜寻所有节点：找到 watch path
        let comps = this.node.getComponentsInChildren('VMBase');
        for (let i = 0; i < comps.length; i++) {
            const comp = comps[i];
            comp.vmTag = this.watchPath;
        }
    }

    public changeWatchPath(path: string) {
        // 这是替换 绑定数据的作用域
        if (path.split('.')[0] === '*') {
            path = path.replace('*', this.vmTag);
        }

        //提前拆分、并且解析路径
        let paths = path.split('.');
        for (let i = 1; i < paths.length; i++) {
            const p = paths[i];
            //如果发现了路径使用了 * ，则自动去自己的父节点查找自己所在 index 值
            if (p == '*') {
                let index = this.node.getParent().children.findIndex(n => n === this.node);
                if (index <= 0) index = 0;
                paths[i] = index.toString();
                break;
            }
        }

        //替换掉原路径
        path = paths.join('.');
        return path;
    }

    // 替换 * 的tag绑定
    setWatchPath(tag: string) {
        if (this.watchPath === '' && this.node['watchPath']) this.watchPath = this.node['watchPath'];
        if (this.watchPath === '' || !this.watchPath) return cc.warn('没有绑定数据!');
        if (this.watchPath.split('.')[0] === '*') {
            this.watchPath = this.watchPath.replace('*', tag);
        }
    }

    onDestroy() {
        if (CC_EDITOR) return;
        if (this.templateMode) {
            if (CC_EDITOR) return; //编辑器模式不能判断
            this.setMultPathEvent(this.watchPathArr, false);
        } else if (this.watchPath != '') {
            this.unbindPath(this.watchPath);
        }
        super.onDestroy();
    }

    //多路径监听方式
    protected setMultPathEvent(watchPathArr: string[], enabled: boolean = true) {
        if (CC_EDITOR) return;
        let arr = watchPathArr;
        for (let i = 0; i < arr.length; i++) {
            const path = arr[i];
            if (enabled) {
                this.binPath(path);
            } else {
                this.unbindPath(path);
            }
        }
    }

    /** 跟换绑定路径 */
    public reBind(newPath: string) {
        newPath = this.changeWatchPath(newPath);
        this.unbindPath(this.watchPath);
        this.inited = false;
        this.watchPath = newPath;
        this.onInit();
    }

    private binPath(path: string) {
        if (!this.changeFunc) this.changeFunc = this.onValueChanged.bind(this);
        this.VM.bindPath(path, this.changeFunc, this);
    }

    private unbindPath(path: string) {
        if (this.changeFunc) this.VM.unbindPath(path, this.changeFunc, this);
    }

    public onValueInit() {
        //虚方法
    }

    onValueChanged(n, o, pathArr?: string[]) {}
}
