import { DComponent } from './DComponent';
import { pom } from '../Manager/DJPopManager';
import { rem } from '../Manager/DJResManager';
import { SceneName } from '../Consts/Consts';
import { tool } from '../Util/Tool';

const { ccclass, property } = cc._decorator;

@ccclass
export class BaseScene extends DComponent {
    private onlyNodes: any = {};

    onLoad() {
        // cc.view.enableAutoFullScreen(true);
        cc.view.enableRetina(true);
        // cc.view.setDesignResolutionSize(1136, 640, cc.ResolutionPolicy.UNKNOWN);
        cc.view.setDesignResolutionSize(1136, 640, cc.ResolutionPolicy.FIXED_HEIGHT);
        cc.view.setResolutionPolicy(cc.ResolutionPolicy.NO_BORDER);
        // cc.view.setDesignResolutionSize(1136, 640, cc.ResolutionPolicy.SHOW_ALL);
        // cc.view.se
        // cc.view.setDesignResolutionSize(1136, 640, cc.ResolutionPolicy.EXACT_FIT);
        // cc.view.setFrameSize(document.body.clientWidth, document.body.clientHeight);
        cc.view.setOrientation(-90);
        this.fitIphoneX();
        this.node.children.forEach(n => {
            n.zIndex = 0;
        });
        this.showChangeSceneDialog();
        // if (oft.sks && oft.sks.isOpen()) {
        //     this.initData();
        // }
    }

    initData() {}

    showChangeSceneDialog() {
        if (rem.sceneName !== SceneName.LOGINSCENE) {
            pom.showChangeSceneDialogs();
        }
    }

    fitIphoneX() {
        if (tool.isIphoneX()) {
            const cvs = this.node.getComponent(cc.Canvas);
            // cvs.fitHeight = true;
            // cvs.fitWidth = true;
        }
    }

    /**
     * 向场景里添加节点(场景中有且只有一个，重复添加无效)
     * @param prefab 节点预制体
     * @param faterNode 往上添加的父节点
     * @param zIndex 在父节点的位置
     */
    async addOnlyNode<T>(faterNode: cc.Node, type: { prototype: T } | string, data?: any, zIndex?: number, x?, y?) {
        if (typeof type === 'string') type = cc.js.getClassByName(type);
        const node = faterNode.getChildByName((type as any).cname);
        if (node) {
            const comp = node.getComponent(node.name);
            node.active = true;
            if (comp && comp.initData) comp.initData(data);
        } else {
            const comp = await (type as any).loadPackage(type);
            this.addNode(faterNode, comp.node, data, zIndex);
        }
        return node;
    }

    /**
     * 添加子节点
     * @param faterNode
     * @param prefab
     * @param zIndex
     */
    addNode(faterNode: cc.Node, node: cc.Node, data?: any, zIndex?: number, x?, y?) {
        if (zIndex) node.zIndex = zIndex;
        faterNode.addChild(node);
        const comp = node.getComponent(node.name);
        if (comp && comp.initData) comp.initData(data);
        return node;
    }

    removeOnlyNode(nodeName?: string) {
        if (nodeName) {
            const node = this.onlyNodes[nodeName];
            delete this.onlyNodes[nodeName];
            node ? node.destory() : null;
        } else {
            Object.keys(this.onlyNodes).map(() => {});
        }
    }

    /**
     * 测试nodePool
     */
    async addITost() {}

    onDestroy() {
        super.onDestroy();
    }
}
