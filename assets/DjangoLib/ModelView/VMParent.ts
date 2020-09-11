import { DComponent } from '../Base/DComponent';
import { VM } from './ViewModel';
import VMBase from './VMBase';

const { ccclass, property, help } = cc._decorator;

/**
 * 提供VM环境，控制旗下所有VM节点
 * 一般用于 非全局的 VM绑定,VM 环境与 组件紧密相连
 * （Prefab 模式绑定）
 * VMParent 必须必其他组件优先执行
 * v0.1 修复bug ，现在可以支持 Parent 嵌套 （但是注意性能问题，不要频繁嵌套）
 */
@ccclass
export default class VMParent extends DComponent {
    /**绑定的标签，可以通过这个tag 获取 当前的 vm 实例 */
    protected tag: string = '_temp';

    /**需要绑定的私有数据 */
    protected data: any;

    /**VM 管理 */
    public VM = VM;

    /** 是否已经初始化过 */
    _isInit: boolean = false;

    /** 设置数据源 */
    setData(data) {
        this.tag = '_temp' + '<' + this.node.uuid.replace('.', '') + '>';
        if (this.data == data || data == null) return;
        this.data = data;
        this.changeChildPath();
        VM.add(data, this.tag);
        if (this._isInit) {
            this.resetVaule();
        } else this._isInit = true;
    }

    // 重复利用的时候重新刷新一遍值
    resetVaule() {
        const coms = this.getVMComponents();
        coms.forEach(c => {
            c.onValueInit();
        });
    }

    changeChildPath() {
        cc.log(VM['_mvs'], this.tag);
        //搜寻所有节点：找到 watch path
        let comps = this.getVMComponents();
        //console.group();
        for (let i = 0; i < comps.length; i++) {
            const comp = comps[i];
            comp.vmTag = this.tag;
            // this.replaceVMPath(comp, this.tag);
        }
        //console.groupEnd()

        // this.onBind();
    }

    /**
     * 调用父类的onLoad 会自动绑定脚本
     * [所以需要在之前绑定好数据]
     */
    onLoad() {
        if (this.data == null) {
            this.onBind();
        }
        super.onLoad();
    }

    onEnable() {
        if (super.onEnable) super.onEnable();
    }

    onDisable() {
        if (super.onDisable) super.onDisable();
    }

    /**在 onLoad 完成 和 start() 之前调用，你可以在这里进行初始化数据等操作 */
    protected onBind() {
        this.setData({});
    }

    /**在 onDestroy() 后调用,此时仍然可以获取绑定的 data 数据*/
    protected onUnBind() {
        VM.remove(this.tag);
        this.data = null;
    }

    private replaceVMPath(comp: cc.Component, tag: string) {
        let path: string = comp['watchPath'];
        //let comp_name: string = comp.name;

        if (comp['templateMode'] == true) {
            let pathArr: string[] = comp['watchPathArr'];
            if (pathArr) {
                for (let i = 0; i < pathArr.length; i++) {
                    const path = pathArr[i];
                    pathArr[i] = path.replace('*', tag);
                }
            }
        } else {
            //VMLabel

            //遇到特殊 path 就优先替换路径
            if (path.split('.')[0] === '*') {
                comp['watchPath'] = path.replace('*', tag);
            }
        }
    }

    /**未优化的遍历节点，获取VM 组件 */
    private getVMComponents(): VMBase[] {
        let comps = this.node.getComponentsInChildren('VMBase');
        let parents = this.node.getComponentsInChildren('VMParent').filter(v => v.uuid !== this.uuid); //过滤掉自己

        //过滤掉不能赋值的parent
        let filters = [];
        parents.forEach((node: cc.Node) => {
            filters = filters.concat(node.getComponentsInChildren('VMBase'));
        });

        comps = comps.filter(v => filters.indexOf(v) < 0);
        return comps;
    }

    /**
     * [注意]不能覆盖此方法，如果需要覆盖。
     * 需要在该方法内部调用父类的实现，再定义自己的方法
      ```ts
        onDestroy(){
            super.onDestroy();
        }
      ```
     */
    onDestroy() {
        this.onUnBind();
        //解除全部引用
    }

    // update (dt) {}
}
