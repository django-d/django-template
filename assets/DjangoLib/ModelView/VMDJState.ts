import { dclass } from '../Descript/dclass';
import VMBase from './VMBase';

const { ccclass, property, menu, executeInEditMode, help } = cc._decorator;

/**比较条件 */
enum CONDITION {
    '==', //正常计算，比较 等于
    '!=', //正常计算，比较 不等于
    '>', //正常计算，比较>
    '>=', //正常计算，比较>=
    '<', //正常计算，比较<
    '<=', // 正常计算，比较>=
    'range', //计算在范围内
}

enum ACTION {
    NODE_ACTIVE, //满足条件 的 节点激活 ，不满足的不激活
    NODE_VISIBLE, //满足条件 的节点显示，不满足的不显示
    NODE_OPACITY, //满足条件的节点改变不透明度，不满足的还原255
    NODE_COLOR, //满足条件的节点改变颜色，不满足的恢复白色
    COMPONENT_CUSTOM, //自定义控制组件模式
}

enum CHILD_MODE_TYPE {
    NODE_INDEX,
    NODE_NAME,
    CUSTOM_VALUE,
}

@dclass()
@executeInEditMode
@menu('ModelViewer/VM-DJState(VM多条件控制属性)')
export default class VMDJState extends VMBase {
    @property({ type: [cc.String] })
    watchPaths: string[] = [];

    @property({ type: [cc.String] })
    conditionValues: string[] = [];

    @property({
        type: cc.Enum(CONDITION),
    })
    conditions: CONDITION[] = [];

    @property({
        type: cc.Enum(CHILD_MODE_TYPE),
        tooltip: '遍历子节点,根据子节点的名字转换为值，判断值满足条件 来激活',
        visible: function() {
            return this.foreachChildMode === true;
        },
    })
    foreachChildType: CHILD_MODE_TYPE = CHILD_MODE_TYPE.NODE_INDEX;

    @property({
        displayName: 'Value: a',
        visible: function() {
            return this.foreachChildMode === false;
        },
    })
    valueA: number = 0;

    @property({
        displayName: 'Value: b',
        visible: function() {
            return this.foreachChildMode === false && this.condition === CONDITION.range;
        },
    })
    valueB: number = 0;

    @property({
        type: cc.Enum(ACTION),
        tooltip: '一旦满足条件就对节点执行操作',
    })
    valueAction: ACTION = ACTION.NODE_ACTIVE;

    @property({
        visible: function() {
            return this.valueAction === ACTION.NODE_OPACITY;
        },
        range: [0, 255],
        type: cc.Integer,
        displayName: 'Action Opacity',
    })
    valueActionOpacity: number = 0;

    @property({
        visible: function() {
            return this.valueAction === ACTION.NODE_COLOR;
        },
        displayName: 'Action Color',
    })
    valueActionColor: cc.Color = cc.color(155, 155, 155);

    @property({
        visible: function() {
            return this.valueAction === ACTION.COMPONENT_CUSTOM;
        },
        displayName: 'Component Name',
    })
    valueComponentName: string = '';

    @property({
        visible: function() {
            return this.valueAction === ACTION.COMPONENT_CUSTOM;
        },
        displayName: 'Component Property',
    })
    valueComponentProperty: string = '';

    @property({
        visible: function() {
            return this.valueAction === ACTION.COMPONENT_CUSTOM;
        },
        displayName: 'Default Value',
    })
    valueComponentDefaultValue: string = '';

    @property({
        visible: function() {
            return this.valueAction === ACTION.COMPONENT_CUSTOM;
        },
        displayName: 'Action Value',
    })
    valueComponentActionValue: string = '';

    onLoad() {
        if (CC_EDITOR) return;
        super.onLoad();
    }

    /**
     *  [@overrite]  重写初始化 节点绑定逻辑
     */
    onInit() {
        if (CC_EDITOR) return;
        if (this.inited) return;
        this.inited = true;
        this.changePaths();
    }

    changePaths() {
        for (let i = 0; i < this.watchPaths.length; i++) {
            this.watchPaths[i] = this.changeWatchPath(this.watchPaths[i]);
        }
        this.setMultPathEvent(this.watchPaths);
    }
    start() {
        if (CC_EDITOR) return;
        this.onInit();
        this.onValueInit();
    }

    /**初始化获取数据 */
    onValueInit() {
        if (CC_EDITOR) return;
        let checkState = this.watchPaths.length > 0;
        this.watchPaths.forEach((w, i) => {
            const v = this.VM.getValue(w);
            const state = this.conditionCheck(v, this.conditionValues[i], this.conditions[i]);
            if (!state) checkState = false;
        });

        this.setNodeState(this.node, checkState);
    }

    /**监听数据发生了变动的情况 */
    onValueChanged(n, o, pathArr: string[]) {
        this.setValue(n, o, pathArr);
    }

    // 值变化了
    async setValue(n, o?, pathArr?: string[]) {
        const path = pathArr.join('.');
        const index = this.watchPaths.indexOf(path);
        let checkState = this.conditionCheck(n, this.conditionValues[index], this.conditions[index]);
        for (let i = 0; i < this.watchPaths.length; i++) {
            if (i === index) continue;
            const w = this.watchPaths[i];
            const v = this.VM.getValue(w);
            let state = this.conditionCheck(v, this.conditionValues[i], this.conditions[i]);
            if (!state) checkState = false;
        }
        this.setNodeState(this.node, checkState);
    }

    /**条件检查 */
    private conditionCheck(v, a, condition, b?): boolean {
        let cod = CONDITION;
        switch (condition) {
            case cod['==']:
                if (`${v}` == a) return true;
                break;
            case cod['!=']:
                if (`${v}` != a) return true;
                break;
            case cod['<']:
                if (v < Number(a)) return true;
                break;
            case cod['>']:
                if (v > Number(a)) return true;
                break;
            case cod['>=']:
                if (v >= Number(a)) return true;
                break;
            case cod['<']:
                if (v < Number(a)) return true;
                break;
            case cod['<=']:
                if (v <= Number(a)) return true;
                break;
            case cod['range']:
                if (v >= Number(a) && v <= Number(b)) return true;
                break;

            default:
                break;
        }

        return false;
    }

    /**更新单个节点的状态 */
    private setNodeState(node: cc.Node, checkState?: boolean) {
        let n = this.valueAction;
        let check = checkState;
        let a = ACTION;
        switch (n) {
            case a.NODE_ACTIVE:
                node.active = check ? true : false;
                break;
            case a.NODE_VISIBLE:
                node.opacity = check ? 255 : 0;
                break;
            case a.NODE_COLOR:
                node.color = check ? this.valueActionColor : cc.color(255, 255, 255);
                break;
            case a.NODE_OPACITY:
                node.opacity = check ? this.valueActionOpacity : 255;
                break;

            case a.COMPONENT_CUSTOM:
                let comp = node.getComponent(this.valueComponentName);
                if (comp == null) return;
                if (this.valueComponentProperty in comp) {
                    comp[this.valueComponentProperty] = check
                        ? this.valueComponentActionValue
                        : this.valueComponentDefaultValue;
                }
                break;

            default:
                break;
        }
    }

    onDestroy() {
        super.onDestroy();
        this.setMultPathEvent(this.watchPaths, false);
    }
}
